import mongoose from 'mongoose';

const proactiveActionSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, required: true },
  userContext: { type: String, required: true },
  actionType: { type: String, required: true },
  actionDescription: { type: String, required: true },
  toolsUsed: [{ type: String }],
  result: { type: String },
  wasHelpful: { type: Boolean, default: null },
}, {
  timestamps: true
});

export const ProactiveAction = mongoose.model('ProactiveAction', proactiveActionSchema);
