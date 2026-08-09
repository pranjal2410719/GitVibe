"use client";

import { Link2 } from "lucide-react";
import { LinkedInIcon, WhatsAppIcon, XIcon } from "./icons";

export default function ShareButtons({
  username,
  onCopy,
}: {
  username: string;
  onCopy: () => void;
}) {
  const shareUrl = () => `${window.location.origin}/u/${encodeURIComponent(username)}`;
  const text = `I checked @${username}'s developer aura on GitVibe — the whole personality profile, roasted. `;

  const open = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const social = [
    {
      label: "Share on X",
      href: () =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl())}`,
      Icon: XIcon,
      hover: "hover:border-white/30 hover:text-white",
    },
    {
      label: "Share on LinkedIn",
      href: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl())}`,
      Icon: LinkedInIcon,
      hover: "hover:border-sky-400/50 hover:text-sky-300",
    },
    {
      label: "Share on WhatsApp",
      href: () => `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl()}`)}`,
      Icon: WhatsAppIcon,
      hover: "hover:border-emerald-400/50 hover:text-emerald-300",
    },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onCopy}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white/80 transition-all hover:border-aura-500/50 hover:text-white active:scale-[0.97]"
        title="Copy a link to this analysis"
      >
        <Link2 className="h-4 w-4" /> Copy link
      </button>
      {social.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => open(s.href())}
          aria-label={s.label}
          title={s.label}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all active:scale-[0.95] ${s.hover}`}
        >
          <s.Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
