import React, { useState } from 'react';
import { X, Radio, Server, Database, Flag, Check, Cpu } from 'lucide-react';
import { TRACK_FLAGS } from '../types/timing.js';

export function SettingsModal({
  isOpen,
  onClose,
  isSimulator,
  onToggleSimulator,
  myKartNumber,
  onSelectKart,
  drivers,
  wsUrl,
  onSaveWsUrl,
  sessionMeta,
  onSetFlag
}) {
  const [inputWsUrl, setInputWsUrl] = useState(wsUrl || '');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveWsUrl(inputWsUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-900 sticky top-0 bg-zinc-950 z-10">
          <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
            <Cpu className="w-4 h-4 text-race-neon" />
            <span>CONFIGURACIÓN APEX TIMING</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs font-mono">
          {/* Section 1: My Kart Selection */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              SELECCIÓN DE MI KART (PITBOARD FOCUS)
            </label>
            <select
              value={myKartNumber || ''}
              onChange={(e) => onSelectKart(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-race-neon font-bold focus:outline-none focus:border-race-neon"
            >
              <option value="">-- SELECCIONAR KART --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.kartNumber}>
                  KART #{d.kartNumber} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Mode Toggle */}
          <div className="bg-black border border-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px]">MODO SIMULADOR DE PISTA</span>
              <button
                onClick={() => onToggleSimulator(!isSimulator)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSimulator ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSimulator ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-zinc-500">
              {isSimulator 
                ? 'El simulador está generando vueltas y deltas realistas de carrera.'
                : 'Conectado o intentando conectar a servidor en vivo de Apex Timing.'}
            </p>
          </div>

          {/* Section 3: Apex Timing WebSocket Endpoint */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              URL WEBSOCKET APEX TIMING (LIVE)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputWsUrl}
                onChange={(e) => setInputWsUrl(e.target.value)}
                placeholder="wss://live.apex-timing.com/ws/circuit_id"
                className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-race-neon"
              />
              <button
                onClick={handleSave}
                className="bg-race-neon text-black font-extrabold px-3 py-2 rounded-xl hover:bg-emerald-400"
              >
                GUARDAR
              </button>
            </div>
            {savedSuccess && (
              <span className="text-race-neon text-[10px] flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" /> Configuración guardada correctamente
              </span>
            )}
          </div>

          {/* Section 4: Manual Flag Simulation */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-900">
            <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              SIMULAR BANDERAS DE PISTA
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(TRACK_FLAGS).map((flag) => (
                <button
                  key={flag.code}
                  onClick={() => onSetFlag(flag.code)}
                  className={`py-1.5 px-2 rounded-lg font-bold text-[10px] border transition-all ${
                    sessionMeta?.flag === flag.code
                      ? 'border-white bg-zinc-800 text-white shadow-md'
                      : 'border-zinc-800 bg-black text-zinc-400 hover:text-white'
                  }`}
                >
                  {flag.code}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Supabase Phase 2 Setup */}
          <div className="bg-black border border-zinc-900 rounded-xl p-3 space-y-2 pt-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold text-[11px]">
              <Database className="w-3.5 h-3.5 text-race-neon" />
              <span>SUPABASE PERSISTENCE (FASE 2)</span>
            </div>
            <input
              type="text"
              placeholder="Supabase Project URL"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-300"
            />
            <input
              type="password"
              placeholder="Supabase Anon Key"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
