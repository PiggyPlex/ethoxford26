import express from "express"
import cors from "cors"
import authRoutes from "../routes/auth.js"

export function createHttpServer() {
  const app = express()

  // Middleware
  app.use(cors({ origin: "http://localhost:3000", credentials: true }))
  app.use(express.json())

  // Routes
  app.use("/api/auth", authRoutes)

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  return app
}
