import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { UserSummary } from "../models/user_summary";

export const saveUserSummaryTool = new DynamicStructuredTool({
  name: "save_user_summary",
  description: "Save a comprehensive summary of user activity, goals, and potential needs to the database.",
  schema: z.object({
    currentActivity: z.string().describe("What the user is currently doing"),
    recentActivities: z.string().describe("Summary of user's recent activities"),
    inferredGoals: z.string().describe("What the user appears to be trying to achieve"),
    potentialNeeds: z.string().describe("What the user might need help with"),
    futureActions: z.string().optional().describe("Predictions about what user might do next"),
  }),
  func: async ({ currentActivity, recentActivities, inferredGoals, potentialNeeds, futureActions }) => {
    try {
      const userSummary = new UserSummary({
        currentActivity,
        recentActivities,
        inferredGoals,
        potentialNeeds,
        futureActions,
      });
      
      await userSummary.save();
      
      return `User summary saved successfully with ID: ${userSummary._id}`;
    } catch (error) {
      return `Failed to save user summary: ${error}`;
    }
  },
});

export const fetchUserSummaryTool = new DynamicStructuredTool({
  name: "fetch_user_summary",
  description: "Fetch the most recent user activity summary to understand what the user is doing and what they might need.",
  schema: z.object({
    limit: z.number().default(1).describe("Number of recent summaries to retrieve"),
  }),
  func: async ({ limit }) => {
    try {
      const summaries = await UserSummary.find().sort({ createdAt: -1 }).limit(limit);
      if (summaries.length === 0) {
        return "No user summaries available yet.";
      }
      return JSON.stringify(summaries.map(s => ({
        currentActivity: s.currentActivity,
        recentActivities: s.recentActivities,
        inferredGoals: s.inferredGoals,
        potentialNeeds: s.potentialNeeds,
        futureActions: s.futureActions,
        createdAt: s.createdAt,
      })));
    } catch (error) {
      return `Failed to fetch user summary: ${error}`;
    }
  },
});
