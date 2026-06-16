# FeelingPrepper

A mobile-first mental health support app that helps people with anxiety, depression, and BPD organise their thoughts and feelings through evidence-based therapeutic techniques, presented in an engaging and gamified way. Packaged as a native iOS app with Capacitor.

**Goal:** Publish on the iOS App Store.

> Google Doc Project Documentation: https://docs.google.com/document/d/1UVpPdGcRy8FOocb0aCTXd9F5t-JwH5hKU6ya9pwEP7M/edit?usp=sharing

---

## App Store Description

See [`app-store-desc`](./app-store-desc) for the current App Store listing copy.

## What It Does

FeelingPrepper guides users through structured mental health exercises drawn from DBT and CBT frameworks:

- **GRAPES** — a daily behavioural activation checklist covering six life areas: Gentle self-care, Recreation, Accomplishment, Pleasure, Exercise, and Social connection. Users fill in what they did in each category and track completion over time.
- **Cognitive Triangle (CogTri)** — a CBT tool that maps a situation to the thoughts, feelings, and behaviours it produced, helping users identify and challenge distorted thinking patterns.
- **TIPP** — a DBT distress-tolerance technique (Temperature, Intense exercise, Paced breathing, Progressive relaxation). Currently a placeholder; full implementation is planned.

Beyond the core techniques, the app includes:

- **Pet companion** — a fish or seal character the user selects on first login. The pet has a status (happy/neutral/sad) derived from when it was last fed, a level (1–10), and an XP system. XP is earned by saving GRAPES entries, CogTri entries, and feeding the pet. The pet becomes neutral if not fed within 12 hours and sad if not fed within 24 hours.
- **Local notifications & reminders** — opt-in native notifications scheduled on-device via Capacitor: a daily check-in, a streak-protection nudge, a pet-status reminder, streak-milestone celebrations, and a gentle re-engagement nudge after a few days away. All are gated behind a per-user `notifications` preference that can be toggled in Settings.
- **Haptic feedback** — light/medium/heavy haptics on native iOS for key interactions (saving entries, feeding the pet, level-ups).
- **Dark mode** — a three-way light / dark / system toggle persisted to `localStorage`. Semantic color tokens in Tailwind CSS flip between light and dark values so all pages adapt automatically. The preference is applied before first paint to prevent flash-of-wrong-theme.
- **Streak tracker** — counts consecutive days the user has submitted at least one entry. Resets if a day is missed.
- **Activity calendar** — highlights days with any entry in the current month. Supports navigating up to three months back.
- **Analytics** — shows longest streak, total active days this year, GRAPES category fill counts (horizontal bar chart), and CogTri entries per week for the last four weeks.
- **Settings** — edit username, email, and password; toggle notifications; export all personal data as CSV; delete account and all associated data.
- **Crisis resources** — a crisis-help card surfaced at the top of the Learn More page with one-tap 988 (Suicide & Crisis Lifeline) and 911 links, plus guidance for users outside the US.
- **Legal pages** — in-app Terms & Conditions and Privacy Policy, served from static text files.
- **Offline support** — the last successful dashboard load is cached in `localStorage`. If the app cannot reach the server, cached data is shown with a visible indicator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP client | axios |
| Sanitisation | DOMPurify |
| Mobile packaging | Capacitor 8 (iOS) |
| Native plugins | Haptics, Local Notifications, Splash Screen, Status Bar |
| Backend | Node.js + Express.js (ES modules) |
| Database | MongoDB Atlas (driver + Mongoose) |
| Auth | JWT (jsonwebtoken) — implemented |
| Password hashing | bcrypt |
| Backend deployment | Render |

---

## Project Structure

