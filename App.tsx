import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Heart, Star, ChevronRight, User, Trophy as TrophyIcon, Trophy } from 'lucide-react';
import trackImage from 'figma:asset/eed14f60493fca5628dc561490f4064fc95860cc.png';
import { getSupabaseClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { MusicPlayer } from './components/MusicPlayer';
import { GuessInput } from './components/GuessInput';
import { ArtistPromotion } from './components/ArtistPromotion';
import { GameStats } from './components/GameStats';
import { Profile } from './components/Profile';
import { Leaderboard } from './components/Leaderboard';
import { ScrambleText } from './components/ScrambleText';
import { Privacy } from './components/Privacy';
import image_5f43981e82d0815da7f644095601b6886a53a5dc from 'figma:asset/5f43981e82d0815da7f644095601b6886a53a5dc.png';
import favicon from 'figma:asset/091c4a11eb8e2aa306340b434cec1aca26f1cbb1.png';
import unshuffleLogo from 'figma:asset/b19ac2d27cc741fba24aac501f060ebe6f82b5db.png';
import { BarChart3, HelpCircle } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

// Utility function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Mock game data - updated to 8 segments
const DAILY_SONG = {
  id: 1,
  title: "Better Days",
  artist: "The Crooks",
  album: "Summer Vibes",
  duration: 180,
  segments: [
    { id: 1, audio: "/audio/segment1.mp3", order: 1 },
    { id: 2, audio: "/audio/segment2.mp3", order: 2 },
    { id: 3, audio: "/audio/segment3.mp3", order: 3 },
    { id: 4, audio: "/audio/segment4.mp3", order: 4 },
    { id: 5, audio: "/audio/segment5.mp3", order: 5 },
    { id: 6, audio: "/audio/segment6.mp3", order: 6 },
    { id: 7, audio: "/audio/segment7.mp3", order: 7 },
    { id: 8, audio: "/audio/segment8.mp3", order: 8 }
  ],
  coverUrl: "https://images.unsplash.com/photo-1632667113863-24e85951b9d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGJ1bSUyMGNvdmVyJTIwbXVzaWMlMjBhcnR8ZW58MXx8fHwxNzU3NjIyNzM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

export default function App() {
  // Auth state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Game state
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guesses, setGuesses] = useState<number[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<(number | null)[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [playingMainTrack, setPlayingMainTrack] = useState(false);
  const [showFeaturedArtists, setShowFeaturedArtists] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const maxAttempts = 6;
  
  const [scrambledOrder, setScrambledOrder] = useState<number[]>([]);
  const [correctOrder, setCorrectOrder] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mainTrackAudioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = getSupabaseClient();

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
    
    // Listen for auth state changes (important for OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.access_token ? 'Session active' : 'No session');
      
      if (event === 'SIGNED_IN' && session?.access_token) {
        console.log('✅ User signed in via OAuth, redirecting to game...');
        setAccessToken(session.access_token);
        setShowOnboarding(false);
        setShowAuth(false);
        await checkTodaySession(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setAccessToken(null);
        setShowAuth(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Set favicon
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    // Set page title
    document.title = 'unshuffle';
  }, []);

  const checkExistingSession = async () => {
    console.log('🔍 Checking for existing session...');
    
    // First, check if we're returning from an OAuth redirect
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessTokenFromHash = hashParams.get('access_token');
    
    if (accessTokenFromHash) {
      console.log('✅ Found OAuth token in URL, processing...');
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      console.log('✅ Found existing session, user is logged in');
      setAccessToken(session.access_token);
      // User is logged in, skip onboarding and go straight to game
      setShowOnboarding(false);
      setShowAuth(false);
      setIsCheckingAuth(false);
      await checkTodaySession(session.access_token);
    } else {
      console.log('ℹ️ No existing session found, showing onboarding');
      // No session - always show onboarding first for new visitors
      setShowOnboarding(true);
      setShowAuth(false);
      setIsCheckingAuth(false);
    }
  };

  const checkTodaySession = async (token: string) => {
    console.log('🎮 Checking if user has played today...');
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/today-session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasPlayedToday(data.hasPlayed);
        if (data.hasPlayed) {
          console.log('✅ User has already played today');
          // Load the session data
          if (data.session) {
            setGameWon(data.session.won);
            setAttempts(data.session.attempts);
            setGuesses(data.session.guesses || []);
          }
        } else {
          console.log('ℹ️ User has not played today yet');
        }
      }
    } catch (error) {
      console.error('❌ Error checking today session:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      initializeGame();
    }
  }, [accessToken]);

  useEffect(() => {
    const mainAudio = new Audio();
    mainAudio.preload = 'auto';
    mainAudio.src = 'https://raw.githubusercontent.com/kkolster/unshuffle/1f3bcc5dccb320d9d0b32fa3d7ec28c4bd214407/The%20Crooks%20-%20Better%20Days.mp3';
    mainTrackAudioRef.current = mainAudio;

    mainAudio.addEventListener('ended', () => {
      setPlayingMainTrack(false);
    });

    mainAudio.addEventListener('error', () => {
      console.log('Error loading main track audio');
    });

    return () => {
      if (mainTrackAudioRef.current) {
        mainTrackAudioRef.current.pause();
        mainTrackAudioRef.current.src = '';
      }
    };
  }, []);

  const initializeGame = () => {
    const scrambled = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8]);
    setScrambledOrder(scrambled);
    
    const correct = new Array(8);
    scrambled.forEach((partNumber, buttonIndex) => {
      correct[partNumber - 1] = buttonIndex + 1;
    });
    setCorrectOrder(correct);
    
    // Start game timer
    setGameStartTime(Date.now());
    
    console.log('Scrambled order (button -> part):', scrambled);
    console.log('Correct answer (which buttons in order):', correct);
  };

  const featuredArtists = [
    { 
      name: "Luna Belle", 
      genre: "Indie Pop", 
      followers: "12K",
      albumTitle: "Dreaming Lights",
      coverUrl: "https://images.unsplash.com/photo-1701696934148-83396d061968?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMHBvcCUyMGFsYnVtJTIwY292ZXIlMjBtdXNpY3xlbnwxfHx8fDE3NTc2NDQxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    { 
      name: "Midnight Echo", 
      genre: "Electronic", 
      followers: "8.5K",
      albumTitle: "Neon Waves",
      coverUrl: "https://images.unsplash.com/photo-1703115015343-81b498a8c080?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBhbGJ1bSUyMGNvdmVyfGVufDF8fHx8MTc1NzU2NDAzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    { 
      name: "River Stone", 
      genre: "Folk Rock", 
      followers: "15K",
      albumTitle: "Mountain Roads",
      coverUrl: "https://images.unsplash.com/photo-1635635156175-3b10b36cd0bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb2xrJTIwcm9jayUyMGFsYnVtJTIwY292ZXIlMjB2aW55bxlbnwxfHx8fDE3NTc2NDQxNjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    { 
      name: "Miles Carter", 
      genre: "Jazz", 
      followers: "22K",
      albumTitle: "Night Sessions",
      coverUrl: "https://images.unsplash.com/photo-1652271512203-3124e8d17359?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwYWxidW0lMjBjb3ZlciUyMHZpbnRhZ2V8ZW58MXx8fHwxNzU3NjQ0NDc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const handleOnboardingComplete = () => {
    localStorage.setItem('unshuffle_onboarding_complete', 'true');
    setShowOnboarding(false);
    setShowAuth(true);
  };

  const handleAuthSuccess = (token: string) => {
    setAccessToken(token);
    setShowAuth(false);
    checkTodaySession(token);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setShowProfile(false);
    setShowAuth(true);
    resetGame();
  };

  const playSegment = (segmentIndex: number) => {
    setCurrentSegment(segmentIndex);
    setIsPlaying(true);
    setPlayingMainTrack(false);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const playMainTrack = () => {
    if (playingMainTrack) {
      setPlayingMainTrack(false);
      if (mainTrackAudioRef.current) {
        mainTrackAudioRef.current.pause();
      }
    } else {
      setPlayingMainTrack(true);
      setIsPlaying(false);
      if (mainTrackAudioRef.current) {
        mainTrackAudioRef.current.currentTime = 0;
        mainTrackAudioRef.current.play().catch(error => {
          console.log('Error playing main track:', error);
          setPlayingMainTrack(false);
        });
      }
    }
  };

  const submitGuess = async () => {
    const filledSlots = currentGuess.filter(slot => slot !== null);
    if (filledSlots.length !== 8) return;
    
    const submittedGuess = currentGuess.filter(slot => slot !== null) as number[];
    const newGuesses = [...guesses, submittedGuess];
    setGuesses(newGuesses);
    setAttempts(attempts + 1);
    
    const isCorrect = currentGuess.every((guess, index) => guess === correctOrder[index]);
    
    if (isCorrect) {
      setGameWon(true);
      setShowStats(true);
      setCurrentGuess([]);
      
      // Submit game result to server
      if (accessToken && gameStartTime) {
        const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
        await submitGameResult(true, attempts + 1, timeTaken, newGuesses);
      }
    } else if (attempts + 1 >= maxAttempts) {
      setShowStats(true);
      setCurrentGuess([]);
      
      // Submit game result to server
      if (accessToken && gameStartTime) {
        const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
        await submitGameResult(false, attempts + 1, timeTaken, newGuesses);
      }
    } else {
      const nextGuess = new Array(8).fill(null);
      currentGuess.forEach((guess, index) => {
        if (guess === correctOrder[index]) {
          nextGuess[index] = guess;
        }
      });
      setCurrentGuess(nextGuess);
    }
  };

  const submitGameResult = async (won: boolean, attempts: number, timeTaken: number, guesses: number[][]) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/submit-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ won, attempts, timeTaken, guesses }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats);
        setHasPlayedToday(true);
      }
    } catch (error) {
      console.error('Error submitting game result:', error);
    }
  };

  const removeLastNumber = () => {
    const newGuess = [...currentGuess];
    
    if (guesses.length === 0) {
      for (let i = newGuess.length - 1; i >= 0; i--) {
        if (newGuess[i] !== null) {
          newGuess[i] = null;
          break;
        }
      }
    } else {
      const lastGuess = guesses[guesses.length - 1];
      const lockedPositions = new Set<number>();
      
      lastGuess.forEach((guess, index) => {
        if (guess === correctOrder[index]) {
          lockedPositions.add(index);
        }
      });
      
      for (let i = newGuess.length - 1; i >= 0; i--) {
        if (newGuess[i] !== null && !lockedPositions.has(i)) {
          newGuess[i] = null;
          break;
        }
      }
    }
    
    setCurrentGuess(newGuess);
  };

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess([]);
    setGameWon(false);
    setAttempts(0);
    setCurrentSegment(0);
    setIsPlaying(false);
    setPlayingMainTrack(false);
    setShowStats(false);
    setHasPlayedToday(false);
    initializeGame();
  };

  // Show privacy policy
  if (showPrivacy) {
    return (
      <>
        <Privacy onBack={() => setShowPrivacy(false)} />
        <Toaster />
      </>
    );
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1c1634 0%, #15122c 100%)' }}>
          <div className="text-white">Loading...</div>
        </div>
        <Toaster />
      </>
    );
  }

  // Show onboarding
  if (showOnboarding) {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toaster />
      </>
    );
  }

  // Show auth
  if (showAuth) {
    return (
      <>
        <Auth 
          onSuccess={handleAuthSuccess}
          onPrivacyClick={() => setShowPrivacy(true)}
        />
        <Toaster />
      </>
    );
  }

  // Show game
  return (
    <>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #1c1634 0%, #15122c 100%)' }}>
      <div className="w-full max-w-md mx-auto">
        <div className="backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-slate-700/50" style={{ backgroundColor: '#261f44' }}>
          
          {/* Header with Logo and All Icons */}
          <div className="flex justify-between items-center mb-6">
            {/* Logo - Left Side */}
            <div className="flex items-center">
              <img 
                src={unshuffleLogo}
                alt="unshuffle logo"
                className="h-8 w-auto object-contain cursor-pointer hover:animate-[float_3.5s_ease-in-out_infinite] transition-all duration-300"
              />
            </div>

            {/* All Icons - Right Side */}
            <div className="flex items-center gap-2">
              {/* Stats */}
              <Button
                onClick={() => setShowStats(true)}
                variant="ghost"
                size="sm"
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>

              {/* Help/Instructions */}
              <Button
                onClick={() => setShowOnboarding(true)}
                variant="ghost"
                size="sm"
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* Leaderboard */}
              <Button
                onClick={() => setShowLeaderboard(true)}
                variant="ghost"
                size="sm"
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <TrophyIcon className="w-5 h-5" />
              </Button>

              {/* Profile */}
              <Button
                onClick={() => setShowProfile(true)}
                variant="ghost"
                size="sm"
                className="group p-2 text-white/70 hover:bg-white/10 cursor-pointer"
              >
                <User className="w-5 h-5 text-white group-hover:text-[#f16272]" />
              </Button>
            </div>
          </div>
          
          {/* Challenge of the Day */}
          <div className="text-center mb-4">
            <p className="text-[rgba(207,207,207,1)] text-sm font-medium font-[Michroma] text-[20px] font-bold">Challenge of the Day</p>
          </div>
          
          {/* Track of the Day Section */}
          <div className="mb-8">
            <div className="bg-white/5 rounded-2xl p-0 overflow-hidden">
              <div className="flex items-center gap-0">
                <div className="relative flex-shrink-0">
                  <img 
                    src={image_5f43981e82d0815da7f644095601b6886a53a5dc}
                    alt="Album Cover"
                    className="w-32 h-32 rounded-l-2xl object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0 p-4">
                  <h3 className="text-white text-sm font-medium leading-tight mb-1 truncate font-[Michroma]">
                    {attempts === 0 ? '. . . ?' : <ScrambleText text="Better Days" className="text-white text-sm font-medium leading-tight font-[Michroma]" duration={1500} scrambleSpeed={40} />}
                  </h3>
                  <p className="text-white/60 text-xs mb-1 font-[Michroma] font-bold">The Crooks</p>
                  <p className="text-white/60 text-xs font-[Myanmar_Khyay] font-bold font-normal">Single</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} style={{ color: isLiked ? '#f16272' : '' }} />
                    </Button>
                    <Button
                      onClick={playMainTrack}
                      variant="ghost"
                      size="sm"
                      disabled={!gameWon}
                      className="p-1 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white/70"
                    >
                      {playingMainTrack ? (
                        <Pause className="w-4 h-4" style={{ color: '#f16272' }} />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasPlayedToday ? (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: gameWon ? '#19a5c9' : '#f16272' }} />
              <h3 className="text-white text-xl mb-2 font-[Michroma]">
                {gameWon ? 'You won today!' : 'You played today!'}
              </h3>
              <p className="text-white/60 mb-6 font-[Myanmar_Khyay]">
                Come back tomorrow for a new challenge!
              </p>
              <Button
                onClick={() => setShowLeaderboard(true)}
                className="text-white rounded-xl hover:opacity-90 font-[Michroma] cursor-pointer"
                style={{ backgroundColor: '#19a5c9' }}
              >
                View Leaderboard
              </Button>
            </div>
          ) : (
            <>
              <GameBoard 
                guesses={guesses}
                currentGuess={currentGuess}
                maxAttempts={maxAttempts}
                correctOrder={correctOrder}
              />

              <MusicPlayer 
                segments={DAILY_SONG.segments}
                currentSegment={currentSegment}
                isPlaying={isPlaying}
                onPlaySegment={playSegment}
                attempts={attempts}
                maxAttempts={maxAttempts}
              />

              {!gameWon && attempts < maxAttempts && (
                <GuessInput 
                  currentGuess={currentGuess}
                  onGuessChange={setCurrentGuess}
                  onSubmit={submitGuess}
                  onRemoveLast={removeLastNumber}
                  segments={DAILY_SONG.segments}
                  onPlaySegment={playSegment}
                  scrambledOrder={scrambledOrder}
                />
              )}

              <div className="mt-6">
                <Button 
                  onClick={resetGame}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#15122c] hover:text-[#1c1634] backdrop-blur-sm rounded-xl text-xs font-[Myanmar_Khyay] text-[13px] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Game
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="text-white/60 text-xs font-[Myanmar_Khyay] font-bold">
                  Attempt {attempts + (currentGuess.length > 0 ? 1 : 0)} of {maxAttempts}
                </p>
              </div>
            </>
          )}

          <div className="mt-6">
            <ArtistPromotion 
              artist={DAILY_SONG.artist} 
              userScore={gameWon ? attempts : undefined}
              hasWon={gameWon}
            />
          </div>

          <div className="mt-6">
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium text-sm flex items-center gap-2 font-[Michroma]">
                  <Star className="w-4 h-4" style={{ color: '#f16272' }} />
                  Featured Artists
                </h3>
                <Dialog open={showFeaturedArtists} onOpenChange={setShowFeaturedArtists}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-white/10 text-xs p-1 rounded-lg font-[Myanmar_Khyay] cursor-pointer" style={{ color: '#19a5c9' }}>
                      View All
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800/95 backdrop-blur-sm border-slate-600 text-white max-w-sm mx-4 rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-center" style={{ color: '#19a5c9' }}>Featured Artists</DialogTitle>
                      <DialogDescription className="sr-only">Browse all featured artists</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {featuredArtists.map((artist, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <img 
                            src={artist.coverUrl} 
                            alt={`${artist.albumTitle} by ${artist.name}`}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{artist.albumTitle}</h4>
                            <p className="text-white/60 text-sm truncate">{artist.name}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: 'rgba(25, 165, 201, 0.2)', color: '#19a5c9' }}>
                              {artist.followers}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button className="w-full text-white rounded-xl hover:opacity-90 text-xs font-[Michroma] cursor-pointer" style={{ backgroundColor: '#19a5c9' }}>
                        Discover More Artists
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollPaddingLeft: '0px' }}>
                {featuredArtists.slice(0, 4).map((artist, index) => (
                  <div key={index} className={`flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${index === 0 ? 'pl-0' : ''}`}>
                    <div className="w-20 h-20 mb-2">
                      <img 
                        src={artist.coverUrl} 
                        alt={`${artist.albumTitle} by ${artist.name}`}
                        className="w-full h-full rounded-xl object-cover shadow-lg"
                      />
                    </div>
                    <div className="w-20">
                      <p className="text-white text-xs font-medium truncate leading-tight font-[Michroma]">{artist.albumTitle}</p>
                      <p className="text-white/60 truncate leading-tight mt-1 font-[Myanmar_Khyay] text-[11px]">{artist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showStats && (
          <GameStats 
            isOpen={showStats}
            onClose={() => setShowStats(false)}
            gameWon={gameWon}
            attempts={attempts}
            maxAttempts={maxAttempts}
            song={DAILY_SONG}
            guesses={guesses}
            correctOrder={correctOrder}
            currentStreak={userStats?.currentStreak}
          />
        )}

        {showProfile && (
          <Profile
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            accessToken={accessToken!}
            onLogout={handleLogout}
          />
        )}

        {showLeaderboard && (
          <Leaderboard
            isOpen={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </div>
    </>
  );
}