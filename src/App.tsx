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
      className="w-full h-screen bg-background text-primary flex flex-col items-center justify-center relative overflow-hidden"
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
      {/* 40px grid logic background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.03
        }}
      />
      
      <HUD 
        currentPath={currentPath}
        decodedMessage={decodedMessage}
        lastInteraction={lastInteraction}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center pt-28 pb-32 px-4">
        <MorseTreeSvg currentPath={currentPath} />
      </div>

      <Legend />
    </div>
  )
}

export default App
