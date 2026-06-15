# Capacitor iOS Integration Plan

**Branch:** `native-branch`  
**App ID:** `com.piqim.feelingprepper`  
**App Name:** FeelingPrepper  
**Web Dir:** `dist` (Vite build output)

---

## Step 1 — Install Capacitor

Run from `frontend/`:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "FeelingPrepper" "com.piqim.feelingprepper" --web-dir dist
npm install @capacitor/ios
```

This generates `capacitor.config.ts` in `frontend/`.

---

## Step 2 — Install Native Plugins

```bash
npm install @capacitor/local-notifications
npm install @capacitor/haptics
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
```

| Plugin | Purpose |
|---|---|
| `@capacitor/local-notifications` | Daily GRAPES/check-in reminders |
| `@capacitor/haptics` | Tactile feedback on pet feed, XP gain, streaks |
| `@capacitor/status-bar` | Match status bar to app theme on launch |
| `@capacitor/splash-screen` | Loading splash before app is ready |

---

## Step 3 — Build & Add iOS Platform

```bash
npm run build       # generates dist/
npx cap add ios     # creates ios/ Xcode project
npx cap sync        # copies dist/ + plugins into native project
```

---

## Step 4 — iOS Safe Areas

Add safe area insets to the app's root layout so content is not clipped by the notch or home indicator.

In `index.css` (or the root layout element):

```css
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
  --sar: env(safe-area-inset-right);
}
```

In `index.html`, add to the `<meta name="viewport">` tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Apply padding to the root container in `App.tsx` or the top-level layout div:

```tsx
<div style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
```

---

## Step 5 — Wire Native Plugins into App Code

### Status Bar (on app load in `App.tsx`)
```ts
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark });
}
```

### Haptics (in pet feed handler and XP level-up toast)
```ts
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

// Light tap on pet feed
if (Capacitor.isNativePlatform()) {
  await Haptics.impact({ style: ImpactStyle.Light });
}

// Medium tap on level-up
if (Capacitor.isNativePlatform()) {
  await Haptics.impact({ style: ImpactStyle.Medium });
}
```

### Local Notifications (request permission + schedule daily reminder)
```ts
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  const { display } = await LocalNotifications.requestPermissions();
  if (display === 'granted') {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'FeelingPrepper',
          body: "Time to check in. How are you feeling today?",
          id: 1,
          schedule: { on: { hour: 20, minute: 0 }, repeats: true },
        },
      ],
    });
  }
}
```

> Permission prompt + scheduling should happen after login, not on app launch.

---

## Step 6 — App Icon & Splash Screen

Capacitor expects assets in `resources/`:

```
frontend/resources/
  icon.png         (1024x1024, no transparency)
  splash.png       (2732x2732)
```

Use the `@capacitor/assets` tool to auto-generate all sizes:

```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

---

## Step 7 — Final Sync

```bash
npm run build
npx cap sync
```

Always run this after any code or asset change before opening Xcode.

---

## Step 8 — Open Xcode & Submit (on MacBook)

```bash
npx cap open ios
```

In Xcode:
1. Select your Apple Developer signing team
2. Set deployment target (iOS 14+ recommended)
3. Product → Archive
4. Upload to App Store via Xcode Organizer or Transporter

---

## Notes

- All `@capacitor/*` calls are guarded with `Capacitor.isNativePlatform()` so the web app is unaffected
- `npm run build && npx cap sync` must be run before every Xcode build
- The backend URL (`VITE_API_URL`) is already set via environment variable — no changes needed for native
- Apple Developer Account required ($99/yr) before App Store submission
