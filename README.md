# Car Wash Admin - Auth Flow Documentation

## Project Overview

Next.js 15+ admin dashboard with complete authentication system. Built with Redux Toolkit, RTK Query, Axios interceptors, and silent token refresh......



---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| State Management | Redux Toolkit + RTK Query |
| HTTP Client | Axios with interceptors |
| Notifications | React Toastify |
| Styling | Tailwind CSS |
| Auth Strategy | httpOnly cookies (access + refresh tokens) |

---

## Authentication Flow

### Token System

- **accessToken**: Short-lived (15 min), stored in httpOnly cookie + in-memory cache
- **refreshToken**: Long-lived (7 days), stored in httpOnly cookie
- **Token refresh is silent**: User never sees a logout mid-session

### Refresh Triggers (3 layers)

| Layer | Trigger | File |
|-------|---------|------|
| Proactive | Every 60 seconds via `setInterval` | `hooks/useTokenRefresh.ts` |
| Tab Focus | When user returns to browser tab | `hooks/useTokenRefresh.ts` |
| Reactive | Axios interceptor catches 401 → refreshes → retries | `lib/axios-instance.ts` |

### Refresh Queue

Multiple concurrent 401s are queued. Only one refresh call is made. All queued requests resolve with the new token.

---

## Mock Mode System

### Toggle

Single switch in `src/configs/app.config.ts`:

```typescript
MOCK_MODE: true   // ← Change to false for real backend


