import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client for auth
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Middleware to verify user authentication
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.log('Authentication error:', error);
    return null;
  }
  
  return user;
};

// Health check endpoint
app.get("/make-server-6f14d64d/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-6f14d64d/signup", async (c) => {
  try {
    const { email, password, username } = await c.req.json();
    
    if (!email || !password || !username) {
      return c.json({ error: 'Email, password, and username are required' }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Create user profile in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      username,
      email,
      createdAt: new Date().toISOString(),
    });
    
    // Initialize user stats
    await kv.set(`user_stats:${userId}`, {
      totalGames: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageAttempts: 0,
    });
    
    return c.json({ 
      success: true, 
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to sign up user' }, 500);
  }
});

// Get user profile
app.get("/make-server-6f14d64d/profile", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const profile = await kv.get(`user:${user.id}`);
    const stats = await kv.get(`user_stats:${user.id}`);
    
    return c.json({ profile, stats });
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Get today's daily song
app.get("/make-server-6f14d64d/daily-song", async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let dailySong = await kv.get(`daily_song:${today}`);
    
    // If no song for today, create one (in production, this would be managed separately)
    if (!dailySong) {
      dailySong = {
        date: today,
        title: "Better Days",
        artist: "The Crooks",
        album: "Summer Vibes",
        audioUrl: "https://raw.githubusercontent.com/kkolster/unshuffle/1f3bcc5dccb320d9d0b32fa3d7ec28c4bd214407/The%20Crooks%20-%20Better%20Days.mp3",
        parts: [
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part1.mp3',
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part2.mp3',
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part3.mp3',
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part4.mp3',
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part5.mp3',
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part6.mp3',
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part7.mp3',
          'https://raw.githubusercontent.com/kkolster/unshuffle/ede0fc7bb6d63e88915c2fe7d675f03764113972/Part8.mp3',
        ],
        coverUrl: "https://images.unsplash.com/photo-1632667113863-24e85951b9d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGJ1bSUyMGNvdmVyJTIwbXVzaWMlMjBhcnR8ZW58MXx8fHwxNzU3NjIyNzM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      };
      await kv.set(`daily_song:${today}`, dailySong);
    }
    
    return c.json(dailySong);
  } catch (error) {
    console.log('Error fetching daily song:', error);
    return c.json({ error: 'Failed to fetch daily song' }, 500);
  }
});

// Check if user has already played today
app.get("/make-server-6f14d64d/today-session", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const session = await kv.get(`game_session:${user.id}:${today}`);
    
    return c.json({ session, hasPlayed: !!session });
  } catch (error) {
    console.log('Error checking today session:', error);
    return c.json({ error: 'Failed to check session' }, 500);
  }
});

// Submit game result
app.post("/make-server-6f14d64d/submit-game", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { won, attempts, timeTaken, guesses } = await c.req.json();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already played today
    const existingSession = await kv.get(`game_session:${user.id}:${today}`);
    if (existingSession) {
      return c.json({ error: 'You have already played today' }, 400);
    }
    
    // Save game session
    const session = {
      userId: user.id,
      date: today,
      won,
      attempts,
      timeTaken,
      guesses,
      completedAt: new Date().toISOString(),
    };
    await kv.set(`game_session:${user.id}:${today}`, session);
    
    // Update user stats
    const stats = await kv.get(`user_stats:${user.id}`) || {
      totalGames: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageAttempts: 0,
    };
    
    stats.totalGames += 1;
    if (won) {
      stats.wins += 1;
      stats.currentStreak += 1;
      stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    } else {
      stats.losses += 1;
      stats.currentStreak = 0;
    }
    
    // Calculate average attempts
    stats.averageAttempts = ((stats.averageAttempts * (stats.totalGames - 1)) + attempts) / stats.totalGames;
    
    await kv.set(`user_stats:${user.id}`, stats);
    
    // Update leaderboard
    await updateLeaderboard(user.id, stats);
    
    return c.json({ success: true, stats });
  } catch (error) {
    console.log('Error submitting game:', error);
    return c.json({ error: 'Failed to submit game' }, 500);
  }
});