```
projectfeelingprepper/
├── frontend/                  # Vite + React app (Capacitor web shell)
│   ├── capacitor.config.ts    # Capacitor config (appId com.piqim.feelingprepper)
│   ├── ios/                   # Scaffolded Xcode project (npx cap add ios)
│   ├── public/
│   │   ├── terms-and-conditions.txt
│   │   └── privacy-policy.txt  # Legal text served to the in-app Legal page
│   └── src/
│       ├── assets/            # Static assets (icon.jpg, orange.png, etc.)
│       ├── components/
│       │   ├── pages/         # Full-page components (Grapes, Cogtri, Analytics, Settings, Dev, Learnmore, Tipp, Legal)
│       │   ├── pet/
│       │   │   ├── PetCharacter.tsx  # Animated hero-scene pet (Home dashboard)
│       │   │   └── PetPreview.tsx    # Static thumbnail for pet-selection modal
│       │   ├── Home.tsx       # Dashboard / home page
│       │   ├── Navbar.tsx     # Top navigation bar
│       │   ├── BottomTabBar.tsx  # Mobile bottom navigation
│       │   ├── Footer.tsx     # App footer (hidden on auth pages)
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── PublicRoute.tsx
│       │   ├── Toast.tsx      # Toast notification component
│       │   └── OfflineBanner.tsx
│       ├── hooks/
│       │   ├── useToast.ts         # Toast state management hook
│       │   ├── useTheme.ts         # Light / dark / system theme toggle
│       │   ├── useConfetti.ts      # Confetti burst helper (level-up, streaks)
│       │   └── useNetworkStatus.ts # Online/offline detection hook
│       ├── utils/
│       │   ├── auth.ts          # JWT auth headers + auth-storage cleanup
│       │   ├── userId.ts        # MongoDB ObjectId normalisation helpers
│       │   ├── pet.ts           # Level thresholds, XP helpers, pet mood logic
│       │   ├── notifications.ts # Capacitor local-notification scheduling
│       │   ├── haptics.ts       # Native haptic feedback helpers
│       │   └── date.ts          # Local-date parsing helper
│       ├── config.ts          # Reads VITE_API_URL from the environment
│       ├── App.tsx            # Root layout: Navbar + OfflineBanner + Outlet + BottomTabBar
│       └── main.tsx           # Router definition + pre-paint theme application
└── server/                    # Express backend
    ├── db/
    │   └── connection.js      # MongoDB Atlas connection
    ├── api/
    │   └── hash_pass.js       # Standalone password-hashing helper
    ├── records/
    │   ├── records.js         # All API route handlers + auth middleware
    │   └── mongodb_scheme.md  # Collection/schema notes
    ├── server.js              # Express app entry point
    ├── build.sh              # Render build script
    ├── .env                   # Environment variables (not committed)
    └── vercel.json            # Render/Vercel deployment config
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier works)
- Xcode (only needed to build/run the native iOS app)

### Backend

```bash
cd server
npm install
```

Create `server/.env`:
```
ATLAS_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=main-db
PORT=5050
FRONTEND_URL=http://localhost:5173
ADMIN_KEY=<choose-a-strong-key>
JWT_SECRET=<choose-a-strong-secret>
```

```bash
npm start
```

Server runs on `http://localhost:5050`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (see `.env.example`):
```
VITE_API_URL=http://localhost:5050
```

```bash
npm run dev
```

App runs on `http://localhost:5173`.

### iOS (Capacitor)

```bash
cd frontend
npm run build          # produce dist/
npx cap copy ios       # sync dist/ into the Xcode project
npx cap open ios       # open ios/App/App.xcworkspace in Xcode
```

Then run on a simulator or device from Xcode. Point `VITE_API_URL` at the Render backend before building a production app.

---

## API Overview

All routes are prefixed by the Express router mounted in `server.js`. Per-user routes require a valid JWT in the `Authorization: Bearer <token>` header; the middleware (`authenticateToken`) verifies the token and exposes the caller's id as `req.userId` for ownership checks.

### Authentication
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Verify credentials, return user + JWT |
| `POST` | `/users` | Register new user, return user + JWT |

