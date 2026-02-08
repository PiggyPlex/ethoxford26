import { Effect, Stream, pipe } from "effect";
import type { AgentExecutor } from "langchain/agents";
import {
  createObservableAgentStream,
  observeAgent,
  runObservableAgent,
  ObservableAgentService,
  ObservableAgentServiceLive,
} from "./observable_agent";

// Example 1: Stream each step with custom handling
const streamExample = (executor: AgentExecutor, prompt: string) =>
  Effect.gen(function* () {
    yield* pipe(
      createObservableAgentStream(executor, prompt),
      Stream.tap((event) =>
        Effect.sync(() => {
          console.log("Received event:", event._tag);
        })
      ),
      Stream.filter((event) => event._tag === "AgentFinish"),
      Stream.take(1),
      Stream.runHead
    );
  });

// Example 2: Use the service pattern
const serviceExample = (executor: AgentExecutor, prompt: string) =>
  Effect.gen(function* () {
    const service = yield* ObservableAgentService;
    const result = yield* service.run(executor, prompt);
    return result.output;
  }).pipe(Effect.provide(ObservableAgentServiceLive));

// Example 3: Observe all steps and get final result
const observeExample = (executor: AgentExecutor, prompt: string) =>
  Effect.gen(function* () {
    const { steps, result } = yield* observeAgent(executor, prompt);

    yield* Effect.log(`Completed with ${steps.length} intermediate steps`);
    yield* Effect.log(`Final output: ${JSON.stringify(result.output)}`);

    return result;
  });

// Example 4: Transform stream to only yield tool calls
const toolCallsOnly = (executor: AgentExecutor, prompt: string) =>
  pipe(
    createObservableAgentStream(executor, prompt),
    Stream.filter((event) => event._tag === "AgentStep"),
    Stream.map((event) => {
      if (event._tag === "AgentStep") {
        return {
          tool: event.action.tool,
          input: event.action.toolInput,
        };
      }
      return null;
    }),
    Stream.filter((x): x is NonNullable<typeof x> => x !== null)
  );

export { streamExample, serviceExample, observeExample, toolCallsOnly };
