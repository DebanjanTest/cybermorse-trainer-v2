export function Legend() {
  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center gap-8 frosted-glass px-6 py-3 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
      <div className="flex items-center gap-3">
        <div className="text-[var(--color-accent-cyan)] font-mono-code text-xl font-bold drop-shadow-[0_0_5px_var(--color-accent-cyan)]">·</div>
        <div className="text-white/70 text-sm uppercase tracking-widest font-futuristic-header">Dot (&lt;250ms) : Left</div>
      </div>
      <div className="w-px h-6 bg-white/20" />
      <div className="flex items-center gap-3">
        <div className="text-[var(--color-accent-magenta)] font-mono-code text-xl font-bold drop-shadow-[0_0_5px_var(--color-accent-magenta)]">−</div>
        <div className="text-white/70 text-sm uppercase tracking-widest font-futuristic-header">Dash (&ge;250ms) : Right</div>
      </div>
    </div>
  );
}