### Users
| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | All users — **admin key required** |
| `GET` | `/users/:id` | Single user (no password returned) |
| `PATCH` | `/users/:id` | Update username, email, preferences |
| `POST` | `/users/:id/change-password` | Change password (bcrypt verify + hash) |
| `DELETE` | `/users/:id` | Delete user and all their entries |
| `GET` | `/users/:id/pet-selection` | Read pet type |
| `PATCH` | `/users/:id/pet-selection` | Set pet type (fish or seal) |
| `PATCH` | `/users/:id/pet-feed` | Feed pet (12-hour cooldown, awards XP) |

### GRAPES
| Method | Path | Description |
|---|---|---|
| `GET` | `/grapes` | All entries — **admin key required** |
| `GET` | `/grapes/user/:userId` | All entries for a user |
| `GET` | `/grapes/user/:userId/latest` | Most recent entry |
| `GET` | `/grapes/user/:userId/range` | Entries within a date range |
| `GET` | `/grapes/:id` | Single entry |
| `POST` | `/grapes` | Create or upsert today's entry |
| `PATCH` | `/grapes/:id` | Update an entry |
| `DELETE` | `/grapes/:id` | Delete an entry |

### CogTri
| Method | Path | Description |
|---|---|---|
| `GET` | `/cogtri` | All entries — **admin key required** |
| `GET` | `/cogtri/user/:userId` | All entries for a user |
| `GET` | `/cogtri/user/:userId/latest` | Most recent entry |
| `GET` | `/cogtri/user/:userId/range` | Entries within a date range |
| `GET` | `/cogtri/:id` | Single entry |
| `POST` | `/cogtri` | Create new entry |
| `PATCH` | `/cogtri/:id` | Update an entry |
| `DELETE` | `/cogtri/:id` | Delete an entry |

