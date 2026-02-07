import { Effect, pipe } from "effect";
import { planningAgent } from "agents/planning";

// Function to invoke the agent based on user input
const invokeAgent = async (userInput: string) => {
  const program = pipe(
    Effect.tryPromise({
      try: () => planningAgent.invoke({
        messages: [{ role: "user", content: userInput }],
      }),
      catch: (error) => new Error(`Agent invocation failed: ${error}`),
    })
  );

  return Effect.runPromise(program);
};

// Example usage
// const userInput = "Write a summary of the latest news in technology and save it to my notes.";
// const userInput = 'write my calendar events into a note called "calendar_events.txt" for the next 7 days';
// const userInput = 'what am I listening to on spotify';
// invokeAgent(userInput)
//   .then(response => console.log(response))
//   .catch(error => console.error(error));

import sd from 'screenshot-desktop';
import { writeFileSync } from "node:fs";


/**
 * Errors we explicitly model
 */
class ScreenshotError {
  readonly _tag = "ScreenshotError";
  constructor(readonly cause: unknown) {}
}

class FileWriteError {
  readonly _tag = "FileWriteError";
  constructor(readonly cause: unknown) {}
}

/**
 * Take a screenshot
 */
const takeScreenshot = Effect.tryPromise({
  try: () => sd({ format: "png" }),
  catch: (cause) => new ScreenshotError(cause),
});

/**
 * Write screenshot to disk
 */
const saveScreenshot = (path: string, img: Buffer) =>
  Effect.tryPromise({
    try: () => writeFile(path, img),
    catch: (cause) => new FileWriteError(cause),
  });

/**
 * Full pipeline
 */
const screenshotPipeline = pipe(
  takeScreenshot,
  Effect.tap(() =>
    Effect.logInfo("Screenshot captured")
  ),
  Effect.flatMap((img) =>
    saveScreenshot("screenshot.png", img)
  ),
  Effect.tap(() =>
    Effect.logInfo("Screenshot written to screenshot.png")
  )
);

/**
 * Run it
 */
Effect.runPromise(screenshotPipeline).catch((err) => {
  console.error("Pipeline failed:", err);
});

