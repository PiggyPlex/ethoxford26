import express from "express"
import cors from "cors"

export function createHttpServer() {
  const app = express()

  // Middleware
  app.use(cors({ origin: "http://localhost:3000", credentials: true }))
  app.use(express.json())

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  return app
}
