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

Enhancements in this update:
- Pairing endpoints: `POST /pair`, `POST /pair/verify`, `GET /devices/:ownerId`
- Persistent-in-memory `pairingStore` with token lifecycle
- WebSocket relay with auth and `relay` messages

WebSocket auth flow:
1. Connect to `ws://HOST:PORT` and send `{ "type": "auth", "deviceId": "...", "token": "..." }`.
2. Send relay messages: `{ "type": "relay", "to": "<deviceId>", "payload": {...} }`.

Note: This is a prototype. Replace `pairingStore` with a DB for production and secure the WS transport (TLS) behind a reverse proxy or use wss.

Production (example):

1. Place TLS cert files under `deploy/certs` as `fullchain.pem` and `privkey.pem`.
2. Start with `docker compose -f docker-compose.prod.yml up --build -d`.

For production consider using a managed reverse-proxy (Cloud load balancer) or add an automated Let's Encrypt sidecar like `nginx-proxy` + `acme-companion`.
