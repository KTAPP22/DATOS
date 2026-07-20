import React, { useState } from 'react';
import { formatLapTime, formatDelta } from '../types/timing.js';
import { Search, Trophy, ShieldAlert, Award } from 'lucide-react';

export function Leaderboard({ drivers, myKartNumber, onSelectKart }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.kartNumber.includes(searchTerm)
  );

  const bestLapSession = Math.min(...drivers.map(d => d.bestLapMs || 999999));

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden select-none">
      {/* Top Search & Filter Bar */}
      <div className="p-2 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por Kart o Piloto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-race-neon"
          />
        </div>
        <div className="text-[11px] font-mono text-zinc-400 font-bold px-2 py-1 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0">
          KARTS EN PISTA: <span className="text-race-neon">{drivers.length}</span>
        </div>
      </div>

      {/* Standings Table Header */}
      <div className="grid grid-cols-12 gap-1 px-2 py-2 bg-zinc-900/80 text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 shrink-0">
        <div className="col-span-1 text-center">POS</div>
        <div className="col-span-2 text-center">KART</div>
        <div className="col-span-4">PILOTO</div>
        <div className="col-span-3 text-right">MEJOR VUELTA</div>
        <div className="col-span-2 text-right">GAP</div>
      </div>

      {/* Standings Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-zinc-900/60">
        {filteredDrivers.map((driver) => {
          const isMyKart = driver.kartNumber === myKartNumber;
          const isAbsoluteBest = driver.bestLapMs === bestLapSession;

          return (
            <div
              key={driver.id}
              onClick={() => onSelectKart(driver.kartNumber)}
              className={`grid grid-cols-12 gap-1 px-2 py-2.5 items-center transition-all cursor-pointer ${
                isMyKart
                  ? 'bg-zinc-900/90 border-l-4 border-race-neon text-white font-bold'
                  : 'hover:bg-zinc-950/80 text-zinc-200'
              }`}
            >
              {/* Position */}
              <div className="col-span-1 flex justify-center">
                <span className={`font-mono text-xs font-black px-1.5 py-0.5 rounded ${
                  driver.position === 1 ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
                  driver.position === 2 ? 'bg-zinc-300 text-black' :
                  driver.position === 3 ? 'bg-amber-700 text-white' : 'text-zinc-400'
                }`}>
                  {driver.position}
                </span>
              </div>

              {/* Kart # */}
              <div className="col-span-2 text-center">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded-md border ${
                  isMyKart 
                    ? 'bg-race-neon text-black border-race-neon shadow-[0_0_10px_rgba(0,255,102,0.4)]' 
                    : 'bg-black border-zinc-800 text-zinc-200'
                }`}>
                  #{driver.kartNumber}
                </span>
              </div>

              {/* Driver Name & Status */}
              <div className="col-span-4 min-w-0">
                <div className="text-xs font-bold truncate flex items-center gap-1">
                  <span className="truncate">{driver.name}</span>
                  {driver.inPits && (
                    <span className="bg-red-950 text-red-400 border border-red-800 text-[9px] px-1 rounded font-mono">BOX</span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 truncate flex gap-2">
                  <span>Última: <span className="text-zinc-300 font-bold">{formatLapTime(driver.lastLapMs)}</span></span>
                  <span>V: <span className="text-zinc-300">{driver.lapsCompleted}</span></span>
                </div>
              </div>

              {/* Best Lap */}
              <div className="col-span-3 text-right">
                <div className={`font-mono text-xs font-black ${
                  isAbsoluteBest 
                    ? 'text-race-purple text-glow-purple font-extrabold' 
                    : 'text-race-neon'
                }`}>
                  {formatLapTime(driver.bestLapMs)}
                </div>
                <div className="text-[9px] font-mono text-zinc-500">
                  S1: {formatLapTime(driver.s1Ms)}
                </div>
              </div>

              {/* Gap */}
              <div className="col-span-2 text-right font-mono text-xs font-semibold text-zinc-400">
                {driver.position === 1 ? (
                  <span className="text-amber-400 text-[10px] font-bold">LÍDER</span>
                ) : (
                  <span>{formatDelta(driver.gapMs / 1000)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
