import { Effect, Stream, Console, pipe, Layer, Context, Option, Chunk } from "effect";
import type { AgentAction, AgentFinish, AgentStep } from "@langchain/core/agents";
import type { ReactAgent } from "langchain";

// Types for agent execution steps
export interface AgentStepEvent {
  readonly _tag: "AgentStep";
  readonly action: AgentAction;
  readonly observation: string;
}

export interface AgentFinishEvent {
  readonly _tag: "AgentFinish";
  readonly output: Record<string, unknown>;
}

export interface AgentErrorEvent {
  readonly _tag: "AgentError";
  readonly error: unknown;
}

export type AgentEvent = AgentStepEvent | AgentFinishEvent | AgentErrorEvent;

// Service for observable agent
export class ObservableAgentService extends Context.Tag("ObservableAgentService")<
  ObservableAgentService,
  {
    readonly runObservable: (
      agent: ReactAgent,
      input: string
    ) => Stream.Stream<AgentEvent, Error>;
    readonly run: (
      agent: ReactAgent,
      input: string
    ) => Effect.Effect<AgentFinishEvent, Error>;
  }
>() {}

// Create agent step event
const createStepEvent = (step: AgentStep): AgentStepEvent => ({
  _tag: "AgentStep",
  action: step.action,
  observation: step.observation,
});

// Create agent finish event
const createFinishEvent = (output: Record<string, unknown>): AgentFinishEvent => ({
  _tag: "AgentFinish",
  output,
});

// Create error event
const createErrorEvent = (error: unknown): AgentErrorEvent => ({
  _tag: "AgentError",
  error,
});

// Log agent event with structured logging
const logAgentEvent = (event: AgentEvent): Effect.Effect<void> =>
  Effect.gen(function* () {
    switch (event._tag) {
      case "AgentStep":
        yield* Effect.log(`[Agent Step] Tool: ${event.action.tool}`);
        yield* Effect.log(`[Agent Step] Input: ${JSON.stringify(event.action.toolInput).slice(0, 200)}`);
        if (event.observation !== "pending...") {
          yield* Effect.log(`[Agent Step] Observation: ${JSON.stringify(event.observation).slice(0, 200)}`);
        }
        break;
      case "AgentFinish":
        yield* Effect.log(`[Agent Finish] Output: ${JSON.stringify(event.output).slice(0, 200)}`);
        break;
      case "AgentError":
        yield* Effect.logError(`[Agent Error] ${String(event.error)}`);
        break;
    }
  });

// Stream agent execution with callbacks
export const createObservableAgentStream = (
  agent: ReactAgent,
  input: string
): Stream.Stream<AgentEvent, Error> =>
  Stream.async<AgentEvent, Error>((emit) => {
    const runAgent = async () => {
      try {
        const result = await agent.invoke(
          { messages: [input] },
          {
            callbacks: [
              {
                handleAgentAction(action: AgentAction) {
                  emit.single({
                    _tag: "AgentStep",
                    action,
                    observation: "pending...",
                  } as AgentStepEvent);
                },
                handleAgentEnd(output: AgentFinish) {
                  emit.single(createFinishEvent(output.returnValues));
                  emit.end();
                },
                handleToolEnd(output: string, runId: string) {
                  emit.single({
                    _tag: "AgentStep",
                    action: { tool: "tool_result", toolInput: {}, log: "" },
                    observation: output,
                  } as AgentStepEvent);
                },
              },
            ],
          }
        );
        
        // If callbacks didn't fire handleAgentEnd, emit finish event from result
        // This handles cases where the agent completes without the callback being called
        if (result && result.messages) {
          const lastMessage = result.messages[result.messages.length - 1];
          if (lastMessage) {
            emit.single(createFinishEvent({ 
              output: lastMessage.content,
              messages: result.messages 
            }));
          }
        }
        emit.end();
      } catch (error) {
        console.error("[Observable Agent] Error:", error);
        emit.fail(error instanceof Error ? error : new Error(String(error)));
      }
    };

    runAgent();
  });

// Run agent and collect all events, returning final output
export const runObservableAgent = (
  agent: ReactAgent,
  input: string
): Effect.Effect<AgentFinishEvent, Error> =>
  Effect.gen(function* () {
    yield* Effect.log("[runObservableAgent] Starting stream collection...");
    
    const events = yield* pipe(
      createObservableAgentStream(agent, input),
      Stream.tap((event) => logAgentEvent(event)),
      Stream.runCollect
    );

    yield* Effect.log(`[runObservableAgent] Collected ${Chunk.size(events)} events`);

    const finishEvent = Chunk.findFirst(
      events,
      (event): event is AgentFinishEvent => event._tag === "AgentFinish"
    );

    return yield* Option.match(finishEvent, {
      onNone: () => {
        // Log all events for debugging
        const eventTags = Chunk.toReadonlyArray(events).map(e => e._tag);
        return Effect.fail(new Error(`Agent did not produce a final output. Events: ${eventTags.join(", ")}`));
      },
      onSome: (event) => Effect.succeed(event),
    });
  });

// Live implementation of the service
export const ObservableAgentServiceLive = Layer.succeed(
  ObservableAgentService,
  {
    runObservable: createObservableAgentStream,
    run: runObservableAgent,
  }
);

// Convenience function to run with logging each step as a generator
export const observeAgent = (
  agent: ReactAgent,
  input: string
): Effect.Effect<
  { steps: ReadonlyArray<AgentStepEvent>; result: AgentFinishEvent },
  Error
> =>
  Effect.gen(function* () {
    yield* Effect.log("[observeAgent] Starting observation...");
    const steps: AgentStepEvent[] = [];
    let result: AgentFinishEvent | null = null;

    yield* pipe(
      createObservableAgentStream(agent, input),
      Stream.tap((event) =>
        Effect.gen(function* () {
          yield* logAgentEvent(event);
          if (event._tag === "AgentStep") {
            steps.push(event);
          } else if (event._tag === "AgentFinish") {
            result = event;
          }
        })
      ),
      Stream.runDrain
    );

    yield* Effect.log(`[observeAgent] Stream drained. Steps: ${steps.length}, Has result: ${result !== null}`);

    if (!result) {
      return yield* Effect.fail(new Error("Agent did not complete - no finish event received"));
    }

    yield* Effect.log("[observeAgent] Returning result");
    return { steps, result };
  });

// Export for direct usage with Effect.runPromise
export const runAgent = (agent: ReactAgent, input: string) =>
  Effect.runPromise(runObservableAgent(agent, input));
