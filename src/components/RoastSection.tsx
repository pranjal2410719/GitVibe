"use client";

import { Flame, Quote } from "lucide-react";
import { Reveal, Section } from "./ui";

export default function RoastSection({ roasts }: { roasts: string[] }) {
  return (
    <Reveal>
      <Section
        emoji="🔥"
        title="The roast"
        subtitle="100% certified, 0% accurate, fully objective"
        right={
          <span className="flex items-center gap-1 rounded-full border border-chaos-400/30 bg-chaos-500/10 px-3 py-1 text-xs font-bold text-chaos-300">
            <Flame className="h-3.5 w-3.5" /> mild to spicy
          </span>
        }
      >
        <div className="space-y-3">
          {roasts.map((r, i) => (
            <blockquote
              key={i}
              className="relative rounded-xl border border-white/8 bg-gradient-to-r from-chaos-500/[0.07] to-transparent p-4 pl-5 text-[15px] leading-relaxed text-white/75"
            >
              <Quote className="absolute -left-1 top-3 h-5 w-5 rotate-180 text-chaos-400/30" />
              “{r}”
            </blockquote>
          ))}
        </div>
        <p className="mt-4 text-right text-xs italic text-white/30">No developers were harmed in this roast.</p>
      </Section>
    </Reveal>
  );
}
