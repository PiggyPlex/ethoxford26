import mongoose, { Schema, Document } from "mongoose";

export const INTEREST_CATEGORIES = [
  "fashion",
  "tech",
  "social",
  "music",
  "news_politics",
  "art_media",
  "history_literature",
  "sports",
  "gaming",
  "food_drink",
  "travel",
  "finance",
  "health_fitness",
  "science",
  "education",
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

export interface IInterest extends Document {
  name: string;
  category: InterestCategory;
  embedding: number[];
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  relatedTerms: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema = new Schema<IInterest>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: INTEREST_CATEGORIES,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
    occurrences: {
      type: Number,
      default: 1,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    relatedTerms: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
InterestSchema.index({ name: 1, category: 1 }, { unique: true });
InterestSchema.index({ category: 1 });
InterestSchema.index({ name: "text", relatedTerms: "text" });

export const Interest = mongoose.model<IInterest>("Interest", InterestSchema);