// Get leaderboard
app.get("/make-server-6f14d64d/leaderboard", async (c) => {
  try {
    const leaderboard = await kv.get('leaderboard:global') || [];
    
    // Get user profiles for leaderboard entries
    const leaderboardWithProfiles = await Promise.all(
      leaderboard.slice(0, 100).map(async (entry: any) => {
        const profile = await kv.get(`user:${entry.userId}`);
        return {
          ...entry,
          username: profile?.username || 'Anonymous',
        };
      })
    );
    
    return c.json(leaderboardWithProfiles);
  } catch (error) {
    console.log('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Like/unlike a song
app.post("/make-server-6f14d64d/like-song", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { songId, liked } = await c.req.json();
    const likedSongs = await kv.get(`liked_songs:${user.id}`) || [];
    
    if (liked) {
      if (!likedSongs.includes(songId)) {
        likedSongs.push(songId);
      }
    } else {
      const index = likedSongs.indexOf(songId);
      if (index > -1) {
        likedSongs.splice(index, 1);
      }
    }
    
    await kv.set(`liked_songs:${user.id}`, likedSongs);
    
    return c.json({ success: true, likedSongs });
  } catch (error) {
    console.log('Error updating liked songs:', error);
    return c.json({ error: 'Failed to update liked songs' }, 500);
  }
});

// Get user's liked songs
app.get("/make-server-6f14d64d/liked-songs", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const likedSongs = await kv.get(`liked_songs:${user.id}`) || [];
    return c.json(likedSongs);
  } catch (error) {
    console.log('Error fetching liked songs:', error);
    return c.json({ error: 'Failed to fetch liked songs' }, 500);
  }
});

// Helper function to update leaderboard
async function updateLeaderboard(userId: string, stats: any) {
  let leaderboard = await kv.get('leaderboard:global') || [];
  
  // Remove existing entry for this user
  leaderboard = leaderboard.filter((entry: any) => entry.userId !== userId);
  
  // Add updated entry
  leaderboard.push({
    userId,
    wins: stats.wins,
    bestStreak: stats.bestStreak,
    averageAttempts: stats.averageAttempts,
  });
  
  // Sort by wins (descending), then by best streak, then by average attempts (ascending)
  leaderboard.sort((a: any, b: any) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
    return a.averageAttempts - b.averageAttempts;
  });
  
  await kv.set('leaderboard:global', leaderboard);
}

// Social Media Integration Routes

// Get connected social accounts
app.get("/make-server-6f14d64d/social/connected", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const socialAccounts = await kv.get(`social_accounts:${user.id}`) || {};
    
    const accounts = [
      { platform: 'twitter', connected: !!socialAccounts.twitter, username: socialAccounts.twitter?.username },
      { platform: 'threads', connected: !!socialAccounts.threads, username: socialAccounts.threads?.username },
      { platform: 'facebook', connected: !!socialAccounts.facebook, username: socialAccounts.facebook?.username },
      { platform: 'discord', connected: !!socialAccounts.discord, username: socialAccounts.discord?.username },
      { platform: 'twitch', connected: !!socialAccounts.twitch, username: socialAccounts.twitch?.username },
    ];
    
    return c.json({ accounts });
  } catch (error) {
    console.log('Error fetching connected accounts:', error);
    return c.json({ error: 'Failed to fetch connected accounts' }, 500);
  }
});

