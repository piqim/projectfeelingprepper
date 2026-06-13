# FeelingPrepper

A mobile-first mental health support app that helps people with anxiety, depression, and BPD organise their thoughts and feelings through evidence-based therapeutic techniques, presented in an engaging and gamified way.

**Goal:** Publish on the iOS App Store.

> Google Doc Project Documentation: https://docs.google.com/document/d/1UVpPdGcRy8FOocb0aCTXd9F5t-JwH5hKU6ya9pwEP7M/edit?usp=sharing

---

## What It Does

FeelingPrepper guides users through structured mental health exercises drawn from DBT and CBT frameworks:

- **GRAPES** — a daily behavioural activation checklist covering six life areas: Gentle self-care, Recreation, Accomplishment, Pleasure, Exercise, and Social connection. Users fill in what they did in each category and track completion over time.
- **Cognitive Triangle (CogTri)** — a CBT tool that maps a situation to the thoughts, feelings, and behaviours it produced, helping users identify and challenge distorted thinking patterns.
- **TIPP** — a DBT distress-tolerance technique (Temperature, Intense exercise, Paced breathing, Progressive relaxation). Currently a placeholder; full implementation is planned.

Beyond the core techniques, the app includes:

- **Pet companion** — a fish or seal character the user selects on first login. The pet has a status (happy/neutral/sad) derived from when it was last fed, a level (1–10), and an XP system. XP is earned by saving GRAPES entries, CogTri entries, and feeding the pet. The pet degrades from happy to neutral to sad if not fed for one or two days respectively.
- **Streak tracker** — counts consecutive days the user has submitted at least one entry. Resets if a day is missed.
- **Activity calendar** — highlights days with any entry in the current month. Supports navigating up to three months back.
- **Analytics** — shows longest streak, total active days this year, GRAPES category fill counts (horizontal bar chart), and CogTri entries per week for the last four weeks.
- **Settings** — edit username, email, and password; export all personal data as CSV; delete account and all associated data.
- **Offline support** — the last successful dashboard load is cached in `localStorage`. If the app cannot reach the server, cached data is shown with a visible indicator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend | Node.js + Express.js (ES modules) |
| Database | MongoDB Atlas |
| Password hashing | bcrypt |
| Auth (planned) | JWT (jsonwebtoken) |
| Backend deployment | Render |
| Mobile packaging (planned) | Capacitor |

---

## Project Structure

```
projectfeelingprepper/
├── frontend/                  # Vite + React app
│   └── src/
│       ├── assets/            # Static assets (orange.png, etc.)
│       ├── components/
│       │   ├── pages/         # Full-page components (Grapes, Cogtri, Analytics, Settings, Dev, Learnmore, Tipp)
│       │   ├── Home.tsx       # Dashboard / home page
│       │   ├── Navbar.tsx     # Top navbar + sidebar drawer
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── PublicRoute.tsx
│       │   ├── Toast.tsx      # Toast notification component
│       │   └── OfflineBanner.tsx
│       ├── hooks/
│       │   ├── useToast.ts    # Toast state management hook
│       │   └── useNetworkStatus.ts  # Online/offline detection hook
│       ├── config.ts          # API base URL (switches between dev and prod)
│       ├── App.tsx            # Root layout: Navbar + OfflineBanner + Outlet
│       └── main.tsx           # Router definition
└── server/                    # Express backend
    ├── db/
    │   └── connection.js      # MongoDB Atlas connection
    ├── records/
    │   └── records.js         # All API route handlers
    ├── server.js              # Express app entry point
    ├── .env                   # Environment variables (not committed)
    └── vercel.json            # Render/Vercel deployment config
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier works)
- XAMPP or any local server (optional — only needed if running PHP alongside)

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
npm run dev
```

App runs on `http://localhost:5173`.

---

## API Overview

All routes are prefixed by the Express router mounted in `server.js`.

### Authentication
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Verify credentials, return user + token |
| `POST` | `/users` | Register new user, return user + token |

### Users
| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | All users — **admin key required** |
| `GET` | `/users/:id` | Single user (no password returned) |
| `PATCH` | `/users/:id` | Update username, email, preferences |
| `POST` | `/users/:id/change-password` | Change password (bcrypt verify + hash) |
| `DELETE` | `/users/:id` | Delete user and all their entries |
| `PATCH` | `/users/:id/pet-selection` | Set pet type (fish or seal) |
| `PATCH` | `/users/:id/pet-feed` | Feed pet (once per UTC day, awards XP) |

