"use client";

/**
 * Renders POAP artwork inside a perforated postage-stamp circle.
 * The artwork is an <img> with a data URI — user SVGs can't run scripts there.
 *
 * `sealed` makes a soulbound POAP look PHYSICALLY locked: a crimson wax seal
 * pressed over a corner plus a small keyhole & lock glyph, and a subtle
 * vignette so it reads as "this one belongs to you forever".
 * `loose` (default) reads as a transferable ticket stub.
 */
export function PoapStamp({
  image,
  alt,
  size = "md",
  stamped = false,
  sealed = false,
  className = "",
}: {
  image?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  /** show the red "MINTED" overprint */
  stamped?: boolean;
  /** render as a soulbound (wax-sealed + locked) stamp */
  sealed?: boolean;
  className?: string;
}) {
  const px = { sm: 120, md: 200, lg: 300 }[size];
  const holes = 28;
  const R = 50;
  const holeR = 3.2;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: px, height: px }}
    >
      {/* perforated backing */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="stamp-mask">
            <circle cx="50" cy="50" r={R} fill="white" />
            {Array.from({ length: holes }).map((_, i) => {
              const a = (i / holes) * Math.PI * 2;
              // Round to avoid server-vs-client float drift → React hydration error
              const cx = Math.round((50 + Math.cos(a) * R) * 1000) / 1000;
              const cy = Math.round((50 + Math.sin(a) * R) * 1000) / 1000;
              return (
                <circle key={i} cx={cx} cy={cy} r={holeR} fill="black" />
              );
            })}
          </mask>
          <clipPath id="stamp-art-clip">
            <circle cx="50" cy="50" r="42" />
          </clipPath>
        </defs>
        <g mask="url(#stamp-mask)">
          <circle cx="50" cy="50" r={R} fill="#efe6d2" />
          <circle
            cx="50"
            cy="50"
            r="44.5"
            fill="none"
            stroke="#b9a87f"
            strokeWidth="0.7"
            strokeDasharray="1.5 1.5"
          />
        </g>
      </svg>

      {/* artwork */}
      <div
        className="absolute overflow-hidden rounded-full bg-white"
        style={{ inset: `${px * 0.08}px` }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={alt}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-parchment font-display text-4xl text-line">
            ?
          </div>
        )}
        {sealed && (
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,transparent_52%,rgba(34,28,20,0.14)_100%)]" />
        )}
      </div>

      {stamped && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className="animate-stampIn rounded border-[3px] border-accent/80 px-2 py-0.5 font-display text-sm font-black uppercase tracking-widest text-accent/80"
            style={{ transform: "rotate(-8deg)" }}
          >
            Minted
          </span>
        </div>
      )}

      {/* soulbound lock badge (top-left) */}
      {sealed && (
        <div
          className="pointer-events-none absolute left-0 top-0 flex items-center justify-center rounded-full border border-stamp/40 bg-surf/95 shadow-md"
          style={{ width: px * 0.26, height: px * 0.26 }}
        >
          <svg
            viewBox="0 0 24 24"
            width={px * 0.14}
            height={px * 0.14}
            fill="none"
            stroke="#345e94"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="11" width="16" height="9" rx="2.4" />
            <path d="M8 11V8a4 4 0 1 1 8 0v3" />
          </svg>
        </div>
      )}

      {/* wax seal (bottom-right) */}
      {sealed && (
        <div
          className="pointer-events-none absolute bottom-0 right-0"
          style={{ width: px * 0.34, height: px * 0.34 }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow">
            <path
              d="M50 6c7 0 9 4 14 5s8-2 12 1 3 7 6 11 8 4 9 9-1 8 1 13 6 6 4 12-5 7-6 12 2 8-2 11-8 1-12 4-4 8-9 9-8-1-13 1-6 6-12 5-7-4-12-5-8 2-11-2-1-8-4-12-8-3-9-9 1-8-1-13-6-6-4-12 5-6 6-11-2-8 2-11 8-1 12-4 3-9 9-10 7 2 12 0 5-5 11-4 7 3 12 2 4-8 9-9 8 1 13-1 6-6 12-5 7 4 12 5"
              transform="scale(0.7)"
              fill="#a51f16"
              fillOpacity="0"
            />
            <path
              d="M12 55c3-16 20-27 38-27s35 11 38 27c-3 16-20 27-38 27S15 71 12 55Z"
              fill="#b3251b"
            />
            <path
              d="M12 55c3-16 20-27 38-27s35 11 38 27c-3 16-20 27-38 27S15 71 12 55Z"
              fill="url(#waxsheen)"
            />
            <defs>
              <radialGradient id="waxsheen" cx="0.35" cy="0.32" r="0.7">
                <stop offset="0" stopColor="#d1473a" />
                <stop offset="0.6" stopColor="#a32618" />
                <stop offset="1" stopColor="#6f140c" />
              </radialGradient>
            </defs>
            {/* embossed keyhole */}
            <circle cx="50" cy="47" r="9" fill="#7a1a10" fillOpacity="0.45" />
            <circle cx="50" cy="47" r="6.5" fill="#5c120a" fillOpacity="0.55" />
            <path d="M47 47l1.6 10h2.8L53 47Z" fill="#5c120a" fillOpacity="0.55" />
            <circle cx="50" cy="47" r="2.4" fill="#f8f3e8" fillOpacity="0.7" />
            <path
              d="M30 66c4 7 14 10 20 10s16-3 20-10"
              stroke="#d1473a"
              strokeWidth="1.4"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
