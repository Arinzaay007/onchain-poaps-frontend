"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen rubber-stamp slam played once when a mint succeeds.
 * Dim → stamp slams down with overshoot → paper shake → fades away.
 */
export function MintSlam({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(t);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center animate-slamFade"
      aria-hidden
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" />
      <div className="animate-shake">
        <svg viewBox="0 0 320 200" className="w-[300px] animate-slam sm:w-[420px]" style={{ overflow: "visible" }}>
          <defs>
            <filter id="rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" result="n" seed="7" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
            </filter>
          </defs>
          <g filter="url(#rough)" transform="rotate(-9 160 100)">
            <rect x="18" y="42" width="284" height="116" rx="10" fill="none" stroke="#c73e1d" strokeWidth="9" opacity="0.92" />
            <text
              x="160" y="112"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontWeight="900"
              fontSize="46"
              letterSpacing="6"
              fill="#c73e1d"
              opacity="0.92"
            >
              MINTED
            </text>
            <text
              x="160" y="140"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontWeight="700"
              fontSize="15"
              letterSpacing="7"
              fill="#c73e1d"
              opacity="0.8"
            >
              ✦ ONCHAIN · FOREVER ✦
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
