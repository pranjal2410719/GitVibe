"use client";

import { Flower2, Tornado, Zap } from "lucide-react";
import type { Score } from "@/lib/types";
import { Reveal } from "./ui";

function RadialGauge({
  value,
  color,
  glow,
  icon,
  label,
  tier,
}: {
  value: number;
  color: string;
  glow: string;
  icon: React.ReactNode;
  label: string;
  tier: string;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="animate-[pop_0.8s_cubic-bezier(0.34,1.56,0.64,1)_both]"
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-white">{value}</span>
          <span className="text-[10px] uppercase tracking-wider text-white/40">/ 100</span>
        </div>
        <span className="absolute -right-0.5 -top-0.5 text-2xl">{icon}</span>
      </div>
      <p className="mt-3 font-display text-lg font-bold text-white">{label}</p>
      <p
        className="rounded-full px-3 py-0.5 text-xs font-bold tracking-wide"
        style={{ color, backgroundColor: `${color}1f` }}
      >
        {tier}
      </p>
    </div>
  );
}

export default function ScoreCards({ scores }: { scores: { aura: Score; chaos: Score; energy: Score } }) {
  const gauges = [
    { key: "aura" as const, color: "#a78bfa", glow: "rgb(139 92 246 / 0.8)", icon: <Flower2 className="h-4 w-4 text-aura-300" /> },
    { key: "chaos" as const, color: "#fb7185", glow: "rgb(244 63 94 / 0.8)", icon: <Tornado className="h-4 w-4 text-chaos-300" /> },
    { key: "energy" as const, color: "#22d3ee", glow: "rgb(6 182 212 / 0.8)", icon: <Zap className="h-4 w-4 text-energy-300" /> },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {gauges.map((g, i) => (
        <Reveal key={g.key} delay={i * 80}>
          <div className="card flex h-full flex-col items-center justify-center px-4 py-6">
            <RadialGauge
              value={scores[g.key].value}
              color={g.color}
              glow={g.glow}
              icon={g.icon}
              label={scores[g.key].label}
              tier={scores[g.key].tier}
            />
            <p className="mt-3 max-w-[240px] text-center text-xs leading-relaxed text-white/45">
              {scores[g.key].description}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
