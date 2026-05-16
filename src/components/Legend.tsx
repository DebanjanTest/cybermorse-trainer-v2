export function Legend() {
  return (
    <div className="w-full max-w-lg z-20 pointer-events-none flex flex-row items-center justify-center gap-4 sm:gap-8 frosted-glass px-4 sm:px-6 py-3 shadow-[0_0_15px_rgba(0,229,255,0.2)] mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left flex-1 sm:flex-initial">
        <div className="text-[var(--color-accent-cyan)] font-mono-code text-xl font-bold drop-shadow-[0_0_5px_var(--color-accent-cyan)] leading-none">·</div>
        <div className="text-white/70 text-xs sm:text-sm uppercase tracking-widest font-futuristic-header">Dot (&lt;250ms)<br className="sm:hidden" />: Left</div>
      </div>
      <div className="w-px h-8 sm:h-6 bg-white/20 shrink-0" />
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left flex-1 sm:flex-initial">
        <div className="text-[var(--color-accent-magenta)] font-mono-code text-xl font-bold drop-shadow-[0_0_5px_var(--color-accent-magenta)] leading-none">−</div>
        <div className="text-white/70 text-xs sm:text-sm uppercase tracking-widest font-futuristic-header">Dash (&ge;250ms)<br className="sm:hidden" />: Right</div>
      </div>
    </div>
  );
}
