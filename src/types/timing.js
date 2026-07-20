/**
 * Apex Timing & Kart Telemetry Data Interfaces
 */

export const CIRCUITS_PRESETS = [
  {
    id: 'kartcenter-campillos',
    name: '🏁 Kartcenter Campillos (Málaga)',
    url: 'https://www.apex-timing.com/live-timing/kartcenter-campillos/',
    baseLapMs: 64200,
    trackLength: '1.580m'
  },
  {
    id: 'ariza-racing',
    name: '🏁 Karting Ariza Racing Circuit',
    url: 'https://www.apex-timing.com/live-timing/ariza-racing-circuit/',
    baseLapMs: 56800,
    trackLength: '1.240m'
  },
  {
    id: 'lucas-guerrero',
    name: '🏁 Kartodromo Lucas Guerrero',
    url: 'https://www.apex-timing.com/live-timing/lucas-guerrero/',
    baseLapMs: 58100,
    trackLength: '1.428m'
  },
  {
    id: 'karting-vendrell',
    name: '🏁 Karting Vendrell',
    url: 'https://www.apex-timing.com/live-timing/karting-vendrell/',
    baseLapMs: 49300,
    trackLength: '1.310m'
  }
];

export function formatLapTime(ms) {
  if (!ms || isNaN(ms) || ms === 0) return "--.---";
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  
  if (minutes > 0) {
    const padSec = (totalSeconds % 60 < 10 ? '0' : '') + seconds;
    return `${minutes}:${padSec}`;
  }
  return seconds;
}

export function formatDelta(deltaSeconds) {
  if (deltaSeconds === null || deltaSeconds === undefined || isNaN(deltaSeconds)) return " 0.000";
  const sign = deltaSeconds > 0 ? "+" : "";
  return `${sign}${deltaSeconds.toFixed(3)}`;
}

export const TRACK_FLAGS = {
  GREEN: { code: 'GREEN', name: 'Bandera Verde (Pista Libre)', color: '#D946EF', bg: 'bg-purple-950/40 text-race-purple border-race-purple/60' },
  YELLOW: { code: 'YELLOW', name: 'Bandera Amarilla (Precaución)', color: '#FFCC00', bg: 'bg-yellow-950/40 text-yellow-400 border-yellow-500' },
  RED: { code: 'RED', name: 'Bandera Roja (Sesión Detenida)', color: '#FF3344', bg: 'bg-red-950/40 text-red-500 border-red-500' }
};
