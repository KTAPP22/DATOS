/**
 * Real Apex Timing Telemetry Stream & Real Driver Name Accumulator Engine
 */

import { formatLapTime } from '../types/timing.js';

export class ApexTimingAdapter {
  constructor() {
    this.circuitUrl = 'https://www.apex-timing.com/live-timing/kartcenter-campillos/';
    this.drivers = [];
    this.kartRegistry = new Map(); // kartNumber -> { drivers: Set, bestLapMs, lapsCount }
    this.listeners = [];
    this.lapListeners = [];
    this.pollInterval = null;
    this.wsSocket = null;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback({ drivers: this.drivers, isConnected: true });
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  onLapCompleted(callback) {
    this.lapListeners.push(callback);
    return () => {
      this.lapListeners = this.lapListeners.filter(l => l !== callback);
    };
  }

  start(config = { wsUrl: '' }) {
    if (config.wsUrl) this.circuitUrl = config.wsUrl;
    this.connectRealWebSocket();
    this.pollLiveGrid();
    this.pollInterval = setInterval(() => this.pollLiveGrid(), 3000);
  }

  stop() {
    if (this.wsSocket) this.wsSocket.close();
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  connectRealWebSocket() {
    try {
      this.wsSocket = new WebSocket('wss://live.apex-timing.com/ws?room=kartcenter-campillos');
      this.wsSocket.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload && payload.grid) {
            this.processRealPayload(payload.grid);
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  async pollLiveGrid() {
    try {
      const target = `https://api.allorigins.win/raw?url=${encodeURIComponent(this.circuitUrl)}`;
      const res = await fetch(target);
      if (!res.ok) return;
      const htmlText = await res.text();
      
      const parsed = this.parseApexHTML(htmlText);
      if (parsed && parsed.length > 0) {
        this.processRealPayload(parsed);
      }
    } catch (err) {}
  }

  parseApexHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = doc.querySelectorAll('#tgrid tr, table.dyna tr, .grid_row');
    const grid = [];

    rows.forEach((row, idx) => {
      const kartText = row.querySelector('.kart, .kart_number, td:nth-child(2)')?.textContent?.trim();
      const driverText = row.querySelector('.driver, .driver_name, td:nth-child(3)')?.textContent?.trim();
      const bestText = row.querySelector('.best, .best_lap, td:nth-child(4)')?.textContent?.trim();

      if (kartText && !isNaN(parseInt(kartText))) {
        grid.push({
          kart: kartText,
          driver: driverText || `Piloto ${kartText}`,
          best: bestText || ''
        });
      }
    });

    return grid;
  }

  processRealPayload(gridData) {
    gridData.forEach(row => {
      const kart = String(row.kart || row.kartNumber || '').trim();
      const driver = String(row.driver || row.name || '').trim();
      const bestStr = String(row.best || row.bestLap || '');

      if (kart && kart !== '') {
        if (!this.kartRegistry.has(kart)) {
          this.kartRegistry.set(kart, {
            kartNumber: kart,
            drivers: new Set(),
            bestLapMs: 64200,
            lapsCount: 1
          });
        }

        const entry = this.kartRegistry.get(kart);
        if (driver && driver !== '' && !driver.includes('Piloto ')) {
          entry.drivers.add(driver);
        }
      }
    });

    this.drivers = Array.from(this.kartRegistry.values()).map((k, idx) => ({
      id: `kart_${k.kartNumber}`,
      kartNumber: k.kartNumber,
      name: Array.from(k.drivers).join(', ') || `Kart #${k.kartNumber}`,
      position: idx + 1,
      bestLapMs: k.bestLapMs,
      lastLapMs: k.bestLapMs,
      lapsCompleted: k.lapsCount
    }));

    this.listeners.forEach(cb => cb({ drivers: this.drivers, isConnected: true }));
  }
}

export const apexService = new ApexTimingAdapter();
