export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-grid-faint" />
      <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-aura-600/20 blur-[120px] animate-glow" />
      <div className="absolute -left-40 top-1/3 h-[380px] w-[380px] rounded-full bg-chaos-500/10 blur-[110px] animate-float" />
      <div className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-energy-500/10 blur-[110px] animate-float" style={{ animationDelay: "-4s" }} />
    </div>
  );
}
