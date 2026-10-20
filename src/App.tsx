import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HUD from './components/HUD';
import MoonExplorer from './components/MoonExplorer';
import SiteTimeline from './components/SiteTimeline';

interface MoonClickDetail { name: string; lat: number; lon: number; type: string; }

export default function App() {
  const [activeSite, setActiveSite] = useState('Apollo 11');

  // Sync activeSite with whatever the user zoomed into
  useEffect(() => {
    function onZoomIn(e: Event) {
      const d = (e as CustomEvent<MoonClickDetail>).detail;
      if (d?.name && d.name !== 'Lunar Surface') setActiveSite(d.name);
    }
    window.addEventListener('moonclick', onZoomIn);
    return () => window.removeEventListener('moonclick', onZoomIn);
  }, []);

  function handleTimelineSelect(name: string, lat: number, lon: number) {
    setActiveSite(name);
    (window as any).zoomToSite?.(lat, lon, name);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      <Navbar />
      <HUD />
      <MoonExplorer />
      <SiteTimeline activeSite={activeSite} onSelect={handleTimelineSelect} />
    </div>
  );
}
