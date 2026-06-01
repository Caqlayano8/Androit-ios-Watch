const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

app.get('/', (req, res) => res.send('Androit-ios-Watch backend running'));

// Simple pairing endpoint (prototype)
app.post('/pair', (req, res) => {
  // Expect { deviceId, code }
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'missing deviceId' });
  // In real implementation: create pairing token, store mapping
  return res.json({ success: true, pairingToken: 'demo-token-' + Date.now() });
});

wss.on('connection', (ws) => {
  console.log('WS client connected');
  ws.on('message', (msg) => {
    console.log('received:', msg.toString());
    // Echo for now
    ws.send(JSON.stringify({ echo: msg.toString() }));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend running on ${PORT}`));
