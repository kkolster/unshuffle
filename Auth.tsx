import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Music, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useState } from 'react';
import { motion } from 'motion/react';
import logo from 'figma:asset/15f22610a9b8fe2b582dce5af8f1c63a73f02093.png';

// Custom Google icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface AuthProps {
  onSuccess: (accessToken: string) => void;
  onPrivacyClick?: () => void;
}

export function Auth({ onSuccess, onPrivacyClick }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Starting sign up process for:', email);

    try {
      // Call server to create user
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Sign up failed:', data.error);
        throw new Error(data.error || 'Failed to sign up');
      }

      console.log('✅ User created successfully, now signing in...');

      // Now sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Sign in after signup failed:', signInError);
        throw signInError;
      }

      if (signInData.session?.access_token) {
        console.log('✅ Authentication successful!');
        onSuccess(signInData.session.access_token);
      }
    } catch (err: any) {
      console.error('❌ Sign up error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Starting sign in process for:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in failed:', error);
        throw error;
      }

      if (data.session?.access_token) {
        console.log('✅ Sign in successful!');
        onSuccess(data.session.access_token);
      }
    } catch (err: any) {
      console.error('❌ Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    console.log('🔐 Starting Google sign in process');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        console.error('❌ Google sign in failed:', error);
        throw error;
      }

      // OAuth will redirect, so we don't need to call onSuccess here
      console.log('✅ Redirecting to Google for authentication...');
    } catch (err: any) {
      console.error('❌ Google sign in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #1c1634 0%, #15122c 100%)' }}>
      <div className="w-full max-w-md mx-auto">
        <Card className="backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-700/50" style={{ backgroundColor: '#261f44' }}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <motion.img
              src={logo}
              alt="unshuffle logo"
              className="w-24 h-24 rounded-2xl"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            <div className="space-y-4 mb-6">
              {isSignUp && (
                <div>
                  <Label htmlFor="username" className="text-white/80 font-[Myanmar_Khyay]">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#19a5c9] mt-2"
                    placeholder="Choose a username"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-white/80 font-[Myanmar_Khyay]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#19a5c9] mt-2"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white/80 font-[Myanmar_Khyay]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#19a5c9] mt-2"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                <p className="text-red-300 text-sm font-[Myanmar_Khyay]">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white rounded-xl hover:opacity-90 font-[Michroma] cursor-pointer mb-4"
              style={{ backgroundColor: '#19a5c9' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </Button>

            {/* OR Separator */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-white/60 font-[Myanmar_Khyay]" style={{ backgroundColor: '#261f44' }}>OR</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white text-gray-700 rounded-xl hover:bg-gray-100 font-[Myanmar_Khyay] cursor-pointer mb-4 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="w-full text-white/70 hover:text-white hover:bg-white/10 font-[Myanmar_Khyay] cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </form>

          {/* Privacy Policy Link */}
          {onPrivacyClick && (
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/privacy');
                  onPrivacyClick();
                }}
                className="text-white/60 hover:text-[#19a5c9] text-sm font-[Myanmar_Khyay] underline cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          )}
        </Card>

        {/* Temporary test button */}
        <Button
          onClick={() => onSuccess('test-token-rob-3k')}
          className="w-full mt-4 text-white border-2 rounded-xl font-[Myanmar_Khyay] cursor-pointer"
          style={{ 
            backgroundColor: 'transparent',
            borderColor: '#19a5c9',
            color: '#19a5c9'
          }}
        >
          entry rob and 3k
        </Button>
      </div>
    </div>
  );
}
