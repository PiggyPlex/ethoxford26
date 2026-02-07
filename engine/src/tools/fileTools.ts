import * as fs from "fs/promises";
import { Effect, pipe } from "effect";
import * as z from "zod";
import { tool } from "langchain";
import { safePath } from "../utils/safePath";

// Tool to list files in the notes directory
export const listFiles = tool(
  async () => {
    const program = pipe(
      Effect.tryPromise({
        try: async () => {
          const files = await fs.readdir("./notes");
          return files.length > 0 
            ? `Files in notes folder:\n${files.map(f => `- ${f}`).join("\n")}`
            : "The notes folder is empty.";
        },
        catch: (error) => new Error(`Failed to list files: ${error}`),
      })
    );
    
    return Effect.runPromise(program);
  },
  {
    name: "list_files",
    description: "List all files in the notes folder",
    schema: z.object({}),
  }
);

// Tool to read a file from the notes directory
export const readFile = tool(
  async ({ filename }) => {
    const program = pipe(
      safePath(filename),
      Effect.flatMap((filePath) =>
        Effect.tryPromise({
          try: () => fs.readFile(filePath, "utf-8"),
          catch: (error) => new Error(`Failed to read file: ${error}`),
        })
      ),
      Effect.map((content) => `Contents of ${filename}:\n\n${content}`)
    );
    
    return Effect.runPromise(program);
  },
  {
    name: "read_file",
    description: "Read the contents of a file from the notes folder",
    schema: z.object({
      filename: z.string().describe("The name of the file to read"),
    }),
  }
);

// Tool to write content to a file in the notes directory
export const writeFile = tool(
  async ({ filename, content }) => {
    const program = pipe(
      safePath(filename),
      Effect.flatMap((filePath) =>
        Effect.tryPromise({
          try: () => fs.writeFile(filePath, content, "utf-8"),
          catch: (error) => new Error(`Failed to write file: ${error}`),
        })
      ),
      Effect.map(() => `Successfully wrote to ${filename}`)
    );
    
    return Effect.runPromise(program);
  },
  {
    name: "write_file",
    description: "Write content to a file in the notes folder (creates or overwrites)",
    schema: z.object({
      filename: z.string().describe("The name of the file to write"),
      content: z.string().describe("The content to write to the file"),
    }),
  }
);