import { Effect, pipe, Schema, Data, Console } from "effect";
import { tool } from "langchain";
import { openWindows } from "get-windows";

export const getWindows = tool(
    async () => {
        console.log('Calling windows tool')
        const program = pipe(
        Effect.tryPromise({
            try: () => openWindows({
                accessibilityPermission: false,
                screenRecordingPermission: false,
            }),
            catch: (error) => new Error(`Failed to get active window: ${error}`),
        }),
        Effect.flatMap((windows) =>
            windows.length > 0
            ? Effect.succeed(JSON.stringify(windows.map((window) => ({
                title: window.title,
                owner: window.owner,
                /**
                 * Safari URL
                 */
                url: window.platform === 'macos' ? window.url : undefined,
            }))))
            : Effect.fail(new Error("No active windows found"))
        ),
        Effect.tap((windows) => Effect.log(windows)));
        return await Effect.runPromise(program);
    },
    {
        name: "get_windows",
        description: "Get currently open windows. Windows are returned in order from front to back. Active window is the first.",
    }
);