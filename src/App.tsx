import { useState, useEffect, useRef } from 'react';
import { decodeMorsePath } from './morse';
import { MorseTreeSvg } from './components/MorseTreeSvg';
import { HUD } from './components/HUD';
import { Legend } from './components/Legend';

function App() {
  const [currentPath, setCurrentPath] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [lastInteraction, setLastInteraction] = useState(() => Date.now());
  
  const currentPathRef = useRef(currentPath);
  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

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
      } else if (idleTime > 1000 && currentPathRef.current !== '') {
        // > 1s inactivity: submit letter
        const char = decodeMorsePath(currentPathRef.current);
        if (char !== '?') {
          setDecodedMessage((prev) => prev + char);
        }
        setCurrentPath('');
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Input Handling
  const inputStartRef = useRef<number | null>(null);

  const handleInputStart = () => {
    inputStartRef.current = Date.now();
    setLastInteraction(Date.now());
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
  }, []);

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

      <Legend />

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
