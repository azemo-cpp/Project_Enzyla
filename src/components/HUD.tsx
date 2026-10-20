import { useISS } from '../hooks/useISS';

// ISS telemetry, bottom-left only. Dim monospace, unobtrusive.
export default function HUD() {
  const iss = useISS();

  return (
    <div className="hud-mono" style={{ position: 'fixed', bottom: 72, left: 24, pointerEvents: 'none' }}>
      <div style={{ opacity: 0.6, fontSize: 8, letterSpacing: '0.2em', marginBottom: 4, textTransform: 'uppercase' }}>
        ISS · EXP-71
      </div>
      <div><span style={{ opacity: 0.5 }}>LAT </span>{iss.lat}</div>
      <div><span style={{ opacity: 0.5 }}>LON </span>{iss.lon}</div>
      <div><span style={{ opacity: 0.5 }}>ALT </span>{iss.alt}</div>
      <div><span style={{ opacity: 0.5 }}>SPD </span>{iss.vel}</div>
    </div>
  );
}