### Dashboard & Analytics
| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard/:userId` | User data, latest entries, activity dates, streak reset check |
| `GET` | `/activity-dates/:userId` | Activity dates for a given month (calendar navigation) |
| `GET` | `/analytics/:userId` | Computed stats: longest streak, GRAPES category counts, weekly CogTri |

### Admin key
The three all-data GET endpoints (`/users`, `/grapes`, `/cogtri`) require an `X-Admin-Key` header matching the `ADMIN_KEY` value in `.env`. This is used by the `/dev` panel during development.

---

## Key Design Decisions

**JWT auth with ownership checks** — login and registration issue a signed JWT (`JWT_SECRET`). The frontend stores it as `fp_token` and sends it via `Authorization: Bearer`. The `authenticateToken` middleware verifies the token on every per-user route and exposes `req.userId` so handlers can confirm the caller owns the data they touch.

**Environment-driven API base URL** — the frontend reads `VITE_API_URL` at build time (`config.ts`) rather than hard-coding localhost vs. production. Switching backends is a config change, not a code edit, which keeps dev and production builds identical apart from the env file.

**On-device notification scheduling** — reminders are scheduled locally through `@capacitor/local-notifications` rather than via a server push service. Each notification owns a stable id so it can be rescheduled/cancelled independently, milestones are de-duplicated via `localStorage`, and the whole system is gated by a locally mirrored copy of the server `notifications` preference so it can be toggled synchronously without a network round-trip.

**UTC-only date comparisons** — streak increments, feed rate-limiting, and calendar day matching all use UTC. This prevents timezone disagreement near midnight between the client and the MongoDB server. `parseLocalDate` also guards against backdating streak claims by rejecting client dates more than two days from server time.

**Pet status derived client-side** — `getDerivedPetStatus(lastFed)` is computed in the React render on a 60-second tick interval rather than reading the stored `petStats.status` field. This keeps the display accurate as time passes without additional network calls. The pet feeding cooldown is 12 hours; the mood thresholds mirror this (happy < 12 h, neutral < 24 h, sad otherwise).

**Dark mode via semantic tokens** — rather than scattering `dark:` Tailwind variants across every element, the CSS defines a small set of semantic tokens (`--color-canvas`, `--color-surface`, `--color-ink`, etc.) that remap under a `.dark` class on `<html>`. All components use these tokens, so the theme flips in one place. The preference is applied synchronously in `main.tsx` before React mounts to prevent flash-of-wrong-theme.

**GRAPES upserts** — submitting GRAPES checks for an existing entry for the current UTC day first. If one exists it is updated rather than a duplicate being inserted. CogTri allows multiple entries per day (different situations can arise) but warns the user before saving a second one.

**Streak reset on dashboard load** — the streak is checked and reset on every dashboard load rather than via a background cron job. Simpler, cheaper, and sufficient for a personal-scale app.

**XP on every save** — GRAPES and CogTri award XP on every submission, not just the first. This rewards continued engagement rather than penalising users who update their entries.

**Offline read-only cache** — the dashboard snapshot is saved to `localStorage` (`fp_cache_<userId>`) on every successful fetch. If the server is unreachable, the cached snapshot is displayed with a visible indicator. Submitting new entries while offline is not supported.

---

## Branch Strategy

- `native-branch` — active development of the Capacitor/iOS native build.
- `main` — production-ready code.

Because the API base URL is now environment-driven (`VITE_API_URL`), promoting a build to production is a matter of pointing the env file at the Render backend rather than editing source. Remember to keep the `/dev` route and `ADMIN_KEY` out of production builds.

---

## Security Notes

- **JWT auth is implemented.** Login/registration issue a signed token; per-user endpoints require `Authorization: Bearer <token>` and verify ownership against the token's `userId`. The token is stored client-side as `fp_token`.
- Passwords are hashed with bcrypt and never returned in API responses.
- The `PATCH /users/:id` endpoint only allows `username`, `email`, and `preferences` to be updated. `petStats`, pet selection, and feeding have dedicated endpoints.
- The three all-data GET endpoints require the `X-Admin-Key` header.
- `.env` files are gitignored and never committed.

---

## Offline Strategy

### Current (Read-only localStorage cache)
On every successful dashboard load, a snapshot of the user's data (user profile, latest GRAPES, latest CogTri, current month activity dates) is saved to `localStorage` under the key `fp_cache_<userId>`. If the network request fails on a subsequent load, the app falls back to this snapshot and shows a "Showing cached data — connect to refresh" indicator under the welcome message. Submitting new entries while offline is not supported — the OfflineBanner communicates this to the user.

### Future (Capacitor + SQLite)
The native shell is already running on Capacitor. The next step for true offline-first behaviour is to replace the localStorage cache with a local SQLite database using the `@capacitor-community/sqlite` plugin. The intended architecture:

- All reads and writes go to local SQLite first (instant, works offline)
- A sync service pushes unsynced entries to MongoDB when the device reconnects
- Conflict resolution: last-write-wins per entry, keyed by UTC day for GRAPES (upsert) and by `_id` for CogTri

---

## App Store Publishing

Capacitor is already integrated and the iOS project is scaffolded (`frontend/ios/`, appId `com.piqim.feelingprepper`). The remaining publishing workflow:

1. `cd frontend && npm run build` — produces `dist/`
2. `npx cap copy ios` — syncs `dist/` into the Xcode project
3. `npx cap open ios` — opens `ios/App/App.xcworkspace` in Xcode
4. Set the signing certificate, app icon, and splash screen
5. Confirm `VITE_API_URL` points at the Render production backend for the build
6. Product → Archive → Distribute to App Store Connect
7. Apple Developer Account required ($99/year)

See [`CAPACITOR_PLAN.md`](./CAPACITOR_PLAN.md), [`DEPLOYMENT.md`](./DEPLOYMENT.md), [`Instructions to publish on app store.md`](./Instructions%20to%20publish%20on%20app%20store.md), and [`appreviewer.md`](./appreviewer.md) for the full step-by-step guides.

**Additional iOS considerations:**
- Handle safe areas (notch, home bar) with `env(safe-area-inset-*)` CSS on navbar, footer, and page containers
- Portrait orientation is enforced in CSS/JS (App.tsx attempts a `screen.orientation.lock`); lock it via the native project as well
- Request notification permission on first launch so local reminders can be scheduled
