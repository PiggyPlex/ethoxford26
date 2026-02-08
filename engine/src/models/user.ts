import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  email: string
  password: string  // Hashed with bcrypt
  name: string
  profilePhoto?: string
  interests: mongoose.Types.ObjectId[]  // References Interest collection
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    profilePhoto: { type: String },
    interests: [{ type: Schema.Types.ObjectId, ref: "Interest" }],
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.model<IUser>("User", UserSchema)
