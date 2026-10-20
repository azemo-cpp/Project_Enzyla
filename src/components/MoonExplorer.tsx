import { useState, useEffect, useRef } from 'react';
import { APOLLO_SITES } from '../data/apolloSites';

interface MoonClickDetail { name: string; lat: number; lon: number; type: string; }

// Real NASA documentation text per Apollo site — sourced from NASA History Division
const SITE_DOCS: Record<string, {
  summary: string;
  coordinates: string;
  significance: string;
  geology: string;
  activities: { title: string; desc: string }[];
}> = {
  'Apollo 11': {
    summary: 'First crewed lunar landing. The Eagle lunar module touched down on July 20, 1969 at 20:17 UTC. Neil Armstrong and Buzz Aldrin spent 2 hours 31 minutes on the surface.',
    coordinates: '0.6741° N, 23.4723° E · Mare Tranquillitatis',
    significance: 'First human footsteps on another world. The site demonstrated that the lunar surface could support a spacecraft and crew.',
    geology: 'Relatively flat mare basalt plain with a thin regolith layer. Low crater density. Basalt samples dated at 3.7 billion years.',
    activities: [
      { title: 'Solar Wind Composition', desc: 'Aluminum foil sheet deployed to capture solar wind particles for isotopic analysis back on Earth.' },
      { title: 'Passive Seismometer', desc: 'First seismic instrument on the Moon — recorded moonquakes and meteorite impacts until 1971.' },
      { title: 'Laser Ranging', desc: 'Retroreflector array still used today to measure the Moon\'s distance to millimeter precision.' },
      { title: 'Sample Collection', desc: '21.5 kg of basalt and regolith returned — including Sample 10003, the first documented lunar rock.' },
    ],
  },
  'Apollo 12': {
    summary: 'Second crewed lunar landing and first precision landing. Pete Conrad and Alan Bean landed November 19, 1969, within 163 m of the unmanned Surveyor 3 probe.',
    coordinates: '3.0128° S, 23.4219° W · Oceanus Procellarum',
    significance: 'Demonstrated pinpoint landing capability. Retrieval of Surveyor 3 hardware revealed effects of 31 months of lunar exposure.',
    geology: 'Younger mare basalt than Apollo 11 — samples dated 3.15–3.2 Ga. Higher titanium content than expected.',
    activities: [
      { title: 'Surveyor 3 Retrieval', desc: 'Camera and soil sampler retrieved from the Surveyor 3 probe — 31 months of lunar exposure studied.' },
      { title: 'ALSEP Package', desc: 'Apollo Lunar Surface Experiments Package — 5 instruments returned data for 8 years after landing.' },
      { title: 'Dual EVAs', desc: 'Two surface traversals covering the Snowman crater region and the ALSEP deployment site.' },
      { title: 'Core Sampling', desc: 'First deep core samples — 4 cores to 60 cm depth revealing stratigraphy of the regolith.' },
    ],
  },
  'Apollo 14': {
    summary: 'Third crewed lunar landing at Fra Mauro highlands — ejecta blanket from the Imbrium basin impact. Alan Shepard and Edgar Mitchell landed February 5, 1971.',
    coordinates: '3.6453° S, 17.4714° W · Fra Mauro Formation',
    significance: 'First landing in the lunar highlands. Fra Mauro breccias are fragments of the giant Imbrium impact — among the oldest sampled lunar material.',
    geology: 'Fra Mauro Formation: impact melt breccia from the Imbrium basin. Some samples date to 3.9 Ga — near the Late Heavy Bombardment period.',
    activities: [
      { title: 'Cone Crater Traverse', desc: 'Crew reached the rim of 340 m Cone Crater, sampling Imbrium ejecta excavated from depth.' },
      { title: 'Active Seismic', desc: 'Explosive charges detonated to profile the lunar subsurface structure — revealed 8.5 m regolith layer.' },
      { title: 'Golf Shot', desc: 'Alan Shepard hit two golf balls with a makeshift 6-iron. Estimated distance: several hundred meters.' },
      { title: 'Sample 14321', desc: '"Big Bertha" — a 9 kg breccia containing Earth-origin material, the oldest lunar sample at ~4.0 Ga.' },
    ],
  },
  'Apollo 15': {
    summary: 'First J-class long-duration mission. David Scott and James Irwin landed at Hadley-Apennine July 30, 1971. First use of the Lunar Roving Vehicle.',
    coordinates: '26.1322° N, 3.6339° E · Hadley–Apennine',
    significance: 'Most scientifically productive landing to that date. The Genesis Rock — pristine anorthosite from the original lunar crust — changed understanding of lunar formation.',
    geology: 'Valley floor of mare basalt adjacent to 3.5 km tall Apennine mountains and the 1.5 km wide Hadley Rille sinuous lava channel.',
    activities: [
      { title: 'Genesis Rock', desc: 'Sample 15415: pure anorthosite, 4.1 billion years old — a piece of the original lunar crust from the magma ocean era.' },
      { title: 'Hadley Rille', desc: 'Ancient sinuous lava channel 1.5 km wide and 300 m deep — explored by rover to the rim, revealing layered basalt walls.' },
      { title: 'Deep Drill Core', desc: '2.4 m core revealed 57 distinct layers of regolith — a record of impacts spanning 500 million years.' },
      { title: 'Rover Traverse', desc: 'LRV covered 27.9 km across three EVAs — enabling exploration far beyond walking range.' },
    ],
  },
  'Apollo 16': {
    summary: 'Only mission to sample ancient highland crust. John Young and Charles Duke landed April 21, 1972 in the Descartes Highlands — the highest-altitude Apollo landing.',
    coordinates: '8.9730° S, 15.4986° E · Descartes Highlands',
    significance: 'Disproved the pre-mission theory that the highlands were volcanic. The terrain proved to be ancient impact breccia, not lava flows.',
    geology: 'Ancient anorthosite highland crust, heavily cratered. Cayley Plains and Descartes Formation are both impact-generated, not volcanic as predicted.',
    activities: [
      { title: 'House Rock', desc: 'Largest boulder sampled in Apollo program — a 4×7 m breccia block at Station 11, containing 7 rock types.' },
      { title: 'North Ray Crater', desc: 'Youngest crater visited in Apollo program — ~50 million years old. Crew sampled pristine highland material from its walls.' },
      { title: 'ALSEP Magnetometer', desc: 'Measured a strong local magnetic anomaly — evidence of ancient lunar magnetic field captured in crust.' },
      { title: 'Rover Distance Record', desc: '26.7 km total traverse — the longest Apollo rover distance record at the time.' },
    ],
  },
  'Apollo 17': {
    summary: 'Final crewed Moon landing and only mission with a professional geologist. Gene Cernan and Harrison Schmitt landed December 11, 1972 in Taurus-Littrow valley.',
    coordinates: '20.1908° N, 30.7717° E · Taurus-Littrow Valley',
    significance: 'Returned the most diverse and most mass of any Apollo mission. Discovery of orange volcanic glass proved a recent pyroclastic event at 3.7 Ga.',
    geology: 'Valley floor of mare basalt flanked by massifs of ancient highland material. Orange volcanic glass at Shorty Crater is the only confirmed pyroclastic deposit in Apollo samples.',
    activities: [
      { title: 'Orange Soil Discovery', desc: 'Harrison Schmitt spotted orange glass beads at Shorty Crater — volcanic fire-fountain glass from 3.7 Ga pyroclastic eruption.' },
      { title: 'South Massif', desc: 'Crew sampled the massif flank — ancient highland anorthosite older than 4 Ga, contrasting with the young valley basalt.' },
      { title: 'TAN Gravimeter', desc: 'Traverse Gravimeter measured subsurface density variations — revealed structure of lava flows beneath the valley.' },
      { title: 'Final Footsteps', desc: 'Cernan\'s last words: "We leave as we came, and God willing, as we shall return, with peace and hope for all mankind."' },
    ],
  },
};

