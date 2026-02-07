import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ProactiveAction } from "../models/proactive_action";

export const saveProactiveActionTool = new DynamicStructuredTool({
  name: "save_proactive_action",
  description: "Save a record of proactive assistance provided to the user. Use this after taking any helpful action.",
  schema: z.object({
    userContext: z.string().describe("Brief description of user's current context/activity"),
    actionType: z.string().describe("Type of action: 'info_lookup', 'calendar_check', 'music_suggestion', 'reminder', 'research'"),
    actionDescription: z.string().describe("What proactive action was taken to help the user"),
    toolsUsed: z.array(z.string()).describe("List of tools that were used"),
    result: z.string().describe("The outcome or information gathered"),
  }),
  func: async ({ userContext, actionType, actionDescription, toolsUsed, result }) => {
    try {
      const proactiveAction = new ProactiveAction({
        userContext,
        actionType,
        actionDescription,
        toolsUsed,
        result,
      });
      
      await proactiveAction.save();
      
      return `Proactive action logged: ${actionType} - ${actionDescription}`;
    } catch (error) {
      return `Failed to save proactive action: ${error}`;
    }
  },
});

export const fetchProactiveActionsTool = new DynamicStructuredTool({
    name: "fetch_proactive_actions",
    description: "Fetch recent proactive actions taken to assist the user. Use this to review what proactive assistance has been provided.",
    schema: z.object({
        limit: z.number().default(5).describe("Number of recent proactive actions to retrieve"),
    }),
    func: async ({ limit }) => {
        try {
        const actions = await ProactiveAction.find().sort({ createdAt: -1 }).limit(limit);
        if (actions.length === 0) {
            return "No proactive actions logged yet.";
        }
        return JSON.stringify(actions.map(a => ({
            userContext: a.userContext,
            actionType: a.actionType,
            actionDescription: a.actionDescription,
            toolsUsed: a.toolsUsed,
            result: a.result,
            createdAt: a.createdAt,
        })));
        } catch (error) {
        return `Failed to fetch proactive actions: ${error}`;
        }
    },
});