### GRAPES
| Method | Path | Description |
|---|---|---|
| `GET` | `/grapes` | All entries — **admin key required** |
| `GET` | `/grapes/user/:userId` | All entries for a user |
| `GET` | `/grapes/user/:userId/latest` | Most recent entry |
| `POST` | `/grapes` | Create or upsert today's entry |
| `PATCH` | `/grapes/:id` | Update an entry |
| `DELETE` | `/grapes/:id` | Delete an entry |

### CogTri
| Method | Path | Description |
|---|---|---|
| `GET` | `/cogtri` | All entries — **admin key required** |
| `GET` | `/cogtri/user/:userId` | All entries for a user |
| `GET` | `/cogtri/user/:userId/latest` | Most recent entry |
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

**UTC-only date comparisons** — streak increments, feed rate-limiting, and calendar day matching all use UTC. This prevents timezone disagreement near midnight between the client and the MongoDB server.

**Pet status derived client-side** — `getDerivedPetStatus(lastFed)` is computed in the React render on a 60-second tick interval rather than reading the stored `petStats.status` field. This keeps the display accurate as time passes without additional network calls.

**GRAPES upserts** — submitting GRAPES checks for an existing entry for the current UTC day first. If one exists it is updated rather than a duplicate being inserted. CogTri allows multiple entries per day (different situations can arise) but warns the user before saving a second one.

**Streak reset on dashboard load** — the streak is checked and reset on every dashboard load rather than via a background cron job. Simpler, cheaper, and sufficient for a personal-scale app.

**XP on every save** — GRAPES and CogTri award XP on every submission, not just the first. This rewards continued engagement rather than penalising users who update their entries.

**Offline read-only cache** — the dashboard snapshot is saved to `localStorage` (`fp_cache_<userId>`) on every successful fetch. If the server is unreachable, the cached snapshot is displayed with a visible indicator. Submitting new entries while offline is not supported.

---

## Branch Strategy

- `dev-branch` — active development. Contains dev tooling (`/dev` route, localhost API URL, debug utilities).
- `main` — production-ready code. Before merging from `dev-branch`: remove `/dev` route, swap `localhost:5050` → Render production URL, rotate `ADMIN_KEY`.

---

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) and never returned in API responses.
- The `PATCH /users/:id` endpoint only allows `username`, `email`, and `preferences` to be updated. `petStats` and `streak` have dedicated endpoints.
- **JWT auth is planned as the next task.** Currently, `userId` is stored in `localStorage` and sent in request bodies/params. There is no server-side ownership verification on per-user endpoints — any user who knows another user's MongoDB ObjectId can read or modify their data. This will be resolved by the JWT implementation.
- `.env` is gitignored and never committed.

---

## Offline Strategy

### Current (Read-only localStorage cache)
On every successful dashboard load, a snapshot of the user's data (user profile, latest GRAPES, latest CogTri, current month activity dates) is saved to `localStorage` under the key `fp_cache_<userId>`. If the network request fails on a subsequent load, the app falls back to this snapshot and shows a "Showing cached data — connect to refresh" indicator under the welcome message. Submitting new entries while offline is not supported — the OfflineBanner communicates this to the user.

### Future (Capacitor + SQLite)
When integrating Capacitor for App Store publishing, replace the localStorage cache with a local SQLite database using the `@capacitor-community/sqlite` plugin. The intended architecture:

- All reads and writes go to local SQLite first (instant, works offline)
- A sync service pushes unsynced entries to MongoDB when the device reconnects
- Conflict resolution: last-write-wins per entry, keyed by UTC day for GRAPES (upsert) and by `_id` for CogTri

---

## App Store Publishing Plan

**Capacitor integration steps (when ready):**
1. `npm install @capacitor/core @capacitor/cli @capacitor/ios`
2. `npx cap init` — generates `capacitor.config.ts`
3. `npm run build` — produces `dist/`
4. `npx cap add ios` — scaffolds the Xcode project under `ios/`
5. `npx cap copy` — syncs `dist/` into the Xcode project
6. Open `ios/App/App.xcworkspace` in Xcode
7. Set Bundle ID, signing certificate, app icon, and splash screen
8. Product → Archive → Distribute to App Store Connect
9. Apple Developer Account required ($99/year)

**Additional iOS considerations:**
- Handle safe areas (notch, home bar) with `env(safe-area-inset-*)` CSS on navbar, footer, and page containers
- Replace all `localhost` API URLs with the Render production backend URL
- Migrate offline cache from `localStorage` → SQLite via `@capacitor-community/sqlite`
- Portrait orientation is already enforced in CSS/JS — lock it via `capacitor.config.ts` as well
