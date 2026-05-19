import { useAuth } from '../context/AuthContext';

export function WelcomeScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="w-full h-screen text-primary flex flex-col items-center justify-center relative overflow-hidden bg-transparent">
      {/* Background elements */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 45, 125, 0.1) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0, 229, 255, 0.15) 0%, transparent 40%)',
          filter: 'blur(20px)',
          opacity: 0.8
        }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.5
        }}
      />

      <div className="z-10 frosted-glass p-12 max-w-lg w-[90%] flex flex-col items-center gap-6 border-[var(--color-accent-cyan)] shadow-[0_0_30px_rgba(0,229,255,0.2)] text-center">
        <div className="w-20 h-20 rounded-full border-2 border-[var(--color-accent-magenta)] flex items-center justify-center shadow-[0_0_15px_var(--color-accent-magenta)] mb-2">
          <span className="text-4xl">⚡</span>
        </div>

        <h1 className="font-futuristic-header text-3xl text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          CyberMorse Network
        </h1>

        <p className="text-white/70 font-mono-code text-sm leading-relaxed">
          Access the global transmission grid. Synchronize your high scores, compete with other operators, and master the Morse code protocol.
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-4 px-8 py-4 w-full rounded bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,229,255,0.2)] border border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] font-futuristic-header text-lg uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)] flex items-center justify-center gap-3"
        >
          <span>Connect Google ID</span>
        </button>
      </div>
    </div>
  );
}
