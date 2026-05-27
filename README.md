# Knee Rehab — iOS app

Native iPhone app (Expo / React Native) for your post-meniscectomy rehab protocol. Check off exercises per session; progress is saved on device.

## Requirements

- Mac with **Xcode** (from the Mac App Store)
- **Node.js** 18+ ([nodejs.org](https://nodejs.org) or `brew install node`)
- iPhone on **iOS 16+** with **Developer Mode** enabled
- Free **Apple ID** (Personal Team) for sideloading — or a paid Apple Developer account

## Install on your iPhone (sideload)

### 1. One-time iPhone setup

1. **Settings → Privacy & Security → Developer Mode** → On → restart when prompted.
2. Connect iPhone to Mac with USB (or use wireless debugging in Xcode later).

### 2. Build and run from your Mac

```bash
cd ~/Downloads/knee-rehab-app
npm install
npx expo prebuild --platform ios
```

Open the native project in Xcode:

```bash
open ios/KneeRehab.xcworkspace
```

In Xcode:

1. Select the **Knee Rehab** target → **Signing & Capabilities**.
2. Set **Team** to your Apple ID (Xcode → Settings → Accounts → add Apple ID if needed).
3. Change **Bundle Identifier** if needed (e.g. `com.yourname.kneerehab`) — must be unique to your Apple ID.
4. Plug in your iPhone, select it as the run destination (top toolbar).
5. Click **Run** (▶). On first install, on the phone: **Settings → General → VPN & Device Management** → trust your developer certificate.

Or from the terminal (same signing rules apply):

```bash
npx expo run:ios --device
```

The app installs like any dev build. It stays until the **7-day** free provisioning window expires; then run from Xcode again to refresh.

### 3. Optional: run in Expo Go (quick preview, not a standalone app)

```bash
npm start
```

Scan the QR code with the **Camera** app and open in **Expo Go**. Good for testing UI; for a home-screen app without Expo Go, use the Xcode steps above.

## Project layout

| Path | Purpose |
|------|---------|
| `App.js` | Entry point |
| `src/KneeRehab.js` | Main UI |
| `src/phases.js` | Phase 1–3 exercises and unlock criteria |
| `app.json` | App name, bundle ID, iOS config |

## Customize bundle ID

Edit `app.json` → `expo.ios.bundleIdentifier`, then:

```bash
npx expo prebuild --clean --platform ios
```

## Medical disclaimer

This app is a workout tracker based on your rehab plan. It is not medical advice. Follow your surgeon and physical therapist’s guidance.
