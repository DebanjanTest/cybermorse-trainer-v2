import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface HUDProps {
  currentPath: string;
  decodedMessage: string;
  lastInteraction: number;
}

export function HUD({ currentPath, decodedMessage, lastInteraction }: HUDProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateProgress = () => {
      const now = Date.now();
      const idleTime = now - lastInteraction;
      
      // We only show progress when there's an active path and it's less than 2s
      if (currentPath !== '') {
        // We purge at 1s for submission, 2s for total reset. 
        // Let's visually map 0 -> 100% over 1s to show submission urgency
        // then resetting if nothing happened.
        // Actually, requirements say "Progress bar sync with 2.0s purge timer"
        const p = Math.min((idleTime / 2000) * 100, 100);
        setProgress(p);
      } else {
        setProgress(0);
      }

      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, [lastInteraction, currentPath]);

  return (
    <div className="w-full z-20 pointer-events-none flex flex-col gap-4 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start w-full frosted-glass p-4 gap-4 sm:gap-0">
        <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left w-full sm:w-auto">
          <div className="text-xs uppercase tracking-widest text-white/50 font-futuristic-header break-words">Transmission Stream</div>
          <div className="flex items-center gap-2 font-mono-code text-xl text-[var(--color-accent-magenta)] drop-shadow-[0_0_8px_var(--color-accent-magenta)] flex-wrap justify-center sm:justify-start">
            <span className="break-all">{decodedMessage}</span>
            <span className="opacity-70 text-[var(--color-accent-cyan)] drop-shadow-[0_0_8px_var(--color-accent-cyan)] break-all">{currentPath}</span>
            <motion.span 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[10px] h-[20px] bg-[var(--color-accent-magenta)] shadow-[0_0_8px_var(--color-accent-magenta)] shrink-0"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full sm:w-48 text-center sm:text-right shrink-0">
          <div className="text-xs uppercase tracking-widest text-white/50 font-futuristic-header">Purge Sequence</div>
          <div className="w-full h-2 bg-white/10 relative overflow-hidden rounded-sm">
            <div 
              className="absolute top-0 left-0 h-full bg-[var(--color-accent-cyan)] shadow-[0_0_8px_var(--color-accent-cyan)]"
              style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
