"use client";

import { Briefcase, CheckCircle2, ClipboardList } from "lucide-react";
import type { RecruiterReport } from "@/lib/types";
import { Reveal, Section } from "./ui";

export default function RecruiterSection({ report }: { report: RecruiterReport }) {
  const { notes, verdict, verdictNote, hireScore } = report;
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - hireScore / 100);

  return (
    <Reveal>
      <Section
        emoji="💼"
        title="Recruiter-style impressions"
        subtitle="How the hiring world might squint at this profile"
      >
        <div className="grid gap-5 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="10" />
                <circle
                  cx="64"
                  cy="64"
                  r={r}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                  style={{ filter: "drop-shadow(0 0 6px rgb(52 211 153 / 0.6))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold text-white">{hireScore}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/40">hire score</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-bold text-emerald-300">{verdict}</span>
            </div>
          </div>

          <div>
            <ul className="space-y-2.5">
              {notes.map((n, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70">
                  <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-sm italic leading-relaxed text-white/60">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-aura-300" />
              <span>
                <span className="font-semibold not-italic text-white/80">Recruiter verdict: {verdict}.</span>{" "}
                {verdictNote}
              </span>
            </p>
          </div>
        </div>
      </Section>
    </Reveal>
  );
}
