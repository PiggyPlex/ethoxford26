"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth_token")
    if (stored) {
      setToken(stored)
      // Fetch user profile with token
      fetchProfile(stored)
    } else {
      setIsLoading(false)
    }
  }, [])

  async function fetchProfile(authToken: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const res = await fetch(`${baseUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        // Token invalid, clear it
        localStorage.removeItem("auth_token")
        setToken(null)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      // If backend is not available, clear token
      localStorage.removeItem("auth_token")
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Login failed")
    }

    const { token: authToken, user: userData } = await res.json()
    localStorage.setItem("auth_token", authToken)
    setToken(authToken)
    setUser(userData)
  }

  async function register(email: string, password: string, name: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Registration failed")
    }

    const { token: authToken, user: userData } = await res.json()
    localStorage.setItem("auth_token", authToken)
    setToken(authToken)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem("auth_token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