export default function MoonExplorer() {
  const [visible, setVisible]     = useState(false);
  const [siteName, setSiteName]   = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedAct, setAct]     = useState<number | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onIn(e: Event) {
      const d = (e as CustomEvent<MoonClickDetail>).detail;
      const name = d?.name ?? '';
      setSiteName(name);
      setVisible(true);
      setShowPanel(true);
      setAct(null);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    }
    function onOut() {
      setVisible(false);
      setShowPanel(false);
      setAct(null);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    }
    window.addEventListener('moonclick', onIn);
    window.addEventListener('moonexit',  onOut);
    return () => {
      window.removeEventListener('moonclick', onIn);
      window.removeEventListener('moonexit',  onOut);
    };
  }, []);

  const doc = SITE_DOCS[siteName];
  const apolloSite = APOLLO_SITES.find(s => s.name === siteName);

  return (
    <>
      {/* ── Site name — centered bottom, above timeline ── */}
      <div style={{
        position: 'fixed', bottom: 72, left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s, transform 0.5s',
        pointerEvents: 'none', zIndex: 11,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          {doc ? 'Apollo Landing Site' : 'Lunar Surface'}
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1, color: '#fff' }}>
          {siteName || 'Lunar Surface'}
        </div>
        {apolloSite && (
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
            {doc?.coordinates}
          </div>
        )}
      </div>

      {/* ── Left info panel ── */}
      {showPanel && doc && (
        <div style={{
          position: 'fixed', left: 24, top: '50%',
          transform: 'translateY(-50%)',
          width: 300, zIndex: 20, pointerEvents: 'auto',
          animation: 'fadeSlideIn 0.4s ease',
        }}>
          {/* Mission summary */}
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '16px 18px',
            marginBottom: 2,
          }}>
            <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
              Mission Summary
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              {doc.summary}
            </p>
          </div>

          {/* Geology */}
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: 'none',
            padding: '12px 18px',
            marginBottom: 2,
          }}>
            <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
              Geology
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              {doc.geology}
            </p>
          </div>

          {/* Activities — clickable rows */}
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: 'none',
          }}>
            <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '10px 18px 6px' }}>
              Key Activities
            </div>
            {doc.activities.map((a, i) => (
              <button
                key={a.title}
                type="button"
                onClick={() => setAct(selectedAct === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: selectedAct === i ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (selectedAct !== i) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (selectedAct !== i) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                aria-expanded={selectedAct === i}
                aria-label={a.title}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>
                    {a.title}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 8, transition: 'transform 0.15s', transform: selectedAct === i ? 'rotate(180deg)' : 'none' }}>
                    ↓
                  </span>
                </div>
                {selectedAct === i && (
                  <p style={{ fontSize: 11, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', margin: '8px 0 0', animation: 'fadeIn 0.2s ease' }}>
                    {a.desc}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Mission metrics */}
          {apolloSite && (
            <div style={{
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderTop: 'none',
              padding: '12px 18px',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px',
            }}>
              {[
                { l: 'Year',     v: apolloSite.year },
                { l: 'Samples',  v: apolloSite.samples },
                { l: 'EVA',      v: apolloSite.duration },
                { l: 'Elev.',    v: apolloSite.elevStr },
              ].map(m => (
                <div key={m.l}>
                  <div style={{ fontSize: 7, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 3 }}>{m.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{m.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Non-Apollo location — minimal overlay */}
      {showPanel && !doc && siteName && (
        <div style={{
          position: 'fixed', left: 24, top: '50%',
          transform: 'translateY(-50%)',
          width: 260, zIndex: 20, pointerEvents: 'auto',
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '16px 18px',
          animation: 'fadeSlideIn 0.4s ease',
        }}>
          <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
            Lunar Feature
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', color: '#fff', marginBottom: 10 }}>
            {siteName}
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            Click an Apollo landing site from the timeline below to view mission documentation and surface data.
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-12px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
