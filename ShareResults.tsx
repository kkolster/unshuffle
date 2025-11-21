import { useState } from 'react';
import { Button } from './ui/button';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareResultsProps {
  won: boolean;
  attempts: number;
  maxAttempts: number;
  guesses: number[][];
  correctOrder: number[];
}

export function ShareResults({ won, attempts, maxAttempts, guesses, correctOrder }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let text = `🎵 unshuffle ${today}\n`;
    text += won ? `✅ ${attempts}/${maxAttempts}\n\n` : `❌ ${maxAttempts}/${maxAttempts}\n\n`;

    // Generate emoji grid
    guesses.forEach((guess) => {
      const row = guess.map((num, index) => {
        if (num === correctOrder[index]) {
          return '🟩'; // Correct position
        } else if (correctOrder.includes(num)) {
          return '🟨'; // Correct number, wrong position
        } else {
          return '⬛'; // Wrong
        }
      }).join('');
      text += row + '\n';
    });

    text += '\nPlay at unshuffle.app';
    return text;
  };

  const handleShare = async () => {
    const shareText = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        });
      } catch (error) {
        // User cancelled share or error occurred
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const shareText = generateShareText();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleShare}
        className="w-full text-white rounded-xl hover:opacity-90 font-[Michroma] cursor-pointer"
        style={{ backgroundColor: '#19a5c9' }}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Results
      </Button>

      <Button
        onClick={handleCopy}
        variant="outline"
        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#15122c] hover:text-[#1c1634] rounded-xl font-[Myanmar_Khyay] cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" style={{ color: '#19a5c9' }} />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Results
          </>
        )}
      </Button>

      {/* Preview */}
      <div className="bg-white/5 rounded-xl p-4 mt-4">
        <p className="text-white/60 text-xs mb-2 font-[Myanmar_Khyay]">Preview:</p>
        <pre className="text-white text-xs font-mono whitespace-pre-wrap">
          {generateShareText()}
        </pre>
      </div>
    </div>
  );
}