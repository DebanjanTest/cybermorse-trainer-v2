export function Legend() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center gap-8 bg-background/80 px-6 py-3 border border-border rounded-lg backdrop-blur-sm shadow-[0_0_15px_rgba(0,242,255,0.1)]">
      <div className="flex items-center gap-3">
        <div className="text-primary font-mono text-xl font-bold">·</div>
        <div className="text-border text-sm uppercase tracking-widest font-bold">Dot (&lt;250ms) : Left</div>
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-3">
        <div className="text-primary font-mono text-xl font-bold">−</div>
        <div className="text-border text-sm uppercase tracking-widest font-bold">Dash (&ge;250ms) : Right</div>
      </div>
    </div>
  );
}
