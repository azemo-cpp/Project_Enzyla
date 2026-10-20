import { useState, useEffect } from 'react';

export interface ISSData {
  lat: string; lon: string; alt: string; vel: string; loaded: boolean;
}

export function useISS(): ISSData {
  const [data, setData] = useState<ISSData>({ lat: '--', lon: '--', alt: '--', vel: '--', loaded: false });
  useEffect(() => {
    async function fetch_() {
      try {
        const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const d = await r.json();
        setData({
          lat: (d.latitude >= 0 ? '+' : '') + parseFloat(d.latitude).toFixed(4) + ' °',
          lon: (d.longitude >= 0 ? '+' : '') + parseFloat(d.longitude).toFixed(4) + ' °',
          alt: parseFloat(d.altitude).toFixed(1) + ' km',
          vel: (parseFloat(d.velocity) / 3600).toFixed(2) + ' km/s',
          loaded: true,
        });
      } catch {
        setData(p => ({ ...p, lat: 'NO SIGNAL', loaded: true }));
      }
    }
    fetch_();
    const id = setInterval(fetch_, 5000);
    return () => clearInterval(id);
  }, []);
  return data;
}
