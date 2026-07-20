import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { KartAnalyticsPrep } from './components/KartAnalyticsPrep.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { apexService } from './services/apexTimingAdapter.js';
import { supabaseSink } from './services/supabaseDataSink.js';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [sessionMeta, setSessionMeta] = useState({});
  const [isSimulator, setIsSimulator] = useState(false);
  const [wsUrl, setWsUrl] = useState('');
  
  // Remember chosen Kart Number in LocalStorage
  const [myKartNumber, setMyKartNumber] = useState(() => {
    return localStorage.getItem('apex_my_kart_number') || '14';
  });

  const handleSelectKart = (kartNo) => {
    setMyKartNumber(kartNo);
    if (kartNo) {
      localStorage.setItem('apex_my_kart_number', kartNo);
    } else {
      localStorage.removeItem('apex_my_kart_number');
    }
  };

  // Start Apex Timing Service & Pipeline on mount
  useEffect(() => {
    // 1. Subscribe telemetry feed to React state
    const unsubscribeTelemetry = apexService.subscribe(({ drivers, sessionMeta }) => {
      setDrivers([...drivers]);
      setSessionMeta({ ...sessionMeta });
    });

    // 2. Wire every completed lap directly to Supabase Phase 2 Data Sink
    const unsubscribeLapSink = apexService.onLapCompleted((lapRecord) => {
      supabaseSink.saveLap(lapRecord);
    });

  // 3. Start telemetry adapter (Strict Real Data Mode)
  useEffect(() => {
    apexService.start({ useSimulator: false, wsUrl });
  }, [wsUrl]);

  const handleToggleSimulator = (val) => {
    setIsSimulator(val);
    apexService.start({ useSimulator: val, wsUrl });
  };

  const handleSetFlag = (flagCode) => {
    apexService.setFlag(flagCode);
  };

  return (
    <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden select-none">
      {/* Header Bar */}
      <Header
        sessionMeta={sessionMeta}
        isSimulator={isSimulator}
        totalKarts={drivers.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Dynamic Screen: Kart Performance Classifier (Single Main View) */}
      <main className="flex-1 flex flex-col min-h-0 bg-black overflow-hidden relative">
        <KartAnalyticsPrep />
      </main>

      {/* Settings & Config Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isSimulator={isSimulator}
        onToggleSimulator={handleToggleSimulator}
        myKartNumber={myKartNumber}
        onSelectKart={handleSelectKart}
        drivers={drivers}
        wsUrl={wsUrl}
        onSaveWsUrl={setWsUrl}
        sessionMeta={sessionMeta}
        onSetFlag={handleSetFlag}
      />
    </div>
  );
}
