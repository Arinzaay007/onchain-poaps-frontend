"use client";

/**
 * Renders POAP artwork inside a perforated postage-stamp circle.
 * The artwork is an <img> with a data URI — user SVGs can't run scripts there.
 */
export function PoapStamp({
  image,
  alt,
  size = "md",
  stamped = false,
  className = "",
}: {
  image?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  /** show the red "MINTED" overprint */
  stamped?: boolean;
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
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="stamp-mask">
            <circle cx="50" cy="50" r={R} fill="white" />
            {Array.from({ length: holes }).map((_, i) => {
              const a = (i / holes) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={50 + Math.cos(a) * R}
                  cy={50 + Math.sin(a) * R}
                  r={holeR}
                  fill="black"
                />
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

      <div
        className="absolute overflow-hidden rounded-full bg-white"
        style={{
          inset: `${px * 0.08}px`,
        }}
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
    </div>
  );
}
