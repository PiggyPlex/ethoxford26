# Backend Integration Guide

This document explains how the `friend-os-unified` frontend is integrated with the `ethoxford26` backend.

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Frontend (Next.js :3000)          │
│   - React 19 + TypeScript           │
│   - Socket.IO Client                │
│   - JWT Authentication              │
└──────────────┬──────────────────────┘
               │ Socket.IO (ws://localhost:3001)
               │ HTTP REST (http://localhost:3002)
               ↓
┌─────────────────────────────────────┐
│   Backend (Bun :3001 + :3002)       │
│   - Socket.IO Server (chat)         │
│   - Express HTTP Server (auth)      │
│   - MongoDB + Mongoose              │
│   - Gemini LLM Agent                │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   MongoDB                           │
│   - Users (auth)                    │
│   - Interests (fashion prefs)       │
│   - Context Notes                   │
└─────────────────────────────────────┘
```

## What's Integrated

### ✅ Phase 1-2: Socket.IO Client Setup
- **Socket.IO Client**: `/lib/socket-client.ts` - Singleton WebSocket connection
- **Backend Types**: `/lib/backend-types.ts` - TypeScript interfaces
- **Backend Service**: `/lib/backend-service.ts` - Centralized API layer
- **Environment Variable**: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`

### ✅ Phase 3: Real-time Chat
- **Chat Panel**: `/components/chat/chat-panel.tsx` updated to use Socket.IO
- **Events**: `chat:message`, `chat:response`, `chat:thinking`, `chat:tool`, `chat:typing`
- **Live Agent Thoughts**: Backend agent reasoning streamed to frontend console

### ✅ Phase 4: Backend Authentication
- **User Model**: `/engine/src/models/user.ts` - Mongoose schema with bcrypt
- **Auth Routes**: `/engine/src/routes/auth.ts` - Register, Login, Profile endpoints
- **HTTP Server**: `/engine/src/server/http.ts` - Express server on port 3002
- **Entry Point**: `/engine/src/index.ts` - Updated to run both servers

### ✅ Phase 5: Frontend Authentication
- **Auth Context**: `/lib/auth-context.tsx` - JWT token management
- **Auth Modal**: `/components/auth/auth-modal.tsx` - Login/Register UI
- **App Integration**: `/app/page.tsx` - Conditional auth requirement

## Setup Instructions

### 1. Prerequisites

- Node.js 20+ (for frontend)
- Bun runtime (for backend) - Install: `curl -fsSL https://bun.sh/install | bash`
- MongoDB (local or Atlas)

### 2. Backend Setup

```bash
# Navigate to backend
cd "/Users/abdussalam/Downloads/eth oxford/ethoxford26/engine"

# Install dependencies (already done)
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add:
# - MONGODB_CONNECTION_URI (your MongoDB connection string)
# - GOOGLE_API_KEY (your Gemini API key)
# - JWT_SECRET (generate with: openssl rand -base64 32)

# Start backend (requires Bun)
bun run dev

# Expected output:
# ✅ Socket.IO server initialized on port 3001
# ✅ HTTP server listening on port 3002
# ✅ Database connected
# 🚀 Background agents started
```

### 3. Frontend Setup

```bash
# Navigate to frontend
cd "/Users/abdussalam/Downloads/eth oxford/friend-os-unified"

# Install dependencies (already done)
npm install

# Verify .env.local contains:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Start frontend
npm run dev

# Expected output:
# ▲ Next.js 16.1.6
# - Local: http://localhost:3000
# ✓ Ready in 2.3s
```

### 4. Test the Integration

1. **Open Frontend**: http://localhost:3000
2. **Chat Test**:
   - Open browser console (F12)
   - Look for: `[Socket.IO] Connected to backend: <socket-id>`
   - Click chat bubble and send a message
   - Backend agent's thoughts will stream to console: `[Agent Thinking]: ...`
3. **Auth Test** (optional):
   - Edit `/app/page.tsx` and set `REQUIRE_AUTH = true`
   - Refresh page → Auth modal appears
   - Register a new account
   - Login with credentials
   - Profile persists across page refreshes

## File Changes Summary

### Frontend Files Created
- `/lib/socket-client.ts` - Socket.IO singleton
- `/lib/backend-types.ts` - TypeScript interfaces
- `/lib/backend-service.ts` - API service layer
- `/lib/auth-context.tsx` - JWT auth context
- `/components/auth/auth-modal.tsx` - Login/Register UI

### Frontend Files Modified
- `/components/chat/chat-panel.tsx` - Uses Socket.IO instead of fetch
- `/app/page.tsx` - Wrapped with AuthProvider, conditional auth
- `/.env.local` - Added `NEXT_PUBLIC_BACKEND_URL`

### Backend Files Created
- `/engine/src/models/user.ts` - User model with bcrypt
- `/engine/src/routes/auth.ts` - Auth endpoints (register, login, profile)
- `/engine/src/server/http.ts` - Express HTTP server
- `/engine/.env.example` - Environment variables template

### Backend Files Modified
- `/engine/src/index.ts` - Added HTTP server initialization

## How It Works

### Real-time Chat Flow

1. **User sends message** → Frontend calls `backendService.sendMessage()`
2. **Socket.IO emits** `chat:message` event to backend
3. **Backend agent processes** message using Gemini LLM
4. **Backend emits events**:
   - `chat:thinking` → Agent's reasoning steps
   - `chat:tool` → Tool execution progress
   - `chat:response` → Final answer
5. **Frontend receives** events via Socket.IO listeners
6. **UI updates** with new messages

### Authentication Flow

1. **User registers/logs in** → Frontend calls `login()` or `register()`
2. **HTTP POST** to backend `/api/auth/login` or `/api/auth/register`
3. **Backend validates** credentials, generates JWT token
4. **Frontend stores** token in localStorage
5. **Subsequent requests** include token in `Authorization: Bearer <token>` header
6. **Auto-login** on page refresh via stored token

## Development Tips

### Running Without Backend

The frontend still works without the backend running:
- Mock data continues to work
- Chat will show "connection error" but won't crash
- Set `REQUIRE_AUTH = false` in `/app/page.tsx` to skip auth

### Backend Not Starting?

If you get `command not found: bun`:
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Or use npm instead (slower)
npm run dev
```

### Port Conflicts

If ports 3001 or 3002 are in use:
```bash
# Frontend: Change NEXT_PUBLIC_BACKEND_URL in .env.local
# Backend: Change HTTP_PORT in .env

# Kill existing processes:
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### MongoDB Issues

If MongoDB connection fails:
- Ensure `MONGODB_CONNECTION_URI` is correct in backend `.env`
- Check MongoDB Atlas whitelist (allow your IP)
- Verify database user has read/write permissions

## Next Steps (Phase 6: Data Migration)

The integration is ready for gradual data migration:

### Planned Migrations

1. **User Interests** → Replace mock data with backend `Interest` model
2. **Notifications** → Create `Notification` model in backend
3. **Products** → Create `Product` model in backend
4. **Context Awareness** → Use existing `ContextNote` and `UserSummary` data

### Example: Migrate Interests

```typescript
// Create hook: /hooks/use-interests.ts
import { useState, useEffect } from "react"
import { backendService } from "@/lib/backend-service"
import type { Interest } from "@/lib/backend-types"

export function useInterests(category?: InterestCategory) {
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    backendService
      .getInterests(category)
      .then(setInterests)
      .finally(() => setLoading(false))
  }, [category])

  return { interests, loading }
}

// Use in component:
const { interests, loading } = useInterests("fashion")
```

## Git Workflow

### Frontend Repository

```bash
cd "/Users/abdussalam/Downloads/eth oxford/friend-os-unified"

# Create feature branch
git checkout -b backend-integration

# Stage changes
git add .

# Commit
git commit -m "feat: integrate ethoxford26 backend with Socket.IO

- Add Socket.IO client for real-time communication
- Create backend service layer with TypeScript types
- Update chat panel to use Socket.IO events
- Add JWT authentication with login/register
- Maintain compatibility with existing mock data
- Frontend runs on :3000, connects to backend :3001/:3002"

# Push
git push origin backend-integration
```

### Backend Repository

```bash
cd "/Users/abdussalam/Downloads/eth oxford/ethoxford26"

# Create feature branch
git checkout -b add-auth-and-http

# Stage changes
git add engine/src/models/user.ts
git add engine/src/routes/auth.ts
git add engine/src/server/http.ts
git add engine/src/index.ts
git add engine/.env.example

# Commit
git commit -m "feat: add JWT authentication and HTTP server

- Add User model with bcrypt password hashing
- Create /api/auth routes (register, login, profile)
- Add Express HTTP server alongside Socket.IO
- JWT-based authentication middleware
- HTTP server runs on :3002, Socket.IO on :3001"

# Push
git push origin add-auth-and-http
```

## Troubleshooting

### Socket.IO Not Connecting

**Symptoms**: No `[Socket.IO] Connected` log in browser console

**Solutions**:
1. Verify backend is running: Check terminal for "Socket.IO server initialized"
2. Check `NEXT_PUBLIC_BACKEND_URL` in frontend `.env.local`
3. Open browser DevTools → Network → WS tab → Look for WebSocket connection
4. Verify CORS: Backend allows `http://localhost:3000`

### Auth Requests Failing

**Symptoms**: "Failed to fetch" errors when logging in

**Solutions**:
1. Verify HTTP server is running: Check terminal for "HTTP server listening on port 3002"
2. Check backend `.env` has `JWT_SECRET`
3. Verify frontend is sending to correct URL (should be `:3002` not `:3001`)
4. Check browser DevTools → Network → Look for 401/403 errors

### TypeScript Errors

**Symptoms**: Red underlines in IDE

**Solutions**:
1. Restart TypeScript server: VS Code → Cmd+Shift+P → "Restart TS Server"
2. Check imports use `@/` alias correctly
3. Verify all new files are in correct directories

## Success Criteria

✅ Frontend and backend run on separate ports (3000, 3001, 3002)
✅ Socket.IO connection established successfully
✅ Chat uses backend Socket.IO instead of Next.js API route
✅ User authentication works (register, login, logout)
✅ JWT tokens stored and validated correctly
✅ Existing features (face-swap, moodboard, etc.) still work
✅ No breaking changes to current functionality
✅ Code compiles with no TypeScript errors
✅ Both repos maintain separate git history

## Questions?

If you encounter issues not covered here:
1. Check browser console for errors
2. Check backend terminal for logs
3. Verify all environment variables are set
4. Ensure MongoDB is accessible
5. Confirm all dependencies are installed

For Socket.IO issues, backend logs show agent activities in real-time.
