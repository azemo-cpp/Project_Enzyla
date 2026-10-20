import {
  Sun, Globe, Radio, Moon, Thermometer,
  MapPin, Clock, Compass,
} from 'lucide-react';
import { APOLLO_SITES } from '../data/apolloSites';

const MISSION_DATA: Record<string, {
  sunElevation: string;
  earthVisible: string;
  sunEarthTogether: string;
  longestDark: string;
  longestCommOutage: string;
  meanSunElev: string;
  lunarDayPhase: string;
  surfaceTemp: string;
}> = {
  'Apollo 11': { sunElevation:'6–12°', earthVisible:'Yes (near side)', sunEarthTogether:'Yes', longestDark:'354 hrs', longestCommOutage:'48 min/orbit', meanSunElev:'9.0°', lunarDayPhase:'Early morning', surfaceTemp:'−20 to +120 °C' },
  'Apollo 12': { sunElevation:'5–11°', earthVisible:'Yes (near side)', sunEarthTogether:'Yes', longestDark:'354 hrs', longestCommOutage:'47 min/orbit', meanSunElev:'8.1°', lunarDayPhase:'Early morning', surfaceTemp:'−30 to +110 °C' },
  'Apollo 14': { sunElevation:'13–19°', earthVisible:'Yes (near side)', sunEarthTogether:'Yes', longestDark:'354 hrs', longestCommOutage:'49 min/orbit', meanSunElev:'15.0°', lunarDayPhase:'Lunar morning', surfaceTemp:'−20 to +130 °C' },
  'Apollo 15': { sunElevation:'21–27°', earthVisible:'Yes (near side)', sunEarthTogether:'Yes', longestDark:'354 hrs', longestCommOutage:'46 min/orbit', meanSunElev:'24.0°', lunarDayPhase:'Near local noon', surfaceTemp:'+10 to +150 °C' },
  'Apollo 16': { sunElevation:'7–14°', earthVisible:'Yes (near side)', sunEarthTogether:'Yes', longestDark:'354 hrs', longestCommOutage:'45 min/orbit', meanSunElev:'10.5°', lunarDayPhase:'Early morning', surfaceTemp:'−30 to +125 °C' },
  'Apollo 17': { sunElevation:'14–20°', earthVisible:'Yes (near side)', sunEarthTogether:'Yes', longestDark:'354 hrs', longestCommOutage:'50 min/orbit', meanSunElev:'16.5°', lunarDayPhase:'Lunar morning', surfaceTemp:'−20 to +135 °C' },
};

interface Props { activeSite: string; onSelect: (name: string, lat: number, lon: number) => void; }

const iconSize = 13;
const iconColor = 'rgba(255,255,255,0.5)';

export default function SiteTimeline({ activeSite, onSelect }: Props) {
  const d = MISSION_DATA[activeSite];

  const metrics = d ? [
    { Icon: Sun,         label: 'Sun above horizon',        value: d.sunElevation },
    { Icon: Globe,       label: 'Earth above horizon (DTE)', value: d.earthVisible },
    { Icon: Compass,     label: 'Sun & Earth together',      value: d.sunEarthTogether },
    { Icon: Moon,        label: 'Longest darkness',          value: d.longestDark },
    { Icon: Radio,       label: 'Longest comm outage',       value: d.longestCommOutage },
    { Icon: Sun,         label: 'Mean Sun elev. when lit',   value: d.meanSunElev },
    { Icon: Clock,       label: 'Lunar day phase',           value: d.lunarDayPhase },
    { Icon: Thermometer, label: 'Surface temperature',       value: d.surfaceTemp },
  ] : [];

  return (
    <>
      {/* ── Site conditions dashboard — top right ── */}
      {d && (
        <div style={{
          position: 'fixed', top: 64, right: 20,
          width: 270, zIndex: 20, pointerEvents: 'auto',
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <MapPin size={12} color="rgba(255,255,255,0.5)" />
            <div>
              <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
                Site Conditions
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', marginTop: 2 }}>
                {activeSite}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ padding: '10px 16px 12px' }}>
            {metrics.map(({ Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Icon size={iconSize} color={iconColor} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', flex: 1, letterSpacing: '0.04em' }}>
                  {label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ padding: '6px 16px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
            NASA Apollo Mission Planning Data
          </div>
        </div>
      )}

      {/* ── Bottom timeline strip ── */}
      <div className="timeline-strip" style={{ pointerEvents: 'auto' }}>
        {APOLLO_SITES.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <span className="timeline-sep" aria-hidden>|</span>}
            <button
              type="button"
              className={`timeline-item${s.name === activeSite ? ' active' : ''}`}
              onClick={() => onSelect(s.name, s.lat, s.lon)}
              aria-label={`Go to ${s.name}`}
            >
              {s.name}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
