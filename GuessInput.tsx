import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowRight, X, Play } from 'lucide-react';

interface Segment {
  id: number;
  audio: string;
  order: number;
}

interface GuessInputProps {
  currentGuess: (number | null)[];
  onGuessChange: (guess: (number | null)[]) => void;
  onSubmit: () => void;
  onRemoveLast: () => void;
  segments: Segment[];
  onPlaySegment: (segmentIndex: number) => void;
  scrambledOrder: number[];
}

export function GuessInput({ currentGuess, onGuessChange, onSubmit, onRemoveLast, segments, onPlaySegment, scrambledOrder }: GuessInputProps) {
  const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const [activePlayButton, setActivePlayButton] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: number]: number }>({});
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeButtonRef = useRef<number | null>(null); // Track which button is playing
  
  // Audio paths for each segment
  // Using GitHub raw URLs for audio files
  const audioPaths = [
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part1.mp3',
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part2.mp3',
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part3.mp3',
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part4.mp3',
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part5.mp3',
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part6.mp3',
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part7.mp3',
    'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part8.mp3',
  ];

  useEffect(() => {
    // Create audio elements
    audioPaths.forEach((path, index) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRefs.current[index] = audio;
      
      // Try to load the audio source
      audio.src = path;
      
      // Update progress during playback
      audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isNaN(audio.duration) && activeButtonRef.current !== null) {
          const progress = (audio.currentTime / audio.duration) * 100;
          // Update progress for the button that's playing, not the audio index
          setAudioProgress(prev => ({ ...prev, [activeButtonRef.current!]: progress }));
        }
      });
      
      // Reset when audio ends
      audio.addEventListener('ended', () => {
        if (activeButtonRef.current !== null) {
          setAudioProgress(prev => ({ ...prev, [activeButtonRef.current!]: 0 }));
        }
        setActivePlayButton(null);
        activeButtonRef.current = null;
      });

      // Handle load errors (audio file not found)
      audio.addEventListener('error', () => {
        console.log(`Audio file ${path} not found - using simulated playback`);
      });
    });
    
    // Cleanup
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const addToGuess = (number: number) => {
    // Ensure we have an 8-slot array, filling with nulls if needed
    const workingGuess = currentGuess.length === 8 ? [...currentGuess] : new Array(8).fill(null);
    
    // Copy existing values if currentGuess was shorter
    if (currentGuess.length < 8) {
      currentGuess.forEach((value, index) => {
        if (value !== null) {
          workingGuess[index] = value;
        }
      });
    }
    
    // Find the first available slot (null value)
    const firstEmptyIndex = workingGuess.findIndex(slot => slot === null);
    if (firstEmptyIndex !== -1 && !workingGuess.includes(number)) {
      workingGuess[firstEmptyIndex] = number;
      onGuessChange(workingGuess);
    }
  };

  const handlePlaySegment = (buttonNumber: number) => {
    // buttonNumber is 0-indexed (0-7)
    // Get which audio part this button should play from scrambledOrder
    const audioPartNumber = scrambledOrder.length > 0 ? scrambledOrder[buttonNumber] : buttonNumber + 1;
    const audioIndex = audioPartNumber - 1; // Convert to 0-indexed for array
    const displayNumber = buttonNumber + 1; // Convert to 1-indexed for display
    
    const audio = audioRefs.current[audioIndex];
    
    // Clear any existing progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    if (audio) {
      // Stop all other audio
      audioRefs.current.forEach((a, index) => {
        if (a && index !== audioIndex) {
          a.pause();
          a.currentTime = 0;
        }
      });
      
      // Set active button (use display number for UI)
      setActivePlayButton(displayNumber);
      activeButtonRef.current = displayNumber; // Track which button is playing
      setAudioProgress(prev => ({ ...prev, [displayNumber]: 0 }));
      
      // Try to play the audio
      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Audio file not found - use simulated playback
          console.log(`Using simulated playback for button ${displayNumber} (Part ${audioPartNumber})`);
          simulateAudioPlayback(displayNumber, 2500); // 2.5 second simulation
        });
      }
      
      onPlaySegment(audioIndex);
    }
  };

  // Simulate audio playback when audio files aren't available
  const simulateAudioPlayback = (number: number, duration: number) => {
    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      setAudioProgress(prev => ({ ...prev, [number]: progress }));
      
      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setActivePlayButton(null);
        setAudioProgress(prev => ({ ...prev, [number]: 0 }));
      }
    }, 50);
  };

  const removeFromGuess = (index: number) => {
    const newGuess = currentGuess.filter((_, i) => i !== index);
    onGuessChange(newGuess);
  };

  const clearGuess = () => {
    onGuessChange([]);
  };

  const isNumberUsed = (number: number) => {
    if (currentGuess.length === 0) return false;
    return currentGuess.includes(number);
  };

  const isNumberLocked = (number: number) => {
    // Check if this number is in the correct position (locked from previous attempt)
    // Only return true if we have submitted at least one guess (meaning this is a subsequent attempt)
    const correctOrder = scrambledOrder;
    if (currentGuess.length === 0) return false;
    
    // Only lock numbers if we've made at least one previous guess
    // This means currentGuess has pre-filled correct numbers from the previous attempt
    const hasPrefilledNumbers = currentGuess.some((slot, index) => 
      slot !== null && slot === correctOrder[index]
    );
    
    if (!hasPrefilledNumbers) return false;
    
    for (let i = 0; i < currentGuess.length; i++) {
      if (currentGuess[i] === number && currentGuess[i] === correctOrder[i]) {
        return true;
      }
    }
    return false;
  };

  const getFilledSlotsCount = () => {
    if (currentGuess.length === 0) return 0;
    return currentGuess.filter(slot => slot !== null).length;
  };

  return (
    <div className="mb-6 space-y-6">
      {/* Number Buttons with Play Icons - 2x4 grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-3">
          {availableNumbers.slice(0, 4).map((number) => (
            <div
              key={number}
              className={`
                aspect-[3/4] rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 relative backdrop-blur-md overflow-hidden
                ${isNumberLocked(number)
                  ? "border-white/20 opacity-30" 
                  : isNumberUsed(number) 
                    ? "border-white/20 opacity-50" 
                    : "border-white/30"
                }
              `}
              style={{ 
                background: isNumberLocked(number)
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
                  : isNumberUsed(number)
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              {/* Glass reflection overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.03) 100%)'
                }}
              />
              
              {/* Play Icon - Clickable with Circular Progress */}
              <div className="relative w-10 h-10 mb-2">
                {/* Circular Progress Track */}
                <svg className="absolute inset-0 w-10 h-10 transform -rotate-90" style={{ zIndex: 5 }}>
                  {/* Background circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                  />
                  {/* Progress circle */}
                  {activePlayButton === number && (
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="#f16272"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (audioProgress[number] || 0) / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                    />
                  )}
                </svg>
                
                <button
                  onClick={() => handlePlaySegment(number - 1)}
                  disabled={isNumberUsed(number) || isNumberLocked(number)}
                  className={`w-10 h-10 flex items-center justify-center transition-all duration-200 relative z-10 ${
                    activePlayButton === number
                      ? "bg-transparent cursor-pointer"
                      : isNumberLocked(number)
                        ? "bg-white/10 cursor-not-allowed rounded-full"
                        : isNumberUsed(number) 
                          ? "bg-slate-600/50 cursor-not-allowed rounded-full" 
                          : "bg-white/20 hover:bg-white/30 cursor-pointer rounded-full"
                  }`}
                >
                  <Play className={`w-5 h-5 ${
                    activePlayButton === number
                      ? "text-[#f16272]"
                      : isNumberLocked(number)
                        ? "text-white/40"
                        : isNumberUsed(number) 
                          ? "text-slate-400" 
                          : "text-white"
                  } fill-current ml-0.5`} />
                </button>
              </div>
              
              {/* Number - Clickable */}
              <button
                onClick={() => addToGuess(number)}
                disabled={isNumberUsed(number) || isNumberLocked(number) || getFilledSlotsCount() >= 8}
                className={`
                  text-xl font-medium transition-all duration-200 relative z-10 px-4 py-2 rounded-lg border
                  ${isNumberLocked(number)
                    ? "bg-transparent border-white/10 text-white/30 cursor-not-allowed"
                    : isNumberUsed(number) 
                      ? "bg-transparent border-white/10 text-white/40 cursor-not-allowed" 
                      : "bg-transparent border-white/20 text-white cursor-pointer hover:bg-white/20 hover:border-white/30"
                  }
                `}
              >
                {number}
              </button>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {availableNumbers.slice(4, 8).map((number) => (
            <div
              key={number}
              className={`
                aspect-[3/4] rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 relative backdrop-blur-md overflow-hidden
                ${isNumberLocked(number)
                  ? "border-white/20 opacity-30" 
                  : isNumberUsed(number) 
                    ? "border-white/20 opacity-50" 
                    : "border-white/30"
                }
              `}
              style={{ 
                background: isNumberLocked(number)
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
                  : isNumberUsed(number)
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              {/* Glass reflection overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.03) 100%)'
                }}
              />
              
              {/* Play Icon - Clickable with Circular Progress */}
              <div className="relative w-10 h-10 mb-2">
                {/* Circular Progress Track */}
                <svg className="absolute inset-0 w-10 h-10 transform -rotate-90" style={{ zIndex: 5 }}>
                  {/* Background circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                  />
                  {/* Progress circle */}
                  {activePlayButton === number && (
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="#f16272"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (audioProgress[number] || 0) / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                    />
                  )}
                </svg>
                
                <button
                  onClick={() => handlePlaySegment(number - 1)}
                  disabled={isNumberUsed(number) || isNumberLocked(number)}
                  className={`w-10 h-10 flex items-center justify-center transition-all duration-200 relative z-10 ${
                    activePlayButton === number
                      ? "bg-transparent cursor-pointer"
                      : isNumberLocked(number)
                        ? "bg-white/10 cursor-not-allowed rounded-full"
                        : isNumberUsed(number) 
                          ? "bg-slate-600/50 cursor-not-allowed rounded-full" 
                          : "bg-white/20 hover:bg-white/30 cursor-pointer rounded-full"
                  }`}
                >
                  <Play className={`w-5 h-5 ${
                    activePlayButton === number
                      ? "text-[#f16272]"
                      : isNumberLocked(number)
                        ? "text-white/40"
                        : isNumberUsed(number) 
                          ? "text-slate-400" 
                          : "text-white"
                  } fill-current ml-0.5`} />
                </button>
              </div>
              
              {/* Number - Clickable */}
              <button
                onClick={() => addToGuess(number)}
                disabled={isNumberUsed(number) || isNumberLocked(number) || getFilledSlotsCount() >= 8}
                className={`
                  text-xl font-medium transition-all duration-200 relative z-10 px-4 py-2 rounded-lg border
                  ${isNumberLocked(number)
                    ? "bg-transparent border-white/10 text-white/30 cursor-not-allowed"
                    : isNumberUsed(number) 
                      ? "bg-transparent border-white/10 text-white/40 cursor-not-allowed" 
                      : "bg-transparent border-white/20 text-white cursor-pointer hover:bg-white/20 hover:border-white/30"
                  }
                `}
              >
                {number}
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onRemoveLast}
          variant="outline"
          className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-[#1c1634] hover:border-[#15122c] rounded-2xl h-12 text-xs font-[Myanmar_Khyay] cursor-pointer"
          disabled={getFilledSlotsCount() === 0}
        >
          Remove
        </Button>
        
        <Button
          onClick={onSubmit}
          disabled={getFilledSlotsCount() !== 8}
          className={`flex-1 rounded-2xl h-12 font-medium transition-all duration-300 text-xs font-[Myanmar_Khyay] ${
            getFilledSlotsCount() === 8
              ? "text-black hover:text-[#1c1634] hover:border-[#15122c] cursor-pointer"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
          style={getFilledSlotsCount() === 8 ? { backgroundColor: '#19a5c9' } : {}}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}