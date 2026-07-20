import React from 'react';
import { formatLapTime, formatDelta } from '../types/timing.js';
import { Zap, ChevronRight, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

export function PitBoard({ drivers, myKartNumber, onSelectKart }) {
  // Find selected kart or default to leader/first driver
  const currentDriver = drivers.find(d => d.kartNumber === myKartNumber) || drivers[0];
  const leader = drivers[0];

  if (!currentDriver) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black p-4 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-400 mb-2" />
        <h2 className="text-xl font-bold text-white">SIN DATOS DE TELEMETRÍA</h2>
        <p className="text-sm text-zinc-400">Selecciona tu número de Kart en la configuración.</p>
      </div>
    );
  }

  // Calculate Delta vs Personal Best or Leader
  const deltaVsBest = (currentDriver.lastLapMs - currentDriver.bestLapMs) / 1000;
  const isDeltaNegative = deltaVsBest <= 0;

  return (
    <div className="flex-1 flex flex-col justify-between bg-black p-2.5 space-y-2 select-none overflow-hidden">
      {/* Top Banner: Driver Name & Kart Selector */}
      <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center bg-race-neon text-black font-extrabold font-mono text-xl w-11 h-11 rounded-lg shadow-[0_0_15px_rgba(0,255,102,0.4)]">
            #{currentDriver.kartNumber}
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight uppercase tracking-tight">
              {currentDriver.name}
            </h1>
            <p className="text-[11px] font-mono text-zinc-400">
              VUELTAS: <span className="text-white font-bold">{currentDriver.lapsCompleted}</span>
            </p>
          </div>
        </div>

        {/* Quick Selector */}
        <select
          value={myKartNumber || ''}
          onChange={(e) => onSelectKart(e.target.value)}
          className="bg-black border border-zinc-700 text-race-neon text-xs font-mono font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-race-neon"
        >
          <option value="">CAMBIAR KART</option>
          {drivers.map(d => (
            <option key={d.id} value={d.kartNumber}>
              KART #{d.kartNumber} - {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Position & Delta Split */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        {/* Position Card */}
        <div className="flex flex-col justify-center items-center bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-3 text-center">
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest">POSICIÓN</span>
          <div className="text-6xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            P{currentDriver.position}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1">
            GAP LÍDER: <span className="text-zinc-300 font-bold">{currentDriver.position === 1 ? 'LÍDER' : formatDelta(currentDriver.gapMs / 1000)}</span>
          </span>
        </div>

        {/* Delta Card */}
        <div className={`flex flex-col justify-center items-center rounded-2xl p-3 border-2 text-center transition-all ${
          isDeltaNegative 
            ? 'bg-emerald-950/40 border-race-neon text-race-neon shadow-[0_0_20px_rgba(0,255,102,0.2)]' 
            : 'bg-red-950/40 border-race-red text-race-red shadow-[0_0_20px_rgba(255,51,68,0.2)]'
        }`}>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest opacity-80">DELTA VS MEJOR</span>
          <div className="text-4xl font-extrabold font-mono tracking-tighter flex items-center justify-center gap-1 my-1">
            {isDeltaNegative ? <ArrowDown className="w-7 h-7" /> : <ArrowUp className="w-7 h-7" />}
            <span>{formatDelta(deltaVsBest)}</span>
          </div>
          <span className="text-[10px] font-mono opacity-75">
            {isDeltaNegative ? '¡MEJORANDO TIEMPO!' : 'PERDIENDO TIEMPO'}
          </span>
        </div>
      </div>

      {/* GIANT LAST LAP TIME DISPLAY */}
      <div className={`flex-1 flex flex-col justify-center items-center bg-black border-4 rounded-3xl p-4 my-1 relative overflow-hidden transition-all ${
        currentDriver.lastLapColor === 'PURPLE'
          ? 'border-race-purple text-race-purple text-glow-purple shadow-[0_0_35px_rgba(217,70,239,0.3)]'
          : currentDriver.lastLapColor === 'GREEN'
          ? 'border-race-neon text-race-neon text-glow-neon shadow-[0_0_35px_rgba(0,255,102,0.3)]'
          : 'border-zinc-800 text-white'
      }`}>
        <div className="absolute top-2 left-4 text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
          ÚLTIMA VUELTA (LAST LAP)
        </div>

        <div className="text-6xl sm:text-7xl font-mono font-black tracking-tighter my-auto font-mono-numbers">
          {formatLapTime(currentDriver.lastLapMs)}
        </div>

        <div className="w-full flex justify-between items-center text-xs font-mono pt-2 border-t border-zinc-900">
          <span className="text-zinc-400">MEJOR VUELTA EN SESIÓN:</span>
          <span className="text-race-neon font-black text-sm">
            {formatLapTime(currentDriver.bestLapMs)}
          </span>
        </div>
      </div>

      {/* Sectors Breakdown */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-center">
          <div className="text-[10px] font-mono text-zinc-400 font-bold">SECTOR 1</div>
          <div className="text-lg font-mono font-black text-white mt-0.5">
            {formatLapTime(currentDriver.s1Ms)}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-center">
          <div className="text-[10px] font-mono text-zinc-400 font-bold">SECTOR 2</div>
          <div className="text-lg font-mono font-black text-white mt-0.5">
            {formatLapTime(currentDriver.s2Ms)}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-center">
          <div className="text-[10px] font-mono text-zinc-400 font-bold">SECTOR 3</div>
          <div className="text-lg font-mono font-black text-white mt-0.5">
            {formatLapTime(currentDriver.s3Ms)}
          </div>
        </div>
      </div>
    </div>
  );
}
