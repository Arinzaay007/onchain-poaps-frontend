"use client";

import { useMemo, useState } from "react";
import {
  generateStampSvg,
  PALETTES,
  STUDIO_EMOJIS,
  type StampDesign,
} from "@/lib/stamp";
import { svgToDataUri } from "@/lib/svg";
import { PoapStamp } from "./PoapStamp";
import { formatBytes } from "@/lib/format";

export function StampStudio({
  eventName,
  onUse,
}: {
  eventName?: string;
  onUse: (svg: string) => void;
}) {
  const [design, setDesign] = useState<StampDesign>({
    shape: "scallop",
    bg: PALETTES[0].bg,
    ink: PALETTES[0].ink,
    center: "🎉",
    centerColor: PALETTES[0].centerColor,
    topText: eventName ?? "MY EVENT 2026",
    bottomText: "",
    showDashRing: true,
  });
  const [customCenter, setCustomCenter] = useState("");

  const svg = useMemo(() => generateStampSvg(design), [design]);
  const bytes = useMemo(() => new TextEncoder().encode(svg).length, [svg]);
  const uri = useMemo(() => svgToDataUri(svg), [svg]);

  const set = (patch: Partial<StampDesign>) =>
    setDesign((d) => ({ ...d, ...patch }));

  return (
    <div className="grid gap-5 md:grid-cols-[auto,1fr]">
      {/* preview */}
      <div className="flex flex-col items-center gap-2">
        <PoapStamp image={uri} alt="Stamp design" size="md" />
        <p className="font-mono text-[11px] text-faded">
          {formatBytes(bytes)} — tiny, gas-friendly SVG
        </p>
        <button className="btn-primary w-full" onClick={() => onUse(svg)}>
          Use this design →
        </button>
      </div>

      {/* controls */}
      <div className="space-y-4">
        <div>
          <label className="label">Shape</label>
          <div className="flex gap-2">
            {(
              [
                ["scallop", "Scalloped stamp"],
                ["ring", "Classic ring"],
                ["gear", "Gear badge"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                className={
                  design.shape === v
                    ? "btn-primary !py-1.5 text-xs"
                    : "btn-secondary !py-1.5 text-xs"
                }
                onClick={() => set({ shape: v })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Palette</label>
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                title={p.name}
                onClick={() =>
                  set({ bg: p.bg, ink: p.ink, centerColor: p.centerColor })
                }
                className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                  design.bg === p.bg ? "border-ink scale-110" : "border-line"
                }`}
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${p.ink} 0 40%, ${p.bg} 42%)`,
                }}
              />
            ))}
            <label className="flex items-center gap-1 text-xs text-faded">
              <input
                type="color"
                value={design.bg}
                onChange={(e) => set({ bg: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border border-line bg-transparent"
                title="Custom background"
              />
              <input
                type="color"
                value={design.ink}
                onChange={(e) =>
                  set({ ink: e.target.value, centerColor: e.target.value })
                }
                className="h-8 w-8 cursor-pointer rounded border border-line bg-transparent"
                title="Custom ink"
              />
              custom
            </label>
          </div>
        </div>

        <div>
          <label className="label">Center — emoji or initials</label>
          <div className="flex flex-wrap gap-1">
            {STUDIO_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => set({ center: e })}
                className={`h-9 w-9 rounded-lg text-xl transition-colors ${
                  design.center === e ? "bg-parchment ring-2 ring-accent" : "hover:bg-parchment"
                }`}
              >
                {e}
              </button>
            ))}
            <input
              className="input !w-28 !py-1.5 text-center text-sm"
              placeholder="or: GM"
              maxLength={4}
              value={customCenter}
              onChange={(e) => {
                setCustomCenter(e.target.value);
                if (e.target.value) set({ center: e.target.value });
              }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Text around the top ({design.topText.length}/30)</label>
            <input
              className="input"
              maxLength={30}
              value={design.topText}
              onChange={(e) => set({ topText: e.target.value })}
              placeholder="EVENT NAME 2026"
            />
          </div>
          <div>
            <label className="label">Line below center ({design.bottomText.length}/24)</label>
            <input
              className="input"
              maxLength={24}
              value={design.bottomText}
              onChange={(e) => set({ bottomText: e.target.value })}
              placeholder="Lagos · Aug 2026"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={design.showDashRing}
            onChange={(e) => set({ showDashRing: e.target.checked })}
          />
          Inner dashed ring
        </label>
      </div>
    </div>
  );
}
