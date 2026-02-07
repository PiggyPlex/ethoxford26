import { Effect, pipe, Option } from "effect";
import type { ReactAgent } from "langchain";
import { observeAgent, type AgentFinishEvent, type AgentStepEvent } from "./observable_agent";

// Generic agent result type
export interface AgentResult<T = Record<string, unknown>> {
  readonly steps: ReadonlyArray<AgentStepEvent>;
  readonly result: AgentFinishEvent;
  readonly data: T;
}

// Pipeline stage definition
export interface PipelineStage<TInput, TOutput> {
  readonly name: string;
  readonly agent: ReactAgent;
  readonly buildPrompt: (input: TInput) => string;
  readonly extractOutput: (result: AgentFinishEvent) => TOutput;
}

// Create a pipeline stage
export const createStage = <TInput, TOutput>(
  name: string,
  agent: ReactAgent,
  buildPrompt: (input: TInput) => string,
  extractOutput: (result: AgentFinishEvent) => TOutput
): PipelineStage<TInput, TOutput> => ({
  name,
  agent,
  buildPrompt,
  extractOutput,
});

// Run a single pipeline stage
export const runStage = <TInput, TOutput>(
  stage: PipelineStage<TInput, TOutput>,
  input: TInput
): Effect.Effect<AgentResult<TOutput>, Error> =>
  Effect.gen(function* () {
    const prompt = stage.buildPrompt(input);
    yield* Effect.log(`🎯 [${stage.name}] Starting with prompt length: ${prompt.length}`);
    
    const { steps, result } = yield* observeAgent(stage.agent, prompt);
    const data = stage.extractOutput(result);
    
    yield* Effect.log(`✅ [${stage.name}] Completed with ${steps.length} steps`);
    
    return { steps, result, data };
  });

// Chain two pipeline stages
export const chain = <A, B, C>(
  first: PipelineStage<A, B>,
  second: PipelineStage<B, C>
): ((input: A) => Effect.Effect<AgentResult<C>, Error>) =>
  (input: A) =>
    Effect.gen(function* () {
      yield* Effect.log(`🔗 Chaining stages: ${first.name} → ${second.name}`);
      yield* Effect.log(`▶️ Run first stage: ${first.name}`);
      
      const firstResult = yield* runStage(first, input).pipe(
        Effect.tapError((error) => 
          Effect.log(`❌ First stage failed: ${error}`)
        )
      );
      
      yield* Effect.log(`✅ First stage completed. Output type: ${typeof firstResult.data}`);
      yield* Effect.log(`📦 First stage data: ${JSON.stringify(firstResult.data).slice(0, 200)}...`);
      yield* Effect.log(`▶️ Run second stage: ${second.name}`);
      
      const secondResult = yield* runStage(second, firstResult.data).pipe(
        Effect.tapError((error) => 
          Effect.log(`❌ Second stage failed: ${error}`)
        )
      );
      
      yield* Effect.log(`✅ Second stage completed. Output: ${JSON.stringify(secondResult.data)}`);
      return secondResult;
    });

// Chain multiple stages sequentially
export const pipeline = <TInput>(
  ...stages: PipelineStage<any, any>[]
): ((input: TInput) => Effect.Effect<AgentResult<unknown>, Error>) =>
  (input: TInput) =>
    Effect.gen(function* () {
      let currentInput: unknown = input;
      let lastResult: AgentResult<unknown> | null = null;

      for (const stage of stages) {
        lastResult = yield* runStage(stage, currentInput);
        currentInput = lastResult.data;
      }

      if (!lastResult) {
        return yield* Effect.fail(new Error("Pipeline has no stages"));
      }

      return lastResult;
    });

// Run stage with optional fallback
export const runStageWithFallback = <TInput, TOutput>(
  stage: PipelineStage<TInput, TOutput>,
  input: TInput,
  fallback: TOutput
): Effect.Effect<AgentResult<TOutput>, never> =>
  pipe(
    runStage(stage, input),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logWarning(`[${stage.name}] Failed with error: ${error}, using fallback`);
        return {
          steps: [] as ReadonlyArray<AgentStepEvent>,
          result: { _tag: "AgentFinish" as const, output: {} },
          data: fallback,
        };
      })
    )
  );
