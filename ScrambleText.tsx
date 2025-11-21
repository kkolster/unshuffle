import { useState, useEffect } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
  scrambleSpeed?: number;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

export function ScrambleText({ 
  text, 
  className = '', 
  duration = 2000,
  scrambleSpeed = 50 
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(true);

  useEffect(() => {
    let frame = 0;
    const totalFrames = duration / scrambleSpeed;
    
    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        setDisplayText(text);
        setIsScrambling(false);
        clearInterval(interval);
        return;
      }

      const progress = frame / totalFrames;
      const revealedChars = Math.floor(text.length * progress);
      
      const scrambled = text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        if (index < revealedChars) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');

      setDisplayText(scrambled);
      frame++;
    }, scrambleSpeed);

    return () => clearInterval(interval);
  }, [text, duration, scrambleSpeed]);

  return <span className={className}>{displayText}</span>;
}