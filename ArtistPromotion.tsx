import { Card } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Share2 } from 'lucide-react';
import { useState } from 'react';
import { SocialShareDialog } from './SocialShareDialog';

interface ArtistPromotionProps {
  artist: string;
  userScore?: number;
  hasWon?: boolean;
}

export function ArtistPromotion({ artist, userScore, hasWon }: ArtistPromotionProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleSpotifyClick = () => {
    // Direct link to The Crooks' Spotify artist page
    window.open('https://open.spotify.com/search/The%20Crooks', '_blank');
  };

  const handleAppleMusicClick = () => {
    // Direct link to The Crooks' Apple Music artist page
    window.open('https://music.apple.com/us/search?term=The%20Crooks', '_blank');
  };

  const handleAmazonMusicClick = () => {
    // Direct link to The Crooks' Amazon Music artist page
    window.open('https://music.amazon.com/search/The%20Crooks', '_blank');
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  return (
    <>
      <Card className="bg-slate-700/30 backdrop-blur-sm border-slate-600/30">
        <div className="p-4">
          {/* Artist Info */}
          <div className="text-center mb-4">
            <h4 className="text-white font-medium mb-1 font-[Michroma]">Discover {artist}</h4>
            <p className="text-xs" style={{ color: '#19a5c9', fontFamily: 'Myanmar Khyay' }}>Stream this track on your favorite platform</p>
          </div>

          {/* Streaming Platform Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleSpotifyClick}
              variant="outline"
              className="border-white/20 text-white rounded-xl font-[Myanmar_Khyay] flex items-center justify-center hover:bg-white/20 hover:border-[#15122c] hover:text-[#615d7a] cursor-pointer"
              style={{ fontSize: '12px', backgroundColor: '#261f44' }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Spotify
            </Button>
            
            <Button 
              onClick={handleAppleMusicClick}
              variant="outline"
              className="border-white/20 text-white rounded-xl font-[Myanmar_Khyay] flex items-center justify-center hover:bg-white/20 hover:border-[#15122c] hover:text-[#615d7a] cursor-pointer"
              style={{ fontSize: '12px', backgroundColor: '#261f44' }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Apple Music
            </Button>

            <Button 
              onClick={handleAmazonMusicClick}
              variant="outline"
              className="border-white/20 text-white rounded-xl font-[Myanmar_Khyay] flex items-center justify-center hover:bg-white/20 hover:border-[#15122c] hover:text-[#615d7a] cursor-pointer"
              style={{ fontSize: '12px', backgroundColor: '#261f44' }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Amazon Music
            </Button>

            {/* Share Button */}
            <Button 
              onClick={handleShare}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#15122c] hover:text-[#1c1634] backdrop-blur-sm rounded-xl font-[Myanmar_Khyay] cursor-pointer"
              style={{ fontSize: '12px' }}
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share Challenge
            </Button>
          </div>
        </div>
      </Card>

      <SocialShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        artist={artist}
        userScore={userScore}
        hasWon={hasWon}
      />
    </>
  );
}