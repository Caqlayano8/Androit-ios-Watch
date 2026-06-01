# Androit-ios-Watch

Monorepo scaffold for the Android/iOS/Wear OS bridge prototype.

Contents:
- `backend/` — Node.js prototype (pairing API + WebSocket relay)
- `mobile/android/` — Android phone app prototype (Kotlin)
- `mobile/wear/` — Wear OS companion prototype (Kotlin)
- `mobile/ios/` — iOS prototype (Swift)

How to run backend locally:

```bash
cd backend
npm install
npm start
```

Next steps: initialize git, push to GitHub, add CI secrets for iOS signing.
