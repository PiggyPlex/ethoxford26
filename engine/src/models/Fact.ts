import mongoose, { Schema, Document } from "mongoose";

export interface IFact extends Document {
  content: string;
  formattedContent: string;
  createdAt: Date;
  updatedAt: Date;
}

const FactSchema = new Schema<IFact>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    formattedContent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

FactSchema.index({ content: "text", formattedContent: "text" });

export const Fact = mongoose.model<IFact>("Fact", FactSchema);
