import React, { useState, useEffect } from 'react';
import { supabaseSink } from '../services/supabaseDataSink.js';
import { formatLapTime, formatDelta } from '../types/timing.js';
import { Trophy, Download, RefreshCw, ChevronDown, ChevronUp, Activity, Trash2 } from 'lucide-react';

export function KartAnalyticsPrep() {
  const [kartSummary, setKartSummary] = useState([]);
  const [selectedKartDetails, setSelectedKartDetails] = useState(null);
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'best' | 'top5'

  const loadSummary = () => {
    const data = supabaseSink.getKartPerformanceSummary();
    setKartSummary(data);
  };

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 2000);
    return () => clearInterval(interval);
  }, []);

  const sortedSummary = [...kartSummary].sort((a, b) => {
    if (sortBy === 'best') return a.bestLapMs - b.bestLapMs;
    if (sortBy === 'top5') return a.avgTop5Ms - b.avgTop5Ms;
    return b.score - a.score; // Default Best to Worst Score
  });

  return (
    <div className="flex-1 flex flex-col bg-black p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar select-none">
      {/* Classification Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-race-purple text-glow-purple font-black font-mono text-xs">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>CLASIFICADOR DE KARTS (MEJOR A PEOR)</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => supabaseSink.exportSessionJSON()}
              title="Exportar vueltas JSON"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Limpiar historial de vueltas registradas?')) {
                  supabaseSink.clearCache();
                  loadSummary();
                }
              }}
              title="Limpiar datos"
              className="p-1.5 bg-zinc-800 hover:bg-red-950 text-red-400 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-snug">
          Análisis automatizado de telemetría de todas las vueltas para detectar la potencia y agarre real de cada chasis de kart.
        </p>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-900 text-[10px] font-mono">
          <span className="text-zinc-500 font-bold uppercase">ORDENAR POR:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'score' 
                  ? 'bg-race-purple text-black font-extrabold shadow-[0_0_10px_rgba(217,70,239,0.5)]' 
                  : 'bg-black text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              PUNTUACIÓN (MEJOR A PEOR)
            </button>
            <button
              onClick={() => setSortBy('best')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'best' 
                  ? 'bg-race-purple text-black font-extrabold shadow-[0_0_10px_rgba(217,70,239,0.5)]' 
                  : 'bg-black text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              VUELTA RÁPIDA
            </button>
          </div>
        </div>
      </div>

      {/* Main Karts Classification List */}
      {sortedSummary.length === 0 ? (
        <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Activity className="w-10 h-10 text-race-purple mb-2 animate-spin" />
          <h3 className="text-sm font-bold font-mono text-white">RECOPILANDO VUELTAS DE KARTS...</h3>
          <p className="text-xs font-mono text-zinc-400 mt-1 max-w-xs">
            Mantén la app abierta mientras los karts completan vueltas en pista o activa el simulador para procesar el ranking.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSummary.map((kart, index) => {
            const isTop1 = index === 0;
            const isSlowest = index === sortedSummary.length - 1 && sortedSummary.length > 1;
            const isExpanded = selectedKartDetails === kart.kartNumber;

            return (
              <div
                key={kart.kartNumber}
                className={`bg-zinc-950 border-2 rounded-2xl p-3.5 transition-all ${
                  isTop1 
                    ? 'border-race-purple shadow-[0_0_25px_rgba(217,70,239,0.35)]' 
                    : isSlowest
                    ? 'border-red-950/80 shadow-[0_0_15px_rgba(255,51,68,0.2)]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Header Row: Rank, Kart Number, Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`flex items-center justify-center font-mono font-black text-base w-9 h-9 rounded-xl ${
                      isTop1 ? 'bg-race-purple text-black shadow-[0_0_12px_rgba(217,70,239,0.6)]' :
                      index === 1 ? 'bg-purple-900 text-white' :
                      index === 2 ? 'bg-zinc-800 text-purple-300' : 'bg-black text-zinc-500 border border-zinc-800'
                    }`}>
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-white">
                          KART #{kart.kartNumber}
                        </span>
                        <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${kart.statusColor}`}>
                          {kart.statusLabel}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5 flex gap-2">
                        <span>Vueltas válidas: <strong className="text-zinc-300">{kart.cleanLapsCount}</strong> / {kart.totalLaps}</span>
                        {kart.drivers.length > 0 && (
                          <span>Pilotos: <strong className="text-race-purple">{kart.drivers.join(', ')}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right font-mono">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase">PUNTUACIÓN</div>
                    <div className={`text-2xl font-black ${
                      kart.score >= 90 ? 'text-race-purple text-glow-purple' :
                      kart.score >= 75 ? 'text-purple-300' : 'text-race-red text-glow-red'
                    }`}>
                      {kart.score}<span className="text-xs text-zinc-500 font-normal">/100</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-zinc-900 text-center font-mono">
                  <div className="bg-black border border-zinc-900 rounded-xl p-2">
                    <span className="text-[9px] text-zinc-500 font-bold block uppercase">MEJOR VUELTA</span>
                    <span className="text-sm font-black text-race-purple text-glow-purple">
                      {formatLapTime(kart.bestLapMs)}
                    </span>
                  </div>

                  <div className="bg-black border border-zinc-900 rounded-xl p-2">
                    <span className="text-[9px] text-zinc-500 font-bold block uppercase">PROMEDIO TOP 5</span>
                    <span className="text-sm font-bold text-zinc-200">
                      {formatLapTime(kart.avgTop5Ms)}
                    </span>
                  </div>

                  <div className="bg-black border border-zinc-900 rounded-xl p-2">
                    <span className="text-[9px] text-zinc-500 font-bold block uppercase">VS MEDIA FLOTA</span>
                    <span className={`text-sm font-black ${
                      kart.deltaVsFleetAvgSeconds <= 0 ? 'text-race-purple' : 'text-race-red'
                    }`}>
                      {formatDelta(kart.deltaVsFleetAvgSeconds)}s
                    </span>
                  </div>
                </div>

                {/* Expand Laps Details Accordion Button */}
                <button
                  onClick={() => setSelectedKartDetails(isExpanded ? null : kart.kartNumber)}
                  className="w-full mt-2 pt-1.5 flex items-center justify-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-race-purple transition-colors border-t border-zinc-900/60 font-bold"
                >
                  <span>{isExpanded ? '▲ OCULTAR DESGLOSE DE VUELTAS' : `▼ VER TODAS LAS VUELTAS (${kart.totalLaps})`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Expandable Laps History Table */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-zinc-900 space-y-1 font-mono">
                    <div className="grid grid-cols-12 gap-1 text-[9px] font-bold text-zinc-500 px-2 uppercase">
                      <div className="col-span-2">VUELTA</div>
                      <div className="col-span-4">TIEMPO</div>
                      <div className="col-span-3">S1 / S2 / S3</div>
                      <div className="col-span-3 text-right">PILOTO</div>
                    </div>

                    <div className="max-h-40 overflow-y-auto custom-scrollbar divide-y divide-zinc-900 bg-black rounded-xl border border-zinc-900 p-1">
                      {kart.rawLaps.map((lap) => (
                        <div key={lap.id} className="grid grid-cols-12 gap-1 text-[10px] py-1 px-1.5 items-center">
                          <div className="col-span-2 font-bold text-zinc-400">#{lap.lap_number}</div>
                          <div className={`col-span-4 font-bold ${
                            lap.is_session_best ? 'text-race-purple font-black text-glow-purple' :
                            lap.is_personal_best ? 'text-purple-300' : 'text-zinc-200'
                          }`}>
                            {lap.lap_time_formatted}
                          </div>
                          <div className="col-span-3 text-[9px] text-zinc-500 truncate">
                            {formatLapTime(lap.s1_ms)} / {formatLapTime(lap.s2_ms)}
                          </div>
                          <div className="col-span-3 text-right text-zinc-400 truncate">
                            {lap.driver_name || 'Anónimo'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
