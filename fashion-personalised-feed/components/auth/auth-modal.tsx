"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export function AuthModal() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        if (!name.trim()) {
          setError("Name is required")
          setIsSubmitting(false)
          return
        }
        await register(email, password, name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-neutral-200">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-xl">
            F
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-neutral-500 text-center mb-6">
          {mode === "login"
            ? "Sign in to your FriendOS account"
            : "Get started with your personal fashion assistant"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              required
              disabled={isSubmitting}
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-neutral-900 text-white py-2.5 rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login")
              setError("")
            }}
            className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
            disabled={isSubmitting}
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Temporary notice for development */}
        <div className="mt-6 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            ℹ️ Backend authentication is now enabled. Make sure the backend server is running on port 3002.
          </p>
        </div>
      </div>
    </div>
  )
}
