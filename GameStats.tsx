import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trophy, Share2, Calendar, Target, X } from 'lucide-react';
import { ShareResults } from './ShareResults';

interface Song {
  title: string;
  artist: string;
  album: string;
}

interface GameStatsProps {
  isOpen: boolean;
  onClose: () => void;
  gameWon: boolean;
  attempts: number;
  maxAttempts: number;
  song: Song;
  guesses: number[][];
  correctOrder: number[];
  currentStreak?: number;
}

export function GameStats({ isOpen, onClose, gameWon, attempts, maxAttempts, song, guesses, correctOrder, currentStreak }: GameStatsProps) {
  const handleShare = () => {
    const result = gameWon ? `${attempts}/${maxAttempts}` : 'X/6';
    const text = `unshuffle #4 ${result}\n\n${gameWon ? '🎵 Solved!' : '🎵 Better luck tomorrow!'}\n\nPlay at: ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'unshuffle results',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const getNextGameTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const now = new Date();
    const timeDiff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="border-slate-600/30 text-white max-w-sm mx-4 rounded-2xl backdrop-blur-[50px] [&>button]:hidden" 
        style={{ backgroundColor: 'rgba(21, 18, 44, 0.4)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-center font-[Michroma]" style={{ color: '#19a5c9' }}>
            {gameWon ? 'Congratulations! 🎉' : 'Game Over'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {gameWon ? 'You won the challenge!' : 'Better luck tomorrow!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Song Info */}
          <Card className="border-slate-600/30" style={{ backgroundColor: '#15122c' }}>
            <div className="p-4 text-center">
              <h3 className="text-white mb-1 font-[Michroma]">{song.title}</h3>
              <p style={{ color: '#19a5c9' }} className="font-[Myanmar_Khyay]">{song.artist}</p>
              <p className="text-white/60 font-[Myanmar_Khyay]">{song.album}</p>
            </div>
          </Card>

          {/* Game Result */}
          <Card className="border-slate-600/30" style={{ backgroundColor: '#15122c' }}>
            <div className="p-4">
              <div className="text-center mb-3">
                <div className="text-white mb-1 font-[Michroma]">
                  {gameWon ? `Solved in ${attempts} attempts!` : 'Better luck next time!'}
                </div>
                <div className="text-white/80 font-[Myanmar_Khyay]">
                  {gameWon ? `${attempts}/${maxAttempts}` : 'X/6'}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 cursor-pointer" style={{ color: '#19a5c9' }} />
                    <span className="text-white/60 font-[Myanmar_Khyay]">Accuracy</span>
                  </div>
                  <div className="text-white font-[Michroma]">
                    {gameWon ? Math.round((1 / attempts) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 cursor-pointer" style={{ color: '#19a5c9' }} />
                    <span className="text-white/60 font-[Myanmar_Khyay]">Streak</span>
                  </div>
                  <div className="text-white font-[Michroma]">{currentStreak || 1}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Game */}
          <Card className="border-slate-600/30" style={{ backgroundColor: '#15122c' }}>
            <div className="p-4 text-center">
              <p className="text-white/80 mb-1 font-[Myanmar_Khyay]">Next unshuffle</p>
              <div className="font-[Michroma]" style={{ color: '#19a5c9' }}>{getNextGameTime()}</div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pb-4">
            <Button 
              onClick={handleShare}
              className="text-white hover:opacity-90 font-[Myanmar_Khyay] cursor-pointer"
              style={{ backgroundColor: '#f16272' }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-[#1c1634] hover:border-[#15122c] font-[Myanmar_Khyay] cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}