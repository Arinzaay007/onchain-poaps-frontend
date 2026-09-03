"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useTotalEvents, usePoapEvent, usePoapMetadata, useTotalSupply } from "@/lib/hooks";
import { steward, parseEventId, type StewardReply } from "@/lib/steward";
import { PoapStamp } from "@/components/PoapStamp";

interface Msg {
  role: "user" | "steward";
  text: string;
  links?: { label: string; href: string }[];
}

const SUGGESTIONS = [
  "Who can mint right now?",
  "Plan a soulbound meetup POAP for 50 people",
  "Set up an allowlist",
  "Run a live-event QR kiosk",
  "How long do windows stay open?",
];

export function StewardAgent() {
  const { address } = useAccount();
  const { data: total } = useTotalEvents();
  // default focus = latest registered POAP
  const [focusId, setFocusId] = useState<bigint | null>(null);
  const resolved = focusId ?? (total !== undefined ? total : 0n);

  const { event: focus } = usePoapEvent(resolved);
  const { metadata } = usePoapMetadata(resolved);
  const { data: supply } = useTotalSupply(resolved);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // once the focus event is loaded (after a switch), flush the pending answer
  useEffect(() => {
    if (pending.current && focus) {
      const q = pending.current;
      pending.current = null;
      const reply = steward(q, {
        totalEvents: total,
        focus,
        metadata,
        supply,
        address,
      });
      setMessages((m) => [...m, { role: "steward", text: reply.text, links: reply.links }]);
    }
  }, [focus, total, metadata, supply, address]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ctx = useMemo(
    () => ({ totalEvents: total, focus, metadata, supply, address }),
    [total, focus, metadata, supply, address],
  );

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);

    // detect if they referenced a DIFFERENT POAP; switch focus and re-answer
    const id = parseEventId(text);
    if (id !== null && (focusId === null || id !== focusId) && total !== undefined && id <= total) {
      setFocusId(id);
      pending.current = text;
      setMessages((m) => [
        ...m,
        { role: "steward", text: `Checking POAP #${id} against the chain…` },
      ]);
      return;
    }

    const reply = steward(text, ctx);
    setMessages((m) => [...m, { role: "steward", text: reply.text, links: reply.links }]);
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line bg-[linear-gradient(135deg,#3a2c1c,#4a3823)] px-5 py-4 text-paper">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-paper/40 bg-accent/20 text-xl">
          🧭
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-tight">Steward</p>
          <p className="text-[11px] text-paper/60">
            Reads the live contract · no server · no AI bill
          </p>
        </div>
      </div>

      {/* chat */}
      <div className="flex max-h-[60vh] min-h-[300px] flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-faded">
              I'm a deterministic assistant that answers from real onchain state.
              Currently reading{" "}
              <b className="text-ink">{total === undefined ? "…" : `${(total + 1n).toString()} POAPs`}</b>
              {focus ? (
                <>
                  {" "}— focused on <b className="text-ink">{focus.name}</b> (#{focus.id.toString()})
                </>
              ) : null}
              .
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-semibold text-faded transition-colors hover:border-faded hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-accent text-paper"
                  : "rounded-bl-sm border border-line bg-parchment/60 text-ink"
              }`}
            >
              <RenderMarkdown text={m.text} />
              {m.links && m.links.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="rounded-lg"
                      onClick={() => setMessages((mm) => mm.filter((_, j) => j !== i))}
                    >
                      <span className="badge border border-accent/40 bg-accent/10 text-accent">
                        {l.label} ↗
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about minting, allowlists, deadlines…"
          className="input flex-1"
        />
        <button
          className="btn-primary shrink-0"
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
        >
          Send
        </button>
      </div>

      <div className="border-t border-line bg-parchment/40 px-4 py-2 text-center text-[11px] text-faded">
        Deterministic · answers are derived from live chain state + the contract ABI.
      </div>
    </div>
  );
}

/* tiny inline markdown for **bold** only *//* eslint-disable-next-line */
function RenderMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <b key={i} className="font-semibold">
            {p.slice(2, -2)}
          </b>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
