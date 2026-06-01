const WebSocket = require('ws');

const BASE = process.env.BASE || 'http://localhost:3000';

function wait(ms){return new Promise(r=>setTimeout(r,ms));}

async function post(path, body){
  const res = await fetch(BASE + path, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body)});
  return res.json();
}

async function main(){
  console.log('Creating pairing for device-A');
  const a = await post('/pair', {deviceId: 'device-A'});
  console.log('tokenA:', a.pairingToken);
  await post('/pair/verify', {pairingToken: a.pairingToken, ownerId: 'owner1'});

  console.log('Creating pairing for device-B');
  const b = await post('/pair', {deviceId: 'device-B'});
  console.log('tokenB:', b.pairingToken);
  await post('/pair/verify', {pairingToken: b.pairingToken, ownerId: 'owner1'});

  await wait(200);

  const wsA = new WebSocket('ws://localhost:3000');
  const wsB = new WebSocket('ws://localhost:3000');

  await Promise.all([
    new Promise((resolve) => wsA.on('open', resolve)),
    new Promise((resolve) => wsB.on('open', resolve)),
  ]);

  function onceMessage(ws){
    return new Promise((resolve) => ws.once('message', (m) => resolve(m.toString())));
  }

  wsA.send(JSON.stringify({type: 'auth', deviceId: 'device-A', token: 'x'}));
  let authA = await onceMessage(wsA);
  console.log('authA:', authA);

  wsB.send(JSON.stringify({type: 'auth', deviceId: 'device-B', token: 'x'}));
  let authB = await onceMessage(wsB);
  console.log('authB:', authB);

  // Prepare to receive relay
  const recv = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout waiting for relay')), 5000);
    wsB.on('message', (m) => { clearTimeout(t); resolve(m.toString()); });
  });

  // Send relay from A to B
  wsA.send(JSON.stringify({type: 'relay', to: 'device-B', payload: {text: 'hello from A'}}));

  const msg = await recv;
  console.log('device-B received:', msg);

  // cleanup
  wsA.close(); wsB.close();
  console.log('Integration test passed');
}

main().catch((e)=>{ console.error('Test failed:', e); process.exit(1); });
