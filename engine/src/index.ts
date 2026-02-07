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
import { initSocketServer } from './server/socket';
import { initChatHandler, cleanupConversation } from './server/chat_handler';

const CONTEXT_INTERVAL = Duration.minutes(1);
const SHORT_TERM_PLANNER_INTERVAL = Duration.minutes(5);
const LONG_TERM_PLANNER_INTERVAL = Duration.minutes(15);

const CONTEXT_PROMPT = 'TASK: Summarise what the user is doing on their computer in-depth. Keep note of all brands/interests where available (e.g., song genres, fashion styles, tech stacks)\nINPUT: Use the screenshot tool to capture the current screen. Use the get windows tool to get current window and all open windows\' data.\nORDER: 1. Get windows, 2. Screenshot\nCONSTRAINTS: You MUST use the window and screenshot tools, then save your observations using the save_context_note tool. Use concise language for robot format (short; broken English)\nOUTPUT: None (use save_context_note to persist the information)';

const buildSummaryPrompt = (snapshotCount: number): string => `TASK: Analyze recent user activity, extract interests, and create comprehensive summary
INPUT: Fetch the last ${snapshotCount} context notes using fetch_context_notes tool (set limit to ${snapshotCount})
PROCESSING: 
  1. Retrieve ${snapshotCount} context notes 
  2. Identify patterns and interests (brands, topics, activities)
  3. For each distinct interest detected, use add_user_interest to save it
  4. Infer goals 
  5. Predict needs
CONSTRAINTS: 
  - Must use fetch_context_notes first with limit=${snapshotCount}
  - Must use add_user_interest for any brands, topics, or subjects the user shows interest in
  - Must save summary using save_user_summary tool
  - Use concise language
OUTPUT: None (use add_user_interest for interests, save_user_summary for: currentActivity, recentActivities, inferredGoals, potentialNeeds, futureActions)`;

const buildPlanningPrompt = (summaryContext: string, plannerType: string): string => `TASK: Proactively assist user as ${plannerType}
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

// Short-term pipeline stages (last 2 snapshots)
const shortTermSummaryStage = createStage<void, string>(
  "ShortTermSummaryAgent",
  summaryContextAgent,
  () => buildSummaryPrompt(2),
  (result: AgentFinishEvent) => JSON.stringify(result.output)
);

const shortTermPlanningStage = createStage<string, void>(
  "ShortTermPlanningAgent", 
  planningAgent,
  (summaryContext: string) => buildPlanningPrompt(summaryContext, "short-term-planner"),
  () => undefined
);

// Long-term pipeline stages (last 6 snapshots)
const longTermSummaryStage = createStage<void, string>(
  "LongTermSummaryAgent",
  summaryContextAgent,
  () => buildSummaryPrompt(6),
  (result: AgentFinishEvent) => JSON.stringify(result.output)
);

const longTermPlanningStage = createStage<string, void>(
  "LongTermPlanningAgent", 
  planningAgent,
  (summaryContext: string) => buildPlanningPrompt(summaryContext, "long-term-planner"),
  () => undefined
);

// Chained pipelines
const shortTermPlanningPipeline = chain(shortTermSummaryStage, shortTermPlanningStage);
const longTermPlanningPipeline = chain(longTermSummaryStage, longTermPlanningStage);

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

// Run short-term planning pipeline (last 2 snapshots)
const runShortTermPlanningPipeline = Effect.gen(function* () {
  yield* Effect.log("⚡ Starting short-term planner (last 2 snapshots)...");
  yield* Effect.log("   Phase 1: Generating user summary from recent activity");
  yield* Effect.log("   Phase 2: Immediate proactive planning & assistance");
  
  const result = yield* shortTermPlanningPipeline(undefined);
  
  yield* Effect.log(`⚡ Short-term planner completed - ${result.steps.length} total steps`);
  return result;
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Short-term planner failed: ${error}`);
      return null;
    })
  )
);

// Run long-term planning pipeline (last 6 snapshots)
const runLongTermPlanningPipeline = Effect.gen(function* () {
  yield* Effect.log("🧠 Starting long-term planner (last 6 snapshots)...");
  yield* Effect.log("   Phase 1: Generating comprehensive user summary");
  yield* Effect.log("   Phase 2: Strategic proactive planning & assistance");
  
  const result = yield* longTermPlanningPipeline(undefined);
  
  yield* Effect.log(`🧠 Long-term planner completed - ${result.steps.length} total steps`);
  return result;
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Long-term planner failed: ${error}`);
      return null;
    })
  )
);

// Main program using Effect
const program = Effect.gen(function* () {
  // Initialize Socket.IO server
  const io = yield* initSocketServer(3001);
  yield* Effect.log("✅ Socket.IO server initialized on port 3001");

  // Initialize chat handler
  yield* initChatHandler();
  yield* Effect.log("✅ Chat handler initialized");

  // Set up cleanup on socket disconnect
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      cleanupConversation(socket.id);
    });
  });

  // Connect to database
  yield* connectToDatabase();
  yield* Effect.log("✅ Database connected");

  // Context capture task (every 30 secs)
  const contextTask = pipe(
    runContextAgentWithLogging,
    Effect.tap(() => Effect.log("🔄 Context capture cycle completed")),
    Effect.repeat(Schedule.spaced(CONTEXT_INTERVAL))
  );

  // Short-term planner task (every 1 min) - uses last 2 snapshots
  const shortTermPlannerTask = pipe(
    runShortTermPlanningPipeline,
    Effect.tap(() => Effect.log("🔄 Short-term planner cycle completed")),
    Effect.repeat(Schedule.spaced(SHORT_TERM_PLANNER_INTERVAL))
  );

  // Long-term planner task (every 2 mins) - uses last 6 snapshots
  const longTermPlannerTask = pipe(
    runLongTermPlanningPipeline,
    Effect.tap(() => Effect.log("🔄 Long-term planner cycle completed")),
    Effect.repeat(Schedule.spaced(LONG_TERM_PLANNER_INTERVAL))
  );

  // Fork all tasks to run concurrently in background
  const contextFiber = yield* Effect.fork(contextTask);
  const shortTermFiber = yield* Effect.fork(shortTermPlannerTask);
  const longTermFiber = yield* Effect.fork(longTermPlannerTask);

  yield* Effect.log(`🚀 Background agents started`);
  yield* Effect.log(`   📸 Context agent: every ${Duration.toMillis(CONTEXT_INTERVAL) / 60000} mins`);
  yield* Effect.log(`   ⚡ Short-term planner (2 snapshots): every ${Duration.toMillis(SHORT_TERM_PLANNER_INTERVAL) / 60000} mins`);
  yield* Effect.log(`   🧠 Long-term planner (6 snapshots): every ${Duration.toMillis(LONG_TERM_PLANNER_INTERVAL) / 60000} mins`);
  yield* Effect.log(`   💬 Chat gateway: ready on ws://localhost:3001`);

  // Keep fibers alive - wait for all (they run forever due to repeat)
  yield* Fiber.join(longTermFiber);
  yield* Fiber.join(shortTermFiber);
  yield* Fiber.join(contextFiber);
});

// Run the program
Effect.runPromise(program).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

// Keep the process alive
process.stdin.resume();
