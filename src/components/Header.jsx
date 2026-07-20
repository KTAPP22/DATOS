import React from 'react';
import { Trophy, Settings, Trash2, Power, Clock } from 'lucide-react';

export function Header({ 
  selectedCircuit, 
  onSelectCircuit, 
  totalKarts, 
  statusText, 
  isRecording, 
  onToggleRecording, 
  onResetCircuit, 
  onOpenLiveTiming,
  onOpenSettings 
}) {
  return (
    <header className="w-full bg-black border-b border-oled-border flex flex-col shrink-0 select-none font-mono">
      {/* Top Line: Live Recording Toggle, TIMING Button & Per-Circuit Reset Button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900 text-xs">
        {/* Left: ON / OFF Recording Button */}
        <button
          onClick={onToggleRecording}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all shadow-md ${
            isRecording 
              ? 'bg-race-purple text-black shadow-[0_0_12px_rgba(217,70,239,0.6)] animate-pulse' 
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isRecording ? 'REC: ON' : 'REC: OFF'}</span>
        </button>

        {/* Center: LIVE TIMING BUTTON */}
        <button
          onClick={onOpenLiveTiming}
          className="bg-race-purple text-black font-mono font-black text-xs px-3 py-1 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_12px_rgba(217,70,239,0.6)] flex items-center gap-1"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>TIMING EN DIRECTO</span>
        </button>

        {/* Right: RESET ONLY FOR CURRENT CIRCUIT */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetCircuit}
            title={`Borrar datos guardados solo de ${selectedCircuit?.name}`}
            className="bg-red-950/80 border border-race-red text-race-red font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-xl hover:bg-red-900 hover:text-white transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>REINICIAR</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-bold px-2 py-1 rounded-xl hover:text-white"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Title Bar */}
      <div className="px-3 py-2 bg-black flex items-center justify-between">
        <h1 className="text-base font-black text-white flex items-center gap-1.5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-race-purple text-glow-purple">CLASIFICACIÓN DE KARTS Y PILOTOS</span>
        </h1>
        <span className="text-[11px] font-bold text-zinc-400">
          KARTS: <strong className="text-race-purple">{totalKarts}</strong>
        </span>
      </div>
    </header>
  );
}
