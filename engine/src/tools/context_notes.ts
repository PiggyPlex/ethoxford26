import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ContextNote } from "../models/context_note";

export const saveContextNoteTool = new DynamicStructuredTool({
  name: "save_context_note",
  description: "Save a context note about what the user is doing on their computer to the database. Use this to persist observations about user activity.",
  schema: z.object({
    mainWindow: z.string().describe("The main window the user is focused on"),
    openWindows: z.array(z.string()).describe("List of all open windows"),
    summary: z.string().describe("Concise summary of what the user is doing"),
    notes: z.string().optional().describe("Additional observations or insights"),
  }),
  func: async ({ mainWindow, openWindows, summary, notes }) => {
    try {
      const contextNote = new ContextNote({
        mainWindow,
        openWindows,
        summary,
        notes,
      });
      
      await contextNote.save();
      
      return `Context note saved successfully with ID: ${contextNote._id}`;
    } catch (error) {
      return `Failed to save context note: ${error}`;
    }
  },
});

export const fetchContextNotesTool = new DynamicStructuredTool({
  name: "fetch_context_notes",
  description: "Fetch recent context notes about user activity. Use this to retrieve past observations about what the user has been doing on their computer.",
  schema: z.object({
    limit: z.number().default(6).describe("Number of recent context notes to retrieve"),
  }),
  func: async ({ limit }) => {
    try {
      const contextNotes = await ContextNote.find().sort({ createdAt: -1 }).limit(limit);
      return JSON.stringify(contextNotes.map(note => ({
        id: note._id,
        mainWindow: note.mainWindow,
        openWindows: note.openWindows,
        summary: note.summary,
        notes: note.notes,
        createdAt: note.createdAt,
      })));
    } catch (error) {
      return `Failed to fetch context notes: ${error}`;
    }
  },
});
