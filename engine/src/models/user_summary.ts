import mongoose from 'mongoose';

const userSummarySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, required: true },
  currentActivity: { type: String, required: true },
  recentActivities: { type: String, required: true },
  inferredGoals: { type: String, required: true },
  potentialNeeds: { type: String, required: true },
  futureActions: { type: String },
}, {
  timestamps: true
});

export const UserSummary = mongoose.model('UserSummary', userSummarySchema);
