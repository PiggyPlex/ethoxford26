import * as path from "path";
import { Effect } from "effect";

const NOTES_DIR = path.resolve(__dirname, "../../notes");

// validate and resolve path within notes folder
export const safePath = (filename: string): Effect.Effect<string, Error> => {
  return Effect.try({
    try: () => {
      const resolved = path.resolve(NOTES_DIR, filename);
      const notesResolved = path.resolve(NOTES_DIR);
      
      if (!resolved.startsWith(notesResolved)) {
        throw new Error("Access denied: Path outside of notes folder");
      }
      return resolved;
    },
    catch: (e) => new Error(`Invalid path: ${e}`),
  });
};