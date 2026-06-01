const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PairingStore {
  constructor(filePath) {
    this.filePath = filePath || path.join(__dirname, 'pairing_store.json');
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({ pairings: {}, devices: {} }, null, 2));
    }
    this._load();
  }

  _load() {
    const raw = fs.readFileSync(this.filePath, 'utf8');
    const data = JSON.parse(raw || '{}');
    this.pairings = new Map(Object.entries(data.pairings || {}));
    this.devices = new Map(Object.entries(data.devices || {}));
  }

  _save() {
    const obj = {
      pairings: Object.fromEntries(this.pairings),
      devices: Object.fromEntries(this.devices),
    };
    fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2));
  }

  _randomToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  createPairing(deviceId, ttlSeconds = 300) {
    const token = this._randomToken();
    const now = Date.now();
    this.pairings.set(token, { deviceId, createdAt: now, expiresAt: now + ttlSeconds * 1000 });
    this._save();
    return token;
  }

  verifyPairing(token, ownerId) {
    const rec = this.pairings.get(token);
    if (!rec) return null;
    if (Date.now() > rec.expiresAt) {
      this.pairings.delete(token);
      this._save();
      return null;
    }
    // Persist device ownership
    this.devices.set(rec.deviceId, { ownerId, pairedAt: Date.now() });
    this.pairings.delete(token);
    this._save();
    return rec.deviceId;
  }

  getDevicesForOwner(ownerId) {
    const out = [];
    for (const [deviceId, info] of this.devices.entries()) {
      if (info.ownerId === ownerId) out.push({ deviceId, pairedAt: info.pairedAt });
    }
    return out;
  }

  validateDeviceToken(deviceId /*, token - not used for prototype */) {
    return this.devices.has(deviceId);
  }
}

module.exports = PairingStore;
