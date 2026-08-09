"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { domToPng } from "modern-screenshot";
import { languageColor } from "@/lib/language-colors";
import { formatFullNumber } from "@/lib/format";
import type { ProfileResult } from "@/lib/types";
import { Reveal, Section } from "./ui";

const CARD_WIDTH = 1080;

export default function IdentityCard({ result }: { result: ProfileResult }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardScaleRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // On small screens the 1080px card is scaled down (transform, not layout)
  // to fit the container — so the design never reflows or cramples, and the
  // exported PNG still captures the full 1080px layout.
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(0);

  useEffect(() => {
    const wrap = cardScaleRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const update = () => {
      const available = wrap.clientWidth;
      setScale(Math.min(1, available / CARD_WIDTH));
      setScaledHeight(card.offsetHeight * Math.min(1, available / CARD_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const { raw, stats, personality } = result;
  const user = raw.user;
  if (!user) return null;

  const langs = stats.languages.slice(0, 4);
  const scoreColors: Record<string, string> = { Aura: "#a78bfa", Chaos: "#fb7185", Energy: "#22d3ee" };

  async function downloadCard() {
    const node = cardRef.current;
    if (!node || exporting) return;
    setExporting(true);
    setError(null);
    const prevTransform = node.style.transform;
    const prevOrigin = node.style.transformOrigin;
    try {
      await document.fonts.ready;
      // Drop the on-page scale so the capture is the un-transformed 1080px
      // design — identical on every device.
      node.style.transform = "none";
      node.style.transformOrigin = "top left";
      const dataUrl = await domToPng(node, {
        scale: 3,
        fetch: { requestInit: { mode: "cors" } },
      });
      const link = document.createElement("a");
      link.download = `gitvibes-${result.username}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Card export failed", e);
      setError("Export failed. Try again, or use a different browser.");
    } finally {
      node.style.transform = prevTransform;
      node.style.transformOrigin = prevOrigin;
      setExporting(false);
    }
  }

  return (
    <Reveal>
      <Section
        emoji="🪪"
        title="Developer identity card"
        subtitle="A shareable snapshot of this profile's vibe. Download it as a crisp PNG."
        right={
          <button
            onClick={downloadCard}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-energy-600 to-aura-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-aura-600/30 transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Rendering…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Download PNG
              </>
            )}
          </button>
        }
      >
        {error ? (
          <p className="mb-3 rounded-lg border border-chaos-400/30 bg-chaos-500/10 px-3 py-2 text-sm text-chaos-300">
            {error}
          </p>
        ) : null}

        {/* The card — always laid out at its fixed 1080px design width so the
            design never reflows or cramples. On small screens it is scaled
            down with a transform to fit, and the exported PNG is captured at
            the full 1080px (transform removed during export). */}
        <div ref={cardScaleRef} className="w-full">
          <div className="relative w-full" style={{ height: scaledHeight || undefined }}>
            <div
              ref={cardRef}
              data-card-root
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CARD_WIDTH,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                backgroundColor: "#0b0d15",
                fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
              }}
              className="overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-2xl"
            >
              {/* backgrounds */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(90% 70% at 0% 0%, rgb(139 92 246 / 0.5) 0%, transparent 60%), radial-gradient(70% 60% at 100% 0%, rgb(244 63 94 / 0.32) 0%, transparent 55%), radial-gradient(80% 70% at 50% 110%, rgb(6 182 212 / 0.28) 0%, transparent 60%)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgb(255 255 255 / 1) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 1) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="relative p-10" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                {/* header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external avatar URL, avoids next/image remote config */}
                    <img
                      src={user.avatar_url}
                      alt=""
                      crossOrigin="anonymous"
                      width={104}
                      height={104}
                      className="h-[104px] w-[104px] rounded-full object-cover ring-2 ring-white/20"
                      style={{ border: "3px solid rgb(255 255 255 / 0.15)" }}
                    />
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
                        Developer Identity Card
                      </p>
                      <h3
                        className="mt-1 text-4xl font-bold tracking-tight text-white"
                        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                      >
                        {user.name ?? user.login}
                      </h3>
                      <p className="mt-0.5 text-lg text-white/55">@{user.login}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" style={{ color: "#a78bfa" }} />
                      <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                        GitVibes
                      </span>
                    </div>
                    {Object.entries(personality.scores).map(([key, score]) => (
                      <span
                        key={key}
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{
                          color: scoreColors[score.label] ?? "#fff",
                          backgroundColor: `${scoreColors[score.label] ?? "#fff"}1f`,
                        }}
                      >
                        {score.label} {score.value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* tagline */}
                <div className="mt-7 rounded-2xl px-5 py-4" style={{ backgroundColor: "rgb(255 255 255 / 0.05)" }}>
                  <p className="text-lg text-white/85">
                    {personality.archetype.emoji} <span className="font-semibold text-white">{personality.archetype.title}</span>
                    <span className="text-white/40"> — “{personality.archetype.tagline}”</span>
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    Power level {personality.powerLevel.level}/100 · {personality.powerLevel.title}
                  </p>
                </div>

                {/* stats */}
                <div
                  className="mt-6 grid grid-cols-5 gap-3"
                  style={{ borderTop: "1px solid rgb(255 255 255 / 0.08)", paddingTop: 20 }}
                >
                  {[
                    { label: "Stars", value: formatFullNumber(stats.stars), color: "#fbbf24" },
                    { label: "Followers", value: formatFullNumber(stats.followers), color: "#e4e4e7" },
                    { label: "Repos", value: formatFullNumber(stats.repoCount), color: "#e4e4e7" },
                    { label: "Contribs", value: formatFullNumber(stats.contributions?.total ?? 0), color: "#4ade80" },
                    { label: "Best streak", value: `${stats.contributions?.longestStreak ?? 0}d`, color: "#e4e4e7" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-space-grotesk), sans-serif" }}>
                        {s.value}
                      </p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* languages + traits */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  {langs.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-3">
                      {langs.map((l) => (
                        <span key={l.name} className="flex items-center gap-2 text-sm text-white/70">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: languageColor(l.name) }} />
                          {l.name}
                          <span className="text-white/35">{Math.round(l.share * 100)}%</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-white/40">Languages: yet to be discovered</span>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {personality.traits.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full px-3 py-1 text-xs font-medium text-white/70"
                        style={{ backgroundColor: "rgb(255 255 255 / 0.07)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* footer */}
                <div className="mt-7 flex items-center justify-between border-t border-white/8 pt-4" style={{ borderTop: "1px solid rgb(255 255 255 / 0.08)" }}>
                  <p className="text-xs text-white/35">
                    Generated by GitVibes · {new Date(result.meta.fetchedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-xs text-white/35">Vibe analysis: 100% real · 0% official</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Reveal>
  );
}