// Initiate OAuth connection for a platform
app.get("/make-server-6f14d64d/social/connect/:platform", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const platform = c.req.param('platform');
  const baseUrl = c.req.header('origin') || 'http://localhost:3000';
  const callbackUrl = `${baseUrl}/social/callback/${platform}`;
  
  try {
    let authUrl = '';
    
    switch (platform) {
      case 'twitter':
        // Twitter OAuth 2.0 (requires API keys)
        const twitterClientId = Deno.env.get('TWITTER_CLIENT_ID');
        if (!twitterClientId) {
          return c.json({ error: 'Twitter API not configured' }, 500);
        }
        const twitterState = crypto.randomUUID();
        await kv.set(`oauth_state:${user.id}:twitter`, twitterState);
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterClientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=tweet.read%20tweet.write%20users.read&state=${twitterState}`;
        break;
        
      case 'threads':
        // Threads API (Meta)
        const threadsClientId = Deno.env.get('THREADS_CLIENT_ID');
        if (!threadsClientId) {
          return c.json({ error: 'Threads API not configured' }, 500);
        }
        const threadsState = crypto.randomUUID();
        await kv.set(`oauth_state:${user.id}:threads`, threadsState);
        authUrl = `https://threads.net/oauth/authorize?client_id=${threadsClientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=threads_basic,threads_content_publish&response_type=code&state=${threadsState}`;
        break;
        
      case 'facebook':
        // Facebook OAuth
        const facebookClientId = Deno.env.get('FACEBOOK_CLIENT_ID');
        if (!facebookClientId) {
          return c.json({ error: 'Facebook API not configured' }, 500);
        }
        const fbState = crypto.randomUUID();
        await kv.set(`oauth_state:${user.id}:facebook`, fbState);
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookClientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=publish_to_groups,pages_manage_posts&state=${fbState}`;
        break;
        
      case 'discord':
        // Discord OAuth
        const discordClientId = Deno.env.get('DISCORD_CLIENT_ID');
        if (!discordClientId) {
          return c.json({ error: 'Discord API not configured' }, 500);
        }
        const discordState = crypto.randomUUID();
        await kv.set(`oauth_state:${user.id}:discord`, discordState);
        authUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=identify%20webhook.incoming&state=${discordState}`;
        break;
        
      case 'twitch':
        // Twitch OAuth
        const twitchClientId = Deno.env.get('TWITCH_CLIENT_ID');
        if (!twitchClientId) {
          return c.json({ error: 'Twitch API not configured' }, 500);
        }
        const twitchState = crypto.randomUUID();
        await kv.set(`oauth_state:${user.id}:twitch`, twitchState);
        authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=user:read:email&state=${twitchState}`;
        break;
        
      default:
        return c.json({ error: 'Invalid platform' }, 400);
    }
    
    return c.json({ authUrl });
  } catch (error) {
    console.log(`Error initiating ${platform} connection:`, error);
    return c.json({ error: 'Failed to initiate connection' }, 500);
  }
});

// OAuth callback handler (would be called by the OAuth provider)
app.get("/make-server-6f14d64d/social/callback/:platform", async (c) => {
  const platform = c.req.param('platform');
  const code = c.req.query('code');
  const state = c.req.query('state');
  
  if (!code || !state) {
    return c.json({ error: 'Missing OAuth parameters' }, 400);
  }
  
  // In a real implementation, you would:
  // 1. Verify the state parameter
  // 2. Exchange the code for an access token
  // 3. Store the access token securely
  // 4. Fetch user info from the platform
  
  return c.html(`
    <html>
      <body>
        <script>
          window.opener.postMessage({ platform: '${platform}', success: true }, '*');
          window.close();
        </script>
        <p>Authorization successful! You can close this window.</p>
      </body>
    </html>
  `);
});

// Share to a platform
app.post("/make-server-6f14d64d/social/share/:platform", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const platform = c.req.param('platform');
  const { message } = await c.req.json();
  
  if (!message) {
    return c.json({ error: 'Message is required' }, 400);
  }
  
  try {
    const socialAccounts = await kv.get(`social_accounts:${user.id}`) || {};
    const account = socialAccounts[platform];
    
    if (!account || !account.accessToken) {
      return c.json({ error: 'Account not connected' }, 400);
    }
    
    // Post to the platform using their API
    let response;
    
    switch (platform) {
      case 'twitter':
        response = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: message }),
        });
        break;
        
      case 'threads':
        // Threads API posting
        response = await fetch(`https://graph.threads.net/v1.0/me/threads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: message }),
        });
        break;
        
      case 'facebook':
        response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });
        break;
        
      case 'discord':
        // For Discord, we'd post to a webhook
        if (account.webhookUrl) {
          response = await fetch(account.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message }),
          });
        }
        break;
        
      case 'twitch':
        // Twitch doesn't have direct posting API, but you could use chat or other methods
        return c.json({ error: 'Twitch posting not implemented' }, 501);
        
      default:
        return c.json({ error: 'Invalid platform' }, 400);
    }
    
    if (response && response.ok) {
      return c.json({ success: true });
    } else {
      const errorText = response ? await response.text() : 'Unknown error';
      console.log(`Error posting to ${platform}:`, errorText);
      return c.json({ error: 'Failed to post' }, 500);
    }
  } catch (error) {
    console.log(`Error sharing to ${platform}:`, error);
    return c.json({ error: 'Failed to share' }, 500);
  }
});

// Disconnect a social account
app.delete("/make-server-6f14d64d/social/disconnect/:platform", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const platform = c.req.param('platform');
  
  try {
    const socialAccounts = await kv.get(`social_accounts:${user.id}`) || {};
    delete socialAccounts[platform];
    await kv.set(`social_accounts:${user.id}`, socialAccounts);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error disconnecting ${platform}:`, error);
    return c.json({ error: 'Failed to disconnect account' }, 500);
  }
});

Deno.serve(app.fetch);