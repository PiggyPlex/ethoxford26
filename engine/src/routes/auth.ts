import { Router, Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User } from "../models/user.js"

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    // Check if user exists
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
    })
    await user.save()

    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Get profile
router.get("/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Middleware to authenticate JWT token
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token required" })
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.userId = decoded.userId
    next()
  })
}

export default router
