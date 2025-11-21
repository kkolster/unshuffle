import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Facebook, MessageCircle, ExternalLink, CheckCircle2, Link2 } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';

interface SocialShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: string;
  userScore?: number;
  hasWon?: boolean;
}

interface ConnectedAccount {
  platform: string;
  connected: boolean;
  username?: string;
}

// Custom icons for platforms not in lucide-react
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 192 192" fill="currentColor" className="w-4 h-4">
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6866C105.707 61.7401 111.932 64.1393 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
  </svg>
);

const TwitchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

export function SocialShareDialog({ open, onOpenChange, artist, userScore, hasWon }: SocialShareDialogProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    { platform: 'twitter', connected: false },
    { platform: 'threads', connected: false },
    { platform: 'facebook', connected: false },
    { platform: 'discord', connected: false },
    { platform: 'twitch', connected: false },
  ]);
  const [loading, setLoading] = useState<string | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (open) {
      checkConnectedAccounts();
    }
  }, [open]);

  const checkConnectedAccounts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/social/connected`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(data.accounts || connectedAccounts);
      }
    } catch (error) {
      console.error('Error checking connected accounts:', error);
    }
  };

  const generateShareMessage = () => {
    const baseUrl = window.location.origin;
    const emoji = hasWon ? '🎵✅' : '🎵🎮';
    
    if (hasWon && userScore !== undefined) {
      return `${emoji} I just solved today's unshuffle in ${userScore} ${userScore === 1 ? 'try' : 'tries'}! 🎧\n\nFeaturing: ${artist}\n\nCan you beat my score? Play now: ${baseUrl}\n\n#unshuffle #musicgame`;
    }
    
    return `${emoji} I'm playing today's unshuffle!\n\nFeaturing: ${artist}\n\nCan you solve it? Play now: ${baseUrl}\n\n#unshuffle #musicgame`;
  };

  const handleConnect = async (platform: string) => {
    setLoading(platform);
    setShowConnectDialog(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to connect social accounts');
        setLoading(null);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/social/connect/${platform}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Open OAuth window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const authWindow = window.open(
          data.authUrl,
          'Social Auth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for completion
        const checkInterval = setInterval(async () => {
          try {
            if (authWindow?.closed) {
              clearInterval(checkInterval);
              setLoading(null);
              await checkConnectedAccounts();
            }
          } catch (e) {
            // Ignore cross-origin errors
          }
        }, 500);
      } else {
        alert('Failed to initiate connection');
        setLoading(null);
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      alert('Failed to connect account');
      setLoading(null);
    }
  };

  const handleShare = async (platform: string) => {
    setLoading(platform);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to share');
        setLoading(null);
        return;
      }

      const message = generateShareMessage();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/social/share/${platform}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        }
      );

      if (response.ok) {
        alert('Shared successfully! 🎉');
        onOpenChange(false);
      } else {
        const error = await response.text();
        alert(`Failed to share: ${error}`);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share');
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Disconnect ${platform}?`)) return;
    
    setLoading(platform);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f14d64d/social/disconnect/${platform}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        await checkConnectedAccounts();
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
    } finally {
      setLoading(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <XIcon />;
      case 'threads':
        return <ThreadsIcon />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'discord':
        return <DiscordIcon />;
      case 'twitch':
        return <TwitchIcon />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const handleIconClick = (account: ConnectedAccount) => {
    if (account.connected) {
      handleShare(account.platform);
    } else {
      setSelectedPlatform(account.platform);
      setShowConnectDialog(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="border-slate-600/30 text-white max-w-sm mx-4 rounded-2xl backdrop-blur-[50px]"
          style={{ backgroundColor: 'rgba(21, 18, 44, 0.4)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-[Michroma]" style={{ color: '#19a5c9' }}>
              Share Your Results
            </DialogTitle>
            <DialogDescription className="sr-only">
              Share your Unshuffle results on social media or copy to clipboard
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 mt-4">
            {connectedAccounts.map((account) => {
              const [isHovered, setIsHovered] = useState(false);
              
              return (
                <div
                  key={account.platform}
                  className="relative flex items-center justify-center p-3 border border-slate-600/30 rounded-xl transition-all hover:bg-white/5 cursor-pointer backdrop-blur-[50px]"
                  style={{ 
                    backgroundColor: 'rgba(21, 18, 44, 0.4)',
                    borderColor: account.connected ? '#05DF72' : undefined
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => handleIconClick(account)}
                >
                  <div style={{ color: isHovered ? '#f16272' : (account.connected ? '#05DF72' : '#19a5c9'), transition: 'color 0.2s ease' }}>
                    {getPlatformIcon(account.platform)}
                  </div>
                  {account.connected && (
                    <div className="w-1.5 h-1.5 rounded-full absolute -top-0.5 -right-0.5" style={{ backgroundColor: '#05DF72' }} />
                  )}
                  {loading === account.platform && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 border border-slate-600/30 rounded-xl backdrop-blur-[50px]" style={{ backgroundColor: 'rgba(21, 18, 44, 0.4)' }}>
            <p className="text-xs text-white/60 mb-2 font-[Myanmar_Khyay]">Preview message:</p>
            <p className="text-sm text-white whitespace-pre-line font-[Myanmar_Khyay]">{generateShareMessage()}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connect Account Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent 
          className="border-slate-600/30 text-white max-w-sm mx-4 rounded-2xl backdrop-blur-[50px]"
          style={{ backgroundColor: 'rgba(21, 18, 44, 0.4)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-[Michroma]" style={{ color: '#19a5c9' }}>
              Connect {selectedPlatform && getPlatformName(selectedPlatform)}
            </DialogTitle>
            <DialogDescription className="text-center text-white/60 text-sm font-[Myanmar_Khyay]">
              Link your social account to share your results
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}