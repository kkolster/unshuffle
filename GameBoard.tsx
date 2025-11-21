
interface GameBoardProps {
  guesses: number[][];
  currentGuess: (number | null)[];
  maxAttempts: number;
  correctOrder: number[];
}

export function GameBoard({ guesses, currentGuess, maxAttempts, correctOrder }: GameBoardProps) {
  const getSegmentColor = (guess: number, position: number, guessIndex: number) => {
    // Only show colors for submitted guesses
    if (guessIndex >= guesses.length) return { className: 'bg-slate-700/30 border-slate-600/30 text-white/40' };
    
    if (guess === correctOrder[position]) {
      return { className: 'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-300 text-white' }; // Correct position
    } else if (correctOrder.includes(guess)) {
      return { 
        className: 'text-white border-2', 
        style: { 
          background: `linear-gradient(to bottom right, #6d60aa, #5a4d8a)`,
          borderColor: '#6d60aa'
        }
      }; // Correct segment, wrong position
    } else {
      return { className: 'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400 text-white' }; // Wrong segment
    }
  };

  const renderRow = (guess: (number | null)[] | number[], rowIndex: number) => {
    const isCurrentRow = rowIndex === guesses.length && currentGuess.some(slot => slot !== null);
    const displayGuess = isCurrentRow ? currentGuess : guess;
    const isSubmittedRow = rowIndex < guesses.length;
    
    // For current row, we need to track which numbers were pre-filled vs newly entered
    // We can detect pre-filled numbers by checking if there are any guesses already submitted
    // and if this current guess has numbers that match correct positions
    const isPrefilledRow = isCurrentRow && guesses.length > 0;
    
    return (
      <div key={rowIndex} className="flex gap-2 justify-center items-center">
        <span className="text-white/60 text-sm font-medium mr-2 min-w-[20px] flex items-center justify-center">
          {rowIndex + 1}
        </span>
        
        {/* 8 segment slots */}
        <div className="grid grid-cols-8 gap-1.5 flex-1">
          {Array.from({ length: 8 }, (_, index) => {
            const cellValue = displayGuess[index];
            const isCurrentRowCell = isCurrentRow;
            
            // Only show green if this is a pre-filled number from a previous correct attempt
            // This means: current row + has previous guesses + this slot was correct in previous attempt
            const wasCorrectInPrevious = isPrefilledRow && guesses.length > 0 && 
              guesses[guesses.length - 1][index] === correctOrder[index] && 
              cellValue === correctOrder[index];
            
            return (
              <div
                key={index}
                className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-300 text-xs font-semibold
                  ${cellValue ? 
                    (isCurrentRowCell ? 
                      (wasCorrectInPrevious ? 
                        'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-300 text-white' : 
                        'bg-gradient-to-br from-cyan-400/20 to-cyan-500/20 border-cyan-400 text-cyan-300 backdrop-blur-sm'
                      ) : 
                      getSegmentColor(cellValue, index, rowIndex).className
                    )
                    : 'bg-slate-700/20 border-slate-600/20 backdrop-blur-sm'
                  }
                  ${isCurrentRowCell && !wasCorrectInPrevious ? 'animate-pulse' : ''}
                `}
                style={cellValue && !isCurrentRowCell ? getSegmentColor(cellValue, index, rowIndex).style : undefined}
              >
                {cellValue && (
                  <span className={`z-10 relative ${isSubmittedRow ? 'text-white' : (wasCorrectInPrevious ? 'text-white' : 'text-cyan-300')}`}>
                    {cellValue}
                  </span>
                )}
                
                {/* Empty slot indicator */}
                {!cellValue && !isSubmittedRow && (
                  <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Only show if there are guesses to display
  if (guesses.length === 0 && !currentGuess.some(slot => slot !== null)) {
    return null;
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 mb-4">
      {/* Header with "Your Guesses" text */}
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <p className="text-white/60 text-sm">Your Guesses</p>
      </div>
      
      <div className="space-y-3">
        {/* Render all guess rows */}
        {Array.from({ length: maxAttempts }, (_, index) => {
          if (index < guesses.length) {
            return renderRow(guesses[index], index);
          } else if (index === guesses.length && currentGuess.some(slot => slot !== null)) {
            return renderRow(currentGuess, index);
          } else {
            return null; // Don't show empty rows
          }
        }).filter(Boolean)}
      </div>
      
      {/* Attempt Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: maxAttempts }, (_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < guesses.length 
                ? 'bg-white/80' 
                : i === guesses.length && currentGuess.some(slot => slot !== null)
                  ? 'bg-white/50'
                  : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}