import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { User, Trophy, Flame, Target, LogOut, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  onLogout: () => void;
}

export function Profile({ isOpen, onClose, accessToken, onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const winRate = stats?.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-600/30 text-white max-w-sm mx-4 rounded-2xl backdrop-blur-[50px]" style={{ backgroundColor: 'rgba(21, 18, 44, 0.4)' }}>
        <DialogHeader>
          <DialogTitle className="text-center font-[Michroma]" style={{ color: '#19a5c9' }}>
            Your Profile
          </DialogTitle>
          <DialogDescription className="sr-only">
            View your profile information and game statistics
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-white/60 font-[Myanmar_Khyay]">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info */}
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="text-white text-2xl font-[Michroma]" style={{ backgroundColor: '#f16272' }}>
                  {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white font-[Michroma] mb-1 text-lg">{profile?.username}</h3>
              <p className="text-white/60 text-sm font-[Myanmar_Khyay]">Level {stats?.totalGames || 0} • {stats?.wins >= 10 ? 'Expert Player' : stats?.wins >= 5 ? 'Intermediate' : 'Beginner'}</p>
              <p className="text-white/60 text-sm font-[Myanmar_Khyay] mt-2 font-bold font-normal text-[12px]">Your unshuffle stats and achievements</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border border-slate-600/30 rounded-xl" style={{ backgroundColor: '#15122c' }}>
                <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: '#f16272' }} />
                <p className="text-2xl text-white font-bold font-[Michroma]">{stats?.wins || 0}</p>
                <p className="text-white/60 text-sm font-[Myanmar_Khyay]">Wins</p>
              </div>

              <div className="text-center p-3 border border-slate-600/30 rounded-xl" style={{ backgroundColor: '#15122c' }}>
                <Flame className="w-6 h-6 mx-auto mb-2" style={{ color: '#19a5c9' }} />
                <p className="text-2xl text-white font-bold font-[Michroma]">{stats?.currentStreak || 0}</p>
                <p className="text-white/60 text-sm font-[Myanmar_Khyay]">Current Streak</p>
              </div>

              <div className="text-center p-3 border border-slate-600/30 rounded-xl" style={{ backgroundColor: '#15122c' }}>
                <Target className="w-6 h-6 mx-auto mb-2" style={{ color: '#f16272' }} />
                <p className="text-2xl text-white font-bold font-[Michroma]">{winRate}%</p>
                <p className="text-white/60 text-sm font-[Myanmar_Khyay]">Win Rate</p>
              </div>

              <div className="text-center p-3 border border-slate-600/30 rounded-xl" style={{ backgroundColor: '#15122c' }}>
                <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: '#19a5c9' }} />
                <p className="text-2xl text-white font-bold font-[Michroma]">{stats?.bestStreak || 0}</p>
                <p className="text-white/60 text-sm font-[Myanmar_Khyay]">Best Streak</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm font-[Myanmar_Khyay]">Total Games</span>
                <Badge variant="secondary" style={{ backgroundColor: 'rgba(25, 165, 201, 0.2)', color: '#19a5c9' }}>
                  {stats?.totalGames || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm font-[Myanmar_Khyay]">Average Attempts</span>
                <Badge variant="secondary" style={{ backgroundColor: 'rgba(241, 98, 114, 0.2)', color: '#f16272' }}>
                  {stats?.averageAttempts ? stats.averageAttempts.toFixed(1) : '0.0'}
                </Badge>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 rounded-xl font-[Myanmar_Khyay] cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}