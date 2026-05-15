import { useState, useEffect, useRef } from 'react';
import { decodeMorsePath } from './morse';
import { MorseTreeSvg } from './components/MorseTreeSvg';
import { HUD } from './components/HUD';
import { Legend } from './components/Legend';
import { useAuth } from './context/AuthContext';
import { UserProfile } from './components/UserProfile';
import { Leaderboard } from './components/Leaderboard';

const COMPETITION_TERMS = ["HELLO", "WORLD", "REACT", "MORSE", "CYBER", "JULES", "VITE", "HACK", "NEON", "BYTE"];

function App() {
  const [currentPath, setCurrentPath] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [lastInteraction, setLastInteraction] = useState(() => Date.now());
  
  // Competition State
  const { currentUser, signInWithGoogle, updateHighScore } = useAuth();
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
    setGameStartTime(null); // Will start on first input
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
        // > 2s inactivity: clear message and reset path
        setDecodedMessage('');
        setCurrentPath('');
        // Reset game start time so they can restart fresh
        if (isGameActive && decodedMessageRef.current === '') {
          setGameStartTime(null);
        }
      } else if (idleTime > 1000 && currentPathRef.current !== '') {
        // > 1s inactivity: submit letter
        const char = decodeMorsePath(currentPathRef.current);
        if (char !== '?') {
          setDecodedMessage((prev) => {
            const newMsg = prev + char;

            // Competition Win Condition
            if (isGameActive && targetTermRef.current !== '') {
              // If they correctly matched the term
              if (newMsg === targetTermRef.current) {
                // End game and calc score
                if (gameStartTime) {
                  const durationInSecs = (Date.now() - gameStartTime) / 1000;
                  const chars = targetTermRef.current.length;
                  const bps = parseFloat((chars / durationInSecs).toFixed(2));
                  setCurrentScore(bps);
                  updateHighScore(bps);
                }
                setIsGameActive(false);
              } else if (!targetTermRef.current.startsWith(newMsg)) {
                // If they made a mistake, instantly fail/reset decoded msg to try again
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

  // Input Handling
  const inputStartRef = useRef<number | null>(null);

  const handleInputStart = () => {
    inputStartRef.current = Date.now();
    setLastInteraction(Date.now());

    // Start the timer on the very first input of the game
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameActive, gameStartTime, decodedMessage]);

  return (
    <div 
      className="w-full h-screen text-primary flex flex-col items-center justify-center relative overflow-hidden bg-transparent"
      onPointerDown={(e) => {
        // Prevent default only if it's touch to avoid double firing
        if (e.pointerType === 'touch') {
          e.preventDefault(); // Might not be needed in React pointer events, but good to have
        }
        handleInputStart();
      }}
      onPointerUp={handleInputEnd}
      onPointerLeave={handleInputEnd}
      onPointerCancel={handleInputEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Background Scenario: Out-of-focus high-tech workspace/Vedic-Futuristic landscape */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 45, 125, 0.1) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0, 229, 255, 0.15) 0%, transparent 40%)',
          filter: 'blur(20px)',
          opacity: 0.8
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.5
        }}
      />
      
      <HUD 
        currentPath={currentPath}
        decodedMessage={decodedMessage}
        lastInteraction={lastInteraction}
      />

      {/* Main Panel: Large rounded container with blur and rim lighting */}
      <div className="relative z-10 w-[95%] h-[80%] max-w-[1400px] max-h-[900px] glass-panel rim-lighting flex flex-col items-center justify-center mt-12 p-8 box-border">
        <MorseTreeSvg currentPath={currentPath} />
      </div>

      {/* Competition UI Overlay */}
      {isGameActive && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 frosted-glass px-8 py-4 pointer-events-none">
          <div className="text-white/70 text-sm uppercase tracking-widest font-futuristic-header">Target Term</div>
          <div className="text-[var(--color-accent-magenta)] font-mono-code text-4xl font-bold tracking-[0.2em] drop-shadow-[0_0_8px_var(--color-accent-magenta)]">
            {targetTerm}
          </div>
        </div>
      )}

      {currentScore !== null && !isGameActive && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 frosted-glass px-8 py-4 border-[var(--color-accent-cyan)] shadow-[0_0_20px_rgba(0,229,255,0.4)] pointer-events-none">
          <div className="text-[var(--color-accent-cyan)] text-sm uppercase tracking-widest font-futuristic-header">Transmission Complete</div>
          <div className="text-white font-mono-code text-2xl font-bold">
            Speed: <span className="text-[var(--color-accent-magenta)]">{currentScore}</span> BPS
          </div>
        </div>
      )}

      <Legend />

      {/* Side Panels */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 hidden md:block">
        <UserProfile />
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 hidden md:block">
        <Leaderboard />
      </div>

      {/* Start Game Action */}
      {!isGameActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!currentUser) {
              signInWithGoogle();
            } else {
              startGame();
            }
          }}
          className="absolute bottom-28 z-30 px-6 py-3 rounded-full frosted-glass border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] font-futuristic-header uppercase tracking-widest hover:bg-[rgba(0,229,255,0.1)] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        >
          {!currentUser ? 'Sign In with Google to Compete' : (currentScore ? 'Restart Transmission' : 'Start Competition')}
        </button>
      )}

      {/* Jules Command Orb */}
      <button
        className="absolute bottom-6 z-30 w-16 h-16 rounded-full bg-[rgba(0,123,255,0.2)] border border-[rgba(255,255,255,0.4)] flex items-center justify-center inner-glow-azure cursor-pointer hover:scale-105 transition-transform duration-200"
        title="Jules Command Orb"
        onClick={(e) => e.stopPropagation()} // Prevent triggering app input
      >
        <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_10px_white]">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div>
        </div>
      </button>
    </div>
  )
}

export default App
