# BrightSide Car Wash — Admin Dashboard

A modern, high-performance Admin Dashboard for BrightSide Car Wash built with Next.js 16 (App Router), React 19, TypeScript, and Redux Toolkit.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with custom design tokens |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) |
| **HTTP Client** | [Axios](https://axios-http.com/) with custom interceptors & token queue |
| **Rich Text Editor** | [TipTap Editor](https://tiptap.dev/) |
| **Drag & Drop** | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (Kanban board) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications** | [React Toastify](https://fkhadra.github.io/react-toastify/) |

---

## 📁 Architecture & Directory Structure

```text
src/
├── app/                  # Next.js 16 App Router pages and layout groups
│   ├── (admin)/          # Protected admin dashboard routes
│   │   ├── dashboard/    # Analytics & KPI overview
│   │   ├── leads/        # Lead management & Kanban board
│   │   ├── marketing/    # Campaigns, email lists & editor
│   │   ├── ai-chatbox/   # AI chat & knowledge base
│   │   ├── teams/        # Members, roles & permissions
│   │   ├── settings/     # Business configuration
│   │   └── reports/      # Activity logs & audit reports
│   ├── auth/             # Public authentication routes (login, forgot password)
│   ├── error.tsx         # Global route error boundary
│   └── not-found.tsx     # 404 Not Found page
├── components/           # Reusable UI & page components
│   ├── ui/               # Core atomic primitives (Button, Modal, Input, Table)
│   └── pages/            # Domain-specific page components
├── configs/              # Application & navigation configuration
│   ├── app.config.ts     # Global application settings & env bindings
│   ├── auth.config.ts    # Authentication endpoints & cookie configurations
│   ├── navigation.config.ts # Sidebar navigation items & RBAC mappings
│   └── kanban.config.ts  # Pipeline column configurations
├── hooks/                # Custom React hooks (auth, permissions, modals)
├── lib/                  # Core utilities (axios-instance, token-refresh, store)
├── services/             # API service layers
├── types/                # TypeScript type definitions & interfaces
└── mocks/                # Isolated mock data for offline development
```

---

## 🔐 Authentication & Session Flow

The dashboard communicates with the backend using **Bearer JWT tokens** managed via client-side storage and Axios interceptors:

1. **Token Storage**:
   - `accessToken`: Passed as `Authorization: Bearer <token>` in HTTP request headers.
   - `refreshToken`: Stored in secure storage for renewing expired sessions.

2. **Centralized Axios Interceptors** (`src/lib/axios-instance.ts`):
   - **Request Interceptor**: Automatically attaches the current `accessToken` to all outgoing API requests.
   - **Configured Timeouts**: 30-second default request timeout, 120-second timeout for multipart file uploads, and 15-second timeout for refresh calls.

3. **Silent Token Refresh Queue** (`src/lib/token-refresh.ts`):
   - When an API request returns `401 Unauthorized`, the response interceptor pauses outgoing calls.
   - A single refresh request is sent to the backend. Concurrent requests are safely queued.
   - Once refreshed, all queued requests are replayed with the new token.
   - If the refresh token has expired or is invalid, the user is cleanly logged out and redirected to `/auth/login`.

---

## 🛡️ Role-Based Access Control (RBAC)

The application implements a granular permission model:

- **Permission Matrix**: Defined in `src/lib/permissions.ts`.
- **Navigation Guard**: Sidebar navigation items in `src/configs/navigation.config.ts` declare required permissions and are dynamically filtered based on the active user's role.
- **Component Guards**: `<PermissionGuard permission={PERMISSIONS.lead.create}>` conditionally renders buttons and views.
- **Hook Integration**: `useTeamPermissions()` provides reactive helper methods (`hasPermission`, `canAccess`) across client components.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env.local
```

### Supported Variables:

| Variable | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_MOCK_MODE` | Enable/disable offline mock data (`true` or `false`) | `false` |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for REST API endpoints | `https://api.example.com/api` |
| `NEXT_PUBLIC_STORAGE_URL` | AWS S3 / Object storage bucket for uploads & assets | `https://s3.amazonaws.com/...` |
| `NEXT_PUBLIC_AI_BASE_URL` | AI Assistant and knowledge base service URL | `https://ai.example.com/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL for real-time notifications | `wss://socket.example.com` |
| `ALLOWED_DEV_ORIGINS` | Optional comma-separated origins for dev tunnels (LAN) | `192.168.1.100,tunnel.domain.com` |

---

## 💻 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` / `v24.x`
- **Package Manager**: `npm` (v10+)

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with hot reloading |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs ESLint across all TypeScript and React files |
| `npx tsc --noEmit` | Performs TypeScript compiler type checking |

---

## 🚢 Deployment

### Production Build

Before deploying, test the production build locally:

```bash
npm run build
npm run start
```

### Cloud Deployment (Vercel / AWS / Docker)

1. **Vercel**:
   - Connect the repository to Vercel.
   - Configure the environment variables in Project Settings.
   - Set Build Command to `npm run build` and Output Directory to `.next`.

2. **Docker / Self-Hosted**:
   - The project runs standard Node.js server output.
   - Ensure `NEXT_PUBLIC_*` variables are provided at build time.
