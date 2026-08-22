"use client";

/**
 * Decorative wax seal for claim pages.
 * "sealed"  — intact red wax with embossed P
 * "broken"  — the seal split in two, revealing the claim beneath
 */
export function WaxSeal({
  state,
  size = 96,
  className = "",
}: {
  state: "sealed" | "broken";
  size?: number;
  className?: string;
}) {
  // irregular wax blob
  const blob =
    "M50 6c9-3 19 0 26 5 8 5 15 11 17 20 2 8-2 16 0 24 1 9 5 19-1 26-6 8-17 8-26 11-8 3-16 8-25 6-9-2-14-10-20-17-5-7-12-13-13-22-1-9 5-16 9-24 3-8 4-17 11-22 7-6 14-4 22-7z";

  const half = (
    <g>
      <path d={blob} fill="url(#waxg)" stroke="#7a1608" strokeWidth="1.4" />
      <path d={blob} fill="none" stroke="#e0684a" strokeWidth="1" opacity="0.5" transform="translate(-1.4 -1.6) scale(0.97)" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#7a1608" strokeWidth="1.6" opacity="0.65" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#e0684a" strokeWidth="1" opacity="0.4" transform="translate(-0.8 -0.8)" />
      <text x="50" y="63" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="900" fontSize="34" fill="#7a1608">P</text>
      <text x="49" y="62" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="900" fontSize="34" fill="#e0684a" opacity="0.55">P</text>
    </g>
  );

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-md" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="waxg" cx="38%" cy="34%">
            <stop offset="0%" stopColor="#d9532b" />
            <stop offset="55%" stopColor="#b02c12" />
            <stop offset="100%" stopColor="#8c1d0a" />
          </radialGradient>
          <clipPath id="sealL"><path d="M0 0h52l-8 100H0z" /></clipPath>
          <clipPath id="sealR"><path d="M52 0H100v100H44z" /></clipPath>
        </defs>

        {state === "sealed" ? (
          half
        ) : (
          <>
            <g clipPath="url(#sealL)" className="animate-sealL">{half}</g>
            <g clipPath="url(#sealR)" className="animate-sealR">{half}</g>
          </>
        )}
      </svg>
    </div>
  );
}
