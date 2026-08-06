"use client";

import { ArrowRight, Gauge, Sparkles } from "lucide-react";
import type { Personality } from "@/lib/types";
import { Chip, Section } from "./ui";

export default function ArchetypeCard({ personality }: { personality: Personality }) {
  const { archetype, secondary, traits, powerLevel } = personality;

  return (
    <Section
      emoji="🔮"
      title="Your coding archetype"
      subtitle="Derived from actual repo activity. Mostly science, a little wizardry."
      right={
        <span className="flex items-center gap-1.5 rounded-full border border-aura-400/30 bg-aura-500/10 px-3 py-1 text-xs font-bold text-aura-300">
          <Gauge className="h-3.5 w-3.5" /> LVL {powerLevel.level} · {powerLevel.title}
        </span>
      }
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${archetype.gradient} p-5`}>
        <div className="pointer-events-none absolute -right-8 -top-8 text-[120px] opacity-15" aria-hidden>
          {archetype.emoji}
        </div>
        <p className="text-4xl" aria-hidden>
          {archetype.emoji}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold text-white">{archetype.title}</h3>
        <p className="text-sm font-medium text-white/60">“{archetype.tagline}”</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">{archetype.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {archetype.traits.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="flex items-center gap-1.5 text-white/50">
          <Sparkles className="h-3.5 w-3.5 text-aura-300" /> Signature traits
        </span>
        {traits.map((t) => (
          <Chip key={t} className="border-white/15 bg-white/[0.07]">
            {t}
          </Chip>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 border-t border-white/8 pt-4 text-xs text-white/40">
        Also channeling: <span className="font-medium text-white/70">{secondary.emoji} {secondary.title}</span>
        <ArrowRight className="hidden" />
      </p>
    </Section>
  );
}
