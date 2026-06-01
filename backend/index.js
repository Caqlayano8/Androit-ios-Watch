const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const PairingStore = require('./pairingStore');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

const store = new PairingStore();

app.get('/', (req, res) => res.send('Androit-ios-Watch backend running'));

// Create pairing token for a device (device requests pairing)
app.post('/pair', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'missing deviceId' });
  const token = store.createPairing(deviceId);
  return res.json({ success: true, pairingToken: token });
});

// Verify pairing token and complete pairing (phone scans QR / enters code)
app.post('/pair/verify', (req, res) => {
  const { pairingToken, ownerId } = req.body;
  if (!pairingToken || !ownerId) return res.status(400).json({ error: 'missing fields' });
  const deviceId = store.verifyPairing(pairingToken, ownerId);
  if (!deviceId) return res.status(400).json({ error: 'invalid token' });
  return res.json({ success: true, deviceId });
});

// List paired devices for an owner
app.get('/devices/:ownerId', (req, res) => {
  const ownerId = req.params.ownerId;
  const devices = store.getDevicesForOwner(ownerId);
  return res.json({ devices });
});

// WebSocket: expect initial auth message { type: 'auth', token, deviceId, ownerId }
const clients = new Map(); // deviceId -> ws

wss.on('connection', (ws) => {
  console.log('WS client connected');
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return ws.send(JSON.stringify({ error: 'invalid json' })); }

    if (msg.type === 'auth') {
      const { token, deviceId } = msg;
      if (!token || !deviceId) return ws.send(JSON.stringify({ error: 'auth missing fields' }));
      const ok = store.validateDeviceToken(deviceId, token);
      if (!ok) return ws.send(JSON.stringify({ error: 'auth failed' }));
      clients.set(deviceId, ws);
      ws.deviceId = deviceId;
      console.log(`Device ${deviceId} authenticated`);
      return ws.send(JSON.stringify({ success: true, message: 'authenticated' }));
    }

    // Relay messages: { type: 'relay', to: '<deviceId>', payload: {...} }
    if (msg.type === 'relay' && msg.to) {
      const target = clients.get(msg.to);
      if (!target) return ws.send(JSON.stringify({ error: 'target not connected' }));
      target.send(JSON.stringify({ from: ws.deviceId || null, payload: msg.payload }));
      return ws.send(JSON.stringify({ success: true }));
    }

    ws.send(JSON.stringify({ error: 'unknown message type' }));
  });

  ws.on('close', () => {
    if (ws.deviceId) clients.delete(ws.deviceId);
    console.log('WS client disconnected', ws.deviceId);
  });
});

// Periodic ping to keep connections healthy
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend running on ${PORT}`));
