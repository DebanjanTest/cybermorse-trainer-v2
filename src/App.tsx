import { useState, useEffect, useRef } from 'react';
import { decodeMorsePath } from './morse';
import { MorseTreeSvg } from './components/MorseTreeSvg';
import { HUD } from './components/HUD';
import { Legend } from './components/Legend';
import { useAuth } from './context/AuthContext';
import { UserProfile } from './components/UserProfile';
import { Leaderboard } from './components/Leaderboard';
import { WelcomeScreen } from './components/WelcomeScreen';

const COMPETITION_TERMS = [
  // Easy
  'SOS', 'HI', 'FUN', 'CAT', 'DOG', 'SUN', 'CODE', 'TECH', 'JULES',
  // General / Medium
  'HELLO', 'WORLD', 'REACT', 'MORSE', 'CYBER', 'VITE', 'HACK', 'NEON', 'BYTE', 'GHOST', 'PIXEL',
  // Tough
  'ALGORITHM', 'ENCRYPTION', 'NETWORK', 'PROTOCOL', 'DATAGRAM', 'BANDWIDTH', 'LATENCY', 'SYNCHRONIZE',
  // Extremely Tough
  'ASYMMETRIC', 'POLYMORPHISM', 'VIRTUALIZATION', 'AUTHENTICATION', 'TELECOMMUNICATION'
];

function App() {
  const [currentPath, setCurrentPath] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [lastInteraction, setLastInteraction] = useState(() => Date.now());

  const { currentUser, updateHighScore } = useAuth();
  const [targetTerm, setTargetTerm] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  const currentPathRef = useRef(currentPath);
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  const targetTermRef = useRef(targetTerm);
  useEffect(() => {
    targetTermRef.current = targetTerm;
  }, [targetTerm]);

  const decodedMessageRef = useRef(decodedMessage);
  useEffect(() => {
    decodedMessageRef.current = decodedMessage;
  }, [decodedMessage]);

  const startGame = () => {
    const term = COMPETITION_TERMS[Math.floor(Math.random() * COMPETITION_TERMS.length)];
    setTargetTerm(term);
    setDecodedMessage('');
    setCurrentPath('');
    setIsGameActive(true);
    setGameStartTime(null);
    setCurrentScore(null);
  };

  const lastInteractionRef = useRef(lastInteraction);
  useEffect(() => {
    lastInteractionRef.current = lastInteraction;
  }, [lastInteraction]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastInteractionRef.current;

      if (idleTime > 2000) {
        setDecodedMessage('');
        setCurrentPath('');

        if (isGameActive && decodedMessageRef.current === '') {
          setGameStartTime(null);
        }
      } else if (idleTime > 1000 && currentPathRef.current !== '') {
        const char = decodeMorsePath(currentPathRef.current);
        if (char !== '?') {
          setDecodedMessage((prev) => {
            const newMsg = prev + char;

            if (isGameActive && targetTermRef.current !== '') {
              if (newMsg === targetTermRef.current) {
                if (gameStartTime) {
                  const durationInSecs = (Date.now() - gameStartTime) / 1000;
                  const chars = targetTermRef.current.length;
                  const bps = parseFloat((chars / durationInSecs).toFixed(2));
                  setCurrentScore(bps);
                  updateHighScore(bps);
                }
                setIsGameActive(false);
              } else if (!targetTermRef.current.startsWith(newMsg)) {
                return '';
              }
            }
            return newMsg;
          });
        }
        setCurrentPath('');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGameActive, gameStartTime, updateHighScore]);

  const inputStartRef = useRef<number | null>(null);

  const handleInputStart = () => {
    inputStartRef.current = Date.now();
    setLastInteraction(Date.now());

    if (isGameActive && !gameStartTime && decodedMessage === '') {
      setGameStartTime(Date.now());
    }
  };

  const handleInputEnd = () => {
    if (inputStartRef.current === null) return;
    const duration = Date.now() - inputStartRef.current;
    inputStartRef.current = null;

    setLastInteraction(Date.now());

    if (duration < 250) {
      setCurrentPath((prev) => prev + '.');
    } else {
      setCurrentPath((prev) => prev + '-');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (inputStartRef.current === null) {
          handleInputStart();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleInputEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameActive, gameStartTime, decodedMessage]);

  if (!currentUser) {
    return <WelcomeScreen />;
  }

  return (
    <div
      className="w-full h-screen text-primary flex flex-col relative overflow-hidden bg-transparent pt-4 pb-4 px-4 sm:px-8 box-border"
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') {
          e.preventDefault();
        }
        handleInputStart();
      }}
      onPointerUp={handleInputEnd}
      onPointerLeave={handleInputEnd}
      onPointerCancel={handleInputEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 45, 125, 0.1) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0, 229, 255, 0.15) 0%, transparent 40%)',
          filter: 'blur(20px)',
          opacity: 0.8,
        }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
        }}
      />

      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto flex flex-col gap-4">
        <div className="w-full flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <UserProfile />
          <div className="flex-1 w-full max-w-3xl">
            <HUD currentPath={currentPath} decodedMessage={decodedMessage} lastInteraction={lastInteraction} />
          </div>
          <div className="hidden lg:block">
            <Leaderboard />
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
          <div className="w-full h-full glass-panel rim-lighting flex flex-col items-center justify-center p-4 sm:p-8 box-border relative overflow-hidden">
            {isGameActive && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 frosted-glass px-8 py-4 pointer-events-none">
                <div className="text-white/70 text-sm uppercase tracking-widest font-futuristic-header">Target Term</div>
                <div className="text-[var(--color-accent-magenta)] font-mono-code text-2xl sm:text-4xl font-bold tracking-[0.2em] drop-shadow-[0_0_8px_var(--color-accent-magenta)]">
                  {targetTerm}
                </div>
              </div>
            )}

            {currentScore !== null && !isGameActive && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 frosted-glass px-8 py-4 border-[var(--color-accent-cyan)] shadow-[0_0_20px_rgba(0,229,255,0.4)] pointer-events-none text-center">
                <div className="text-[var(--color-accent-cyan)] text-sm uppercase tracking-widest font-futuristic-header">Transmission Complete</div>
                <div className="text-white font-mono-code text-xl sm:text-2xl font-bold">
                  Speed: <span className="text-[var(--color-accent-magenta)]">{currentScore}</span> BPS
                </div>
              </div>
            )}

            <MorseTreeSvg currentPath={currentPath} />
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between mt-auto">
          <Legend />

          {!isGameActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-8 py-4 rounded-full frosted-glass border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] font-futuristic-header uppercase tracking-widest hover:bg-[rgba(0,229,255,0.1)] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)] text-sm sm:text-base z-30 whitespace-nowrap"
            >
              {currentScore ? 'Restart Transmission' : 'Start Competition'}
            </button>
          )}

          <button
            className="w-16 h-16 rounded-full bg-[rgba(0,123,255,0.2)] border border-[rgba(255,255,255,0.4)] flex items-center justify-center inner-glow-azure cursor-pointer hover:scale-105 transition-transform duration-200 shrink-0 z-30"
            title="Jules Command Orb"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_10px_white]">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
