import { Effect, pipe, Schedule, Duration, Fiber } from "effect";
import { screenshotContextAgent } from "agents/screenshot_context";
import { summaryContextAgent } from "agents/summary_context_agent";
import { planningAgent } from "agents/planning";
import { connectToDatabase } from './utils/mongodb';
import { 
  observeAgent,
  type AgentEvent,
  type AgentFinishEvent
} from './utils/observable_agent';
import { createStage, runStage, chain } from './utils/agent_pipeline';

const CONTEXT_INTERVAL = Duration.minutes(2);
const SECOND_BRAIN_INTERVAL = Duration.minutes(10);

const CONTEXT_PROMPT = 'TASK: Summarise what the user is doing on their computer in-depth\nINPUT: Use the screenshot tool to capture the current screen. Use the get windows tool to get current window and all open windows\' data.\nORDER: 1. Get windows, 2. Screenshot\nCONSTRAINTS: You MUST use the window and screenshot tools, then save your observations using the save_context_note tool. Use concise language for robot format (short; broken English)\nOUTPUT: None (use save_context_note to persist the information)';

const SUMMARY_PROMPT = `TASK: Analyze recent user activity and create comprehensive summary
INPUT: Fetch recent context notes using fetch_context_notes tool
PROCESSING: 1. Retrieve context notes 2. Identify patterns 3. Infer goals 4. Predict needs
CONSTRAINTS: Must use fetch_context_notes first. Must save summary using save_user_summary tool. Use concise language
OUTPUT: None (use save_user_summary to persist: currentActivity, recentActivities, inferredGoals, potentialNeeds, futureActions)`;

const buildPlanningPrompt = (summaryContext: string): string => `TASK: Proactively assist user as summary-planning
INPUT: ${summaryContext}
PROCESSING: 1. fetch_user_summary to get latest context 2. Analyze what user needs 3. Use appropriate tools to help 4. Whenever you have found something useful, let the user know using the suggest content tool
TOOLS_PRIORITY: 
  - Meeting soon? → check calendar, prepare info
  - Researching topic? → web_search for relevant info  
  - Working on project? → check files, gather context
  - Listening to music? → suggest playlist based on activity
  - Weather-dependent plans? → get_weather
CONSTRAINTS: Must fetch_user_summary first. Must save_proactive_action after helping. Do NOT interrupt user. Gather info silently.
OUTPUT: Take 1-2 proactive actions. Save each action taken.`;

// Pipeline stages
const summaryStage = createStage<void, string>(
  "SummaryAgent",
  summaryContextAgent,
  () => SUMMARY_PROMPT,
  (result: AgentFinishEvent) => JSON.stringify(result.output)
);

const planningStage = createStage<string, void>(
  "PlanningAgent", 
  planningAgent,
  (summaryContext: string) => buildPlanningPrompt(summaryContext),
  () => undefined
);

// Chained summary-planning pipeline: Summary → Planning
const summaryPlanningPipeline = chain(summaryStage, planningStage);

// Handler for logging agent events with colors
const handleAgentEvent = (agentName: string) => (event: AgentEvent) =>
  Effect.gen(function* () {
    const timestamp = new Date().toISOString();
    switch (event._tag) {
      case "AgentStep":
        yield* Effect.log(`[${timestamp}] [${agentName}] 🔧 Tool: ${event.action.tool}`);
        yield* Effect.log(`[${timestamp}] [${agentName}] 📥 Input: ${JSON.stringify(event.action.toolInput).slice(0, 200)}...`);
        if (event.observation !== "pending...") {
          yield* Effect.log(`[${timestamp}] [${agentName}] 📤 Observation:`, event.observation);
        }
        break;
      case "AgentFinish":
        yield* Effect.log(`[${timestamp}] [${agentName}] ✅ Completed: ${JSON.stringify(event.output).slice(0, 300)}`);
        break;
      case "AgentError":
        yield* Effect.logError(`[${timestamp}] [${agentName}] ❌ Error: ${String(event.error)}`);
        break;
    }
  });

// Run context agent with observable streaming
const runContextAgentWithLogging = Effect.gen(function* () {
  yield* Effect.log("🔍 Starting context capture...");
  
  const { steps, result } = yield* observeAgent(screenshotContextAgent, CONTEXT_PROMPT);
  
  yield* Effect.log(`📊 Context capture completed with ${steps.length} steps`);
  return result;
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Context agent failed: ${error}`);
      return null;
    })
  )
);

// Run summary-planning pipeline (summary → planning)
const runSummaryPlanningPipeline = Effect.gen(function* () {
  yield* Effect.log("🧠 Starting summary-planning pipeline...");
  yield* Effect.log("   Phase 1: Generating user summary");
  yield* Effect.log("   Phase 2: Proactive planning & assistance");
  
  const result = yield* summaryPlanningPipeline(undefined);
  
  yield* Effect.log(`🧠 Summary-planning completed - ${result.steps.length} total steps`);
  return result;
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Summary-planning pipeline failed: ${error}`);
      return null;
    })
  )
);

// Main program using Effect
const program = Effect.gen(function* () {
  // Connect to database
  yield* connectToDatabase();
  yield* Effect.log("✅ Database connected");

  // Context capture task (every 2 mins)
  const contextTask = pipe(
    runContextAgentWithLogging,
    Effect.tap(() => Effect.log("🔄 Context capture cycle completed")),
    Effect.repeat(Schedule.spaced(CONTEXT_INTERVAL))
  );

  // Summary-planning task (every 10 mins) - runs summary then planning
  const secondBrainTask = pipe(
    runSummaryPlanningPipeline,
    Effect.tap(() => Effect.log("🔄 Summary-planning cycle completed")),
    Effect.repeat(Schedule.spaced(SECOND_BRAIN_INTERVAL))
  );

  // Fork both tasks to run concurrently in background
  const contextFiber = yield* Effect.fork(contextTask);
  const secondBrainFiber = yield* Effect.fork(secondBrainTask);

  yield* Effect.log(`🚀 Background agents started`);
  yield* Effect.log(`   📸 Context agent: every ${Duration.toMillis(CONTEXT_INTERVAL) / 60000} mins`);
  yield* Effect.log(`   🧠 Summary-planning (summary→planning): every ${Duration.toMillis(SECOND_BRAIN_INTERVAL) / 60000} mins`);

  // Keep fibers alive - wait for both (they run forever due to repeat)
  yield* Fiber.join(secondBrainFiber);
  yield* Fiber.join(contextFiber);
});

// Run the program
Effect.runPromise(program).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

// Keep the process alive
process.stdin.resume();
