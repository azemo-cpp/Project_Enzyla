import { useState, useEffect } from 'react';
import { useMET } from '../hooks/useMET';

export default function Navbar() {
  const [isZoomed, setIsZoomed] = useState(false);
  const { utc } = useMET();

  useEffect(() => {
    const onIn  = () => setIsZoomed(true);
    const onOut = () => setIsZoomed(false);
    window.addEventListener('moonclick', onIn);
    window.addEventListener('moonexit',  onOut);
    return () => {
      window.removeEventListener('moonclick', onIn);
      window.removeEventListener('moonexit',  onOut);
    };
  }, []);

  function handleBack() {
    // Call the exposed zoomOut function directly
    if ((window as any).zoomOut) {
      (window as any).zoomOut();
    } else {
      // fallback: synthetic dblclick
      window.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    }
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 56,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 20,
      pointerEvents: 'none', // nav bg doesn't block clicks
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>

      {/* Left: back arrow — only when zoomed */}
      <div style={{ width: 120, display: 'flex', alignItems: 'center' }}>
        {isZoomed && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Zoom out to full Moon view"
            style={{
              pointerEvents: 'auto',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 32,
              color: '#fff',
              cursor: 'pointer',
              padding: '8px 18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.15s, border-color 0.15s',
              touchAction: 'manipulation',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.4)';
            }}
          >
            <span aria-hidden style={{ fontSize: 14 }}>←</span>
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Center: ENZYLA wordmark */}
      <div style={{
        fontSize: 13, fontWeight: 700,
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        color: '#fff',
      }}>
        ENZYLA
      </div>

      {/* Right: live + UTC */}
      <div style={{
        width: 120, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', gap: 8,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          animation: 'pulse 2s ease-in-out infinite',
          flexShrink: 0,
        }} aria-hidden />
        <span style={{
          fontSize: 9, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {utc} UTC
        </span>
      </div>

    </nav>
  );
}
