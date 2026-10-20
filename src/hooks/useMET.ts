import { useState, useEffect } from 'react';

function pad(n: number, w: number) { return String(n).padStart(w, '0'); }

export function useMET() {
  const [met, setMet] = useState('000:00:00:00');
  const [utc, setUtc] = useState('00:00:00');
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const now = new Date();
      setUtc(pad(now.getUTCHours(), 2) + ':' + pad(now.getUTCMinutes(), 2) + ':' + pad(now.getUTCSeconds(), 2));
      const e = Math.floor((Date.now() - start) / 1000);
      setMet(
        pad(Math.floor(e / 86400), 3) + ':' +
        pad(Math.floor((e % 86400) / 3600), 2) + ':' +
        pad(Math.floor((e % 3600) / 60), 2) + ':' +
        pad(e % 60, 2)
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return { met, utc };
}
