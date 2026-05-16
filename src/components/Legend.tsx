export function Legend() {
  return (
    <div className="z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 frosted-glass px-6 py-3 shadow-[0_0_15px_rgba(0,229,255,0.2)] w-full sm:w-auto">
      <div className="flex items-center gap-3">
        <div className="text-[var(--color-accent-cyan)] font-mono-code text-xl font-bold drop-shadow-[0_0_5px_var(--color-accent-cyan)]">·</div>
        <div className="text-white/70 text-xs sm:text-sm uppercase tracking-widest font-futuristic-header">Dot (&lt;250ms)</div>
      </div>
      <div className="hidden sm:block w-px h-6 bg-white/20" />
      <div className="flex items-center gap-3">
        <div className="text-[var(--color-accent-magenta)] font-mono-code text-xl font-bold drop-shadow-[0_0_5px_var(--color-accent-magenta)]">−</div>
        <div className="text-white/70 text-xs sm:text-sm uppercase tracking-widest font-futuristic-header">Dash (&ge;250ms)</div>
      </div>
    </div>
  );
}
