import { Effect, pipe, Schema, Data, Console } from "effect";
import { planningAgent } from "agents/planning";
import sd from 'screenshot-desktop';
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// ============================================================================
// Error Models - using Data.TaggedEnum for better DX
// ============================================================================

class AgentInvocationError extends Data.TaggedError("AgentInvocationError")<{
  readonly cause: unknown;
}> {}

class ScreenshotError extends Data.TaggedError("ScreenshotError")<{
  readonly cause: unknown;
}> {}

class FileWriteError extends Data.TaggedError("FileWriteError")<{
  readonly cause: unknown;
  readonly path: string;
}> {}

class PythonPipelineError extends Data.TaggedError("PythonPipelineError")<{
  readonly cause: unknown;
  readonly stderr?: string;
}> {}

class JsonParseError extends Data.TaggedError("JsonParseError")<{
  readonly cause: unknown;
  readonly rawOutput: string;
}> {}

// ============================================================================
// Domain Schemas
// ============================================================================

// Define your expected vision pipeline output schema
const VisionResult = Schema.Struct({
  detections: Schema.Array(
    Schema.Struct({
      label: Schema.String,
      confidence: Schema.Number,
      bbox: Schema.optional(
        Schema.Struct({
          x: Schema.Number,
          y: Schema.Number,
          width: Schema.Number,
          height: Schema.Number,
        })
      ),
    })
  ),
  summary: Schema.optional(Schema.String),
  timestamp: Schema.optional(Schema.String),
});

type VisionResult = typeof VisionResult.Type;

// ============================================================================
// Service Layer - using Effect generators
// ============================================================================

/**
 * Invoke planning agent
 */
const invokeAgent = (userInput: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Invoking agent with input: ${userInput}`);
    
    const response = yield* Effect.tryPromise({
      try: () =>
        planningAgent.invoke({
          messages: [{ role: "user", content: userInput }],
        }),
      catch: (cause) => new AgentInvocationError({ cause }),
    });

    yield* Effect.logDebug(`Agent response received`);
    return response;
  });

/**
 * Take a screenshot
 */
const takeScreenshot = Effect.gen(function* () {
  yield* Effect.logInfo("Capturing screenshot...");
  
  const img = yield* Effect.tryPromise({
    try: () => sd({ format: "png" }),
    catch: (cause) => new ScreenshotError({ cause }),
  });

  yield* Effect.logInfo(`Screenshot captured: ${img.length} bytes`);
  return img;
});

/**
 * Write screenshot to disk
 */
const saveScreenshot = (path: string, img: Buffer) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Writing screenshot to ${path}...`);
    
    yield* Effect.tryPromise({
      try: () => writeFile(path, img),
      catch: (cause) => new FileWriteError({ cause, path }),
    });

    yield* Effect.logInfo("Screenshot saved successfully");
    return path;
  });

/**
 * Run the Python vision pipeline
 */
const runVisionPipeline = (scriptPath: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Executing Python pipeline: ${scriptPath}`);
    
    const { stdout, stderr } = yield* Effect.tryPromise({
      try: () => execAsync(`python3 ${scriptPath}`),
      catch: (cause) => new PythonPipelineError({ cause }),
    });

    if (stderr) {
      yield* Effect.logWarning(`Python stderr: ${stderr}`);
    }

    yield* Effect.logInfo("Python pipeline completed");
    return stdout;
  });

/**
 * Parse JSON output with schema validation
 */
const parseVisionOutput = (rawOutput: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo("Parsing vision pipeline output...");
    
    // First, try to parse as JSON
    const parsed = yield* Effect.tryPromise({
      try: () => Promise.resolve(JSON.parse(rawOutput)),
      catch: (cause) => new JsonParseError({ cause, rawOutput }),
    });

    // Then validate against schema
    const validated = yield* Schema.decodeUnknown(VisionResult)(parsed, {
      errors: "all",
      onExcessProperty: "preserve",
    }).pipe(
      Effect.mapError(
        (error) =>
          new JsonParseError({
            cause: error,
            rawOutput,
          })
      )
    );

    yield* Effect.logInfo(
      `Parsed ${validated.detections.length} detections`
    );
    return validated;
  });

// ============================================================================
// Complete Pipeline - using generator style
// ============================================================================

const screenshotPipeline = Effect.gen(function* () {
  yield* Effect.logInfo("=== Starting Screenshot Pipeline ===");

  // Take screenshot
  const img = yield* takeScreenshot;

  // Wait 10 seconds
  yield* Effect.sleep("10 seconds");

  // Save to disk
  const screenshotPath = resolve(__dirname, "screenshot.png");
  yield* saveScreenshot(screenshotPath, img);

  // Run vision pipeline
  const scriptPath = resolve(__dirname, "screenshot_pipeline.py");
  const rawOutput = yield* runVisionPipeline(scriptPath);

  // Parse and validate output
  const visionResult = yield* parseVisionOutput(rawOutput);

  yield* Effect.logInfo("=== Pipeline Complete ===");
  return visionResult;
});

// ============================================================================
// Alternative: Pipe-based version (more functional)
// ============================================================================

const screenshotPipelinePipe = pipe(
  takeScreenshot,
  Effect.flatMap((img) =>
    pipe(
      saveScreenshot(resolve(__dirname, "screenshot.png"), img),
      Effect.as(img)
    )
  ),
  Effect.flatMap(() =>
    runVisionPipeline(resolve(__dirname, "screenshot_pipeline.py"))
  ),
  Effect.flatMap(parseVisionOutput),
  Effect.tap((result) =>
    Effect.logInfo(`Found ${result.detections.length} detections`)
  )
);

// ============================================================================
// Error Recovery & Retry
// ============================================================================

import { Schedule } from "effect";

const screenshotPipelineWithRetry = pipe(
  screenshotPipeline,
  Effect.retry(
    Schedule.exponential("100 millis").pipe(
      Schedule.intersect(Schedule.recurs(3))
    )
  ),
  Effect.catchTags({
    ScreenshotError: (error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Screenshot failed, using fallback");
        // Could return a default/mock result here
        return Effect.fail(error);
      }),
    JsonParseError: (error) =>
      Effect.gen(function* () {
        yield* Effect.logError(
          `Failed to parse JSON. Raw output:\n${error.rawOutput}`
        );
        // Could attempt alternative parsing strategies
        return Effect.fail(error);
      }),
  })
);

// ============================================================================
// Running the Pipeline
// ============================================================================

/**
 * Main execution with comprehensive error handling
 */
const main = Effect.gen(function* () {
  yield* Console.log("Starting application...");

  const result = yield* screenshotPipeline;

  yield* Console.log("\n=== Vision Pipeline Results ===");
  yield* Console.log(`Detections: ${result.detections.length}`);
  
  for (const detection of result.detections) {
    yield* Console.log(
      `  - ${detection.label} (${(detection.confidence * 100).toFixed(1)}%)`
    );
  }

  if (result.summary) {
    yield* Console.log(`\nSummary: ${result.summary}`);
  }

  return result;
});

// Run with proper error handling
const runnable = pipe(
  main,
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError("Pipeline failed with error:");
      yield* Effect.logError(JSON.stringify(error, null, 2));
      return Effect.fail(error);
    })
  )
);

Effect.runPromise(runnable)
  .then((result) => {
    console.log("\n✅ Pipeline completed successfully");
  })
  .catch((error) => {
    console.error("\n❌ Pipeline failed:", error);
    process.exit(1);
  });
