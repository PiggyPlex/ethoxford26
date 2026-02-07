import mongoose from 'mongoose';

const contextNoteSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, required: true },
  mainWindow: { type: String, required: true },
  openWindows: [{ type: String, required: true }],
  summary: { type: String, required: true },
  notes: { type: String },
}, {
  timestamps: true
});

export const ContextNote = mongoose.model('ContextNote', contextNoteSchema);
