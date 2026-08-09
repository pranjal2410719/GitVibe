export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-aura-400" aria-hidden />
        <p className="text-sm text-white/45">Analyzing the vibe…</p>
      </div>
    </div>
  );
}
