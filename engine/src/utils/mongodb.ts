import mongoose from "mongoose";
import { Console, Effect } from "effect";

let isConnected = false;

export const connectToDatabase = () =>
  Effect.tryPromise({
    try: async () => {
      Console.log("Attempting to connect to MongoDB...");

      if (isConnected) {
        Console.log("Already connected to MongoDB, skipping connection.");
        return;
      }

      const uri = process.env.MONGODB_CONNECTION_URI;
      if (!uri) {
        throw new Error("MONGODB_CONNECTION_URI environment variable is not set");
      }

      await mongoose.connect(uri);
      isConnected = true;
      Console.log("MongoDB connected successfully");
    },
    catch: (error) => new Error(`MongoDB connection failed: ${error}`),
  });

export const disconnectFromDatabase = () =>
  Effect.tryPromise({
    try: async () => {
      if (!isConnected) {
        return;
      }
      await mongoose.disconnect();
      isConnected = false;
      console.log("MongoDB disconnected");
    },
    catch: (error) => new Error(`MongoDB disconnection failed: ${error}`),
  });
