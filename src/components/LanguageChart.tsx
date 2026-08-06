"use client";

import { Wrench } from "lucide-react";
import { languageColor } from "@/lib/language-colors";
import type { ProfileStats } from "@/lib/types";
import { Chip, Section } from "./ui";

export default function LanguageChart({ stats }: { stats: ProfileStats }) {
  const top = stats.languages.slice(0, 6);
  const maxCount = top[0]?.count ?? 1;

  return (
    <Section
      emoji="🎨"
      title="Language & skills"
      subtitle={
        stats.languageEntropy > 2
          ? "Dangerously versatile — refuses to specialize."
          : "A focused stack. They know what they like."
      }
    >
      {top.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
          No detectable languages. The code speaks in whispers.
        </p>
      ) : (
        <div className="space-y-3">
          {top.map((l) => (
            <div key={l.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-white/85">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: languageColor(l.name) }} />
                  {l.name}
                </span>
                <span className="text-xs text-white/40">
                  {Math.round(l.share * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(l.count / maxCount) * 100}%`,
                    background: `linear-gradient(90deg, ${languageColor(l.name)}cc, ${languageColor(l.name)})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {stats.skills.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
            <Wrench className="h-3.5 w-3.5" /> Skill domains
          </span>
          {stats.skills.map((s) => (
            <Chip key={s} className="border-aura-400/20 bg-aura-500/10 text-aura-200">
              {s}
            </Chip>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
