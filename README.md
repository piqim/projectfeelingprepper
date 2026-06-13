# projectfeelingprepper
The web app (Codename: FeelingPrepper) is intended to help people with anxiety, depression, and BPD organize their thoughts and feelings through various methods, such as DBT TIPP, GRAPES, and Cognitive Triangle (STFB).

The webapp will consist of a frontend framework and a backend framework, namely the MERN (MongoDB, Express.js, React.js, Node.js) stack. The web app would have a user login system to help keep track of users’ records. The users would have records of their TIPP (history, added activities for T, I, P, and P), GRAPES (Calendar history, and their activities history on the days), and Cognitive Triangle (History). This will be a form-submission-based web app.

Google Doc Project Documentation: https://docs.google.com/document/d/1UVpPdGcRy8FOocb0aCTXd9F5t-JwH5hKU6ya9pwEP7M/edit?usp=sharing

---

## Offline Strategy

### Current (Option 1 — Read-only cache)
On every successful dashboard load, a snapshot of the user's data (user profile, latest GRAPES, latest CogTri, current month activity dates) is saved to `localStorage` under the key `fp_cache_<userId>`. If the network request fails on a subsequent load, the app falls back to this snapshot and shows a "Showing cached data" indicator. Submitting new entries while offline is not supported — the OfflineBanner communicates this to the user.

### Future (Option 4 — Capacitor + SQLite)
When integrating Capacitor for App Store publishing, replace the localStorage cache with a local SQLite database using the `@capacitor-community/sqlite` plugin. The intended architecture:

- All reads and writes go to local SQLite first (instant, works offline)
- A sync service pushes unsynced entries to MongoDB when the device reconnects
- Conflict resolution: last-write-wins per entry, keyed by UTC day for GRAPES (upsert) and by `_id` for CogTri

**Capacitor App Store publishing steps (when ready):**
1. `npm install @capacitor/core @capacitor/cli @capacitor/ios`
2. `npx cap init` — generates `capacitor.config.ts`
3. `npm run build` — produces `dist/`
4. `npx cap add ios` — scaffolds the Xcode project under `ios/`
5. `npx cap copy` — syncs `dist/` into the Xcode project
6. Open `ios/App/App.xcworkspace` in Xcode
7. Set Bundle ID, signing certificate, and app icon
8. Product → Archive → Distribute to App Store Connect
9. Apple Developer Account required ($99/year)

**Additional iOS considerations:**
- Handle safe areas (notch, home bar) with `env(safe-area-inset-*)` CSS
- Replace all `localhost` API URLs with production backend URL (Render)
- Add splash screen and app icon assets
- Lock orientation to portrait via `capacitor.config.ts` (already enforced in CSS/JS)
