import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5" style={{ color: '#FFD700' }} />;
    if (index === 1) return <Medal className="w-5 h-5" style={{ color: '#C0C0C0' }} />;
    if (index === 2) return <Award className="w-5 h-5" style={{ color: '#CD7F32' }} />;
    return <span className="text-white/40 font-[Michroma]">#{index + 1}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-600/30 text-white max-w-sm mx-4 rounded-2xl max-h-[80vh] overflow-y-auto backdrop-blur-[50px]" style={{ backgroundColor: 'rgba(21, 18, 44, 0.4)' }}>
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 font-[Michroma]" style={{ color: '#19a5c9' }}>
            <Trophy className="w-5 h-5" />
            Leaderboard
          </DialogTitle>
          <DialogDescription className="sr-only">
            View the top players ranked by wins and win rate
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-white/60 font-[Myanmar_Khyay]">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 font-[Myanmar_Khyay]">No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all"
                style={{
                  backgroundColor: index < 3 ? 'rgba(25, 165, 201, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Rank */}
                <div className="w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate font-[Michroma]">
                    {entry.username}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: 'rgba(241, 98, 114, 0.2)', color: '#f16272' }}
                  >
                    {entry.wins} wins
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: 'rgba(25, 165, 201, 0.2)', color: '#19a5c9' }}
                  >
                    🔥 {entry.bestStreak}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}