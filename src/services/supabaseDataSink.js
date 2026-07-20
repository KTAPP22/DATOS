/**
 * Supabase / PostgreSQL Phase 2 Data Sink & Kart Performance Classifier Engine
 * 
 * Analyzes all lap records from Apex Timing to classify karts from fastest (best) to slowest (worst).
 */

class SupabaseDataSink {
  constructor() {
    this.supabaseClient = null;
    this.isConfigured = false;
    this.localLapBuffer = [];
    
    // Initialize from LocalStorage if available
    try {
      const saved = localStorage.getItem('apex_kart_laps_buffer');
      if (saved) {
        this.localLapBuffer = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage not available for lap buffer');
    }
  }

  /**
   * Configure Supabase connection credentials (For Phase 2 enablement)
   */
  initSupabase(url, anonKey) {
    if (url && anonKey) {
      this.isConfigured = true;
      console.log('[Phase 2 Data Sink] Supabase client initialized with endpoint:', url);
    }
  }

  /**
   * Save incoming lap record into persistence pipeline
   * @param {import('../types/timing.js').KartSessionLap} lap 
   */
  async saveLap(lap) {
    // 1. Always store in local buffer for immediate in-app Kart Analytics
    this.localLapBuffer.push(lap);
    
    // Keep max 1000 laps in local storage buffer for deep multi-session analysis
    if (this.localLapBuffer.length > 1000) {
      this.localLapBuffer.shift();
    }

    try {
      localStorage.setItem('apex_kart_laps_buffer', JSON.stringify(this.localLapBuffer));
    } catch (e) {
      // quota limit fallback
    }

    // 2. If Supabase is connected in Phase 2, post directly to PostgreSQL `kart_laps` table
    if (this.isConfigured && this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('kart_laps')
          .insert([lap]);

        if (error) throw error;
      } catch (err) {
        console.error('[Supabase Sink] Error persisting lap to Supabase:', err);
      }
    }
  }

  /**
   * ADVANCED KART CHASSIS CLASSIFIER (Best to Worst Kart Analysis)
   * Analyzes every lap recorded per kart, removes traffic/spins, calculates pace delta vs fleet benchmark.
   */
  getKartPerformanceSummary() {
    const kartMap = new Map();

    this.localLapBuffer.forEach(lap => {
      const k = lap.kart_number;
      if (!kartMap.has(k)) {
        kartMap.set(k, { laps: [], drivers: new Set() });
      }
      const item = kartMap.get(k);
      item.laps.push(lap);
      if (lap.driver_name) item.drivers.add(lap.driver_name);
    });

    if (kartMap.size === 0) return [];

    // Step 1: Collect best laps across fleet to set benchmark
    const allBestLaps = [];
    kartMap.forEach(({ laps }) => {
      const lapTimes = laps.map(l => l.lap_time_ms);
      const minLap = Math.min(...lapTimes);
      allBestLaps.push(minLap);
    });

    // Global Fleet Best & Fleet Average Best
    const absoluteSessionBestMs = Math.min(...allBestLaps);
    const fleetAvgBestMs = Math.round(allBestLaps.reduce((a, b) => a + b, 0) / allBestLaps.length);

    const summary = [];

    kartMap.forEach(({ laps, drivers }, kartNumber) => {
      if (laps.length === 0) return;

      const lapTimesMs = laps.map(l => l.lap_time_ms);
      
      // Sort lap times ascending (fastest first)
      const sortedTimes = [...lapTimesMs].sort((a, b) => a - b);
      const bestLapMs = sortedTimes[0];

      // Remove outlier laps (warmup/traffic/spins: > 15% slower than kart's median)
      const medianIndex = Math.floor(sortedTimes.length / 2);
      const medianTime = sortedTimes[medianIndex];
      const cleanLaps = sortedTimes.filter(time => time <= medianTime * 1.15);

      // Average of clean top 3 and top 5 laps
      const top3 = cleanLaps.slice(0, Math.min(3, cleanLaps.length));
      const top5 = cleanLaps.slice(0, Math.min(5, cleanLaps.length));

      const avgTop3Ms = Math.round(top3.reduce((a, b) => a + b, 0) / top3.length);
      const avgTop5Ms = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);
      const avgCleanMs = Math.round(cleanLaps.reduce((a, b) => a + b, 0) / cleanLaps.length);

      // Delta vs Fleet Average Benchmark (+0.250s = 0.250s slower than avg, -0.300s = faster)
      const deltaVsFleetAvgSeconds = (avgTop5Ms - fleetAvgBestMs) / 1000;
      const deltaVsAbsoluteBestSeconds = (bestLapMs - absoluteSessionBestMs) / 1000;

      // Chassis Pace Performance Score (100 = Absolute Fastest Kart, <70 = Slow Kart)
      let score = 100 - (deltaVsAbsoluteBestSeconds * 55) - (deltaVsFleetAvgSeconds * 25);
      score = Math.max(30, Math.min(100, Math.round(score)));

      // Chassis Health Tier
      let tier = 'B';
      let statusLabel = '⚖️ NORMAL / MEDIO';
      let statusColor = 'text-amber-400 border-amber-500/40 bg-amber-950/20';

      if (score >= 92) {
        tier = 'S';
        statusLabel = '🚀 KART COHETE (CHASIS TOP)';
        statusColor = 'text-race-purple border-race-purple/40 bg-purple-950/30 text-glow-purple';
      } else if (score >= 82) {
        tier = 'A';
        statusLabel = '⚡ KART RÁPIDO';
        statusColor = 'text-race-neon border-race-neon/40 bg-emerald-950/30 text-glow-neon';
      } else if (score < 68) {
        tier = 'C';
        statusLabel = '🐌 KART LENTO / PERDIDA POTENCIA';
        statusColor = 'text-race-red border-race-red/40 bg-red-950/30 text-glow-red';
      }

      summary.push({
        kartNumber,
        totalLaps: laps.length,
        cleanLapsCount: cleanLaps.length,
        bestLapMs,
        avgTop3Ms,
        avgTop5Ms,
        avgCleanMs,
        deltaVsFleetAvgSeconds,
        deltaVsAbsoluteBestSeconds,
        score,
        tier,
        statusLabel,
        statusColor,
        drivers: Array.from(drivers),
        rawLaps: laps.sort((a, b) => a.lap_number - b.lap_number)
      });
    });

    // Sort Karts strictly from BEST to WORST (Highest Score / Fastest Pace First)
    return summary.sort((a, b) => b.score - a.score);
  }

  /**
   * Fetch complete lap history for a specific kart number
   */
  getLapsForKart(kartNumber) {
    return this.localLapBuffer.filter(l => l.kart_number === kartNumber);
  }

  /**
   * Export stored session laps as downloadable JSON artifact
   */
  exportSessionJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.localLapBuffer, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kart_laps_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Clear local lap telemetry cache
   */
  clearCache() {
    this.localLapBuffer = [];
    localStorage.removeItem('apex_kart_laps_buffer');
  }
}

export const supabaseSink = new SupabaseDataSink();
