// Vercel Serverless Function to fetch live football videos from YouTube
// Uses YouTube Data API v3 (free, 10,000 requests/day)

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper function to get ISO date for recent videos (last 7 days)
function getRecentDateISO() {
  const date = new Date();
  date.setDate(date.getDate() - 7); // 7 days ago
  return date.toISOString();
}

// In-memory cache (persists during function warm-up)
let videosCache = {
  data: null,
  timestamp: 0,
  CACHE_DURATION: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check cache first
    const now = Date.now();
    if (videosCache.data && (now - videosCache.timestamp) < videosCache.CACHE_DURATION) {
      console.log('Returning cached video data');
      return res.status(200).json({
        ...videosCache.data,
        cached: true,
        cacheAge: Math.floor((now - videosCache.timestamp) / 1000 / 60) + ' minutes'
      });
    }

    // Get query parameters
    const { maxResults = 8 } = req.query;

    let videosData = null;

    // Try YouTube API if key is configured
    if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE') {
      try {
        // Search for EXCITING trending football content: goals, celebrations, skills, saves, penalties
        // Optimized for viral, high-engagement videos that users love to watch
        const searchQuery = '(football OR soccer) (amazing goals OR celebrations OR incredible saves OR best skills OR penalty shootout OR match highlights)';
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoEmbeddable=true&maxResults=${maxResults}&order=viewCount&relevanceLanguage=en&videoDuration=medium&publishedAfter=${getRecentDateISO()}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok && data.items && data.items.length > 0) {
          videosData = {
            status: 'ok',
            totalResults: data.items.length,
            videos: data.items.map(video => ({
              id: video.id.videoId,
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
              channelTitle: video.snippet.channelTitle,
              publishedAt: video.snippet.publishedAt,
              url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
              embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`
            })),
            source: 'YouTube Data API'
          };

          // Cache the results
          videosCache.data = videosData;
          videosCache.timestamp = now;
          
          console.log('Fetched fresh football videos from YouTube');
        } else if (data.error) {
          console.error('YouTube API error:', data.error.message);
        }
      } catch (error) {
        console.error('YouTube API fetch error:', error.message);
      }
    }

    // Fallback data if API fails or no key configured
    if (!videosData) {
      console.log('Using fallback video data');
      videosData = {
        status: 'ok',
        totalResults: 6,
        videos: [
          {
            id: 'fallback1',
            title: 'Premier League Highlights - Best Goals This Week',
            description: 'Watch the most spectacular goals from this week\'s Premier League matches.',
            thumbnail: 'theme/soccer/images/img_1.jpg',
            channelTitle: 'Football Highlights',
            publishedAt: new Date().toISOString(),
            url: '#',
            embedUrl: '#'
          },
          {
            id: 'fallback2',
            title: 'Champions League - Top Moments',
            description: 'Relive the best moments from the latest Champions League fixtures.',
            thumbnail: 'theme/soccer/images/img_2.jpg',
            channelTitle: 'UEFA Champions League',
            publishedAt: new Date().toISOString(),
            url: '#',
            embedUrl: '#'
          },
          {
            id: 'fallback3',
            title: 'Match Analysis - Tactical Breakdown',
            description: 'Expert analysis of the weekend\'s biggest matches and key tactical decisions.',
            thumbnail: 'theme/soccer/images/img_3.jpg',
            channelTitle: 'Football Tactics',
            publishedAt: new Date().toISOString(),
            url: '#',
            embedUrl: '#'
          },
          {
            id: 'fallback4',
            title: 'Football Skills & Tricks Compilation',
            description: 'Amazing skills, tricks, and dribbles from the world\'s best players.',
            thumbnail: 'theme/soccer/images/img_1.jpg',
            channelTitle: 'Skills TV',
            publishedAt: new Date().toISOString(),
            url: '#',
            embedUrl: '#'
          },
          {
            id: 'fallback5',
            title: 'La Liga - Week Review',
            description: 'All the action from Spain\'s top division in one comprehensive review.',
            thumbnail: 'theme/soccer/images/img_2.jpg',
            channelTitle: 'LaLiga Official',
            publishedAt: new Date().toISOString(),
            url: '#',
            embedUrl: '#'
          },
          {
            id: 'fallback6',
            title: 'Transfer News & Rumors',
            description: 'Latest transfer news, rumors, and confirmed deals from around Europe.',
            thumbnail: 'theme/soccer/images/img_3.jpg',
            channelTitle: 'Transfer Talk',
            publishedAt: new Date().toISOString(),
            url: '#',
            embedUrl: '#'
          }
        ],
        source: 'Fallback Data'
      };
    }

    // Set cache headers for client-side caching (30 minutes)
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

    return res.status(200).json(videosData);

  } catch (error) {
    console.error('Error in youtube-videos function:', error);
    
    // Return fallback data on error
    return res.status(200).json({
      status: 'ok',
      totalResults: 6,
      videos: [
        {
          id: 'error1',
          title: 'Football Highlights Coming Soon',
          description: 'Live football video content will be available shortly.',
          thumbnail: 'theme/soccer/images/img_1.jpg',
          channelTitle: 'Smart-Win',
          publishedAt: new Date().toISOString(),
          url: '#',
          embedUrl: '#'
        }
      ],
      source: 'Error Fallback',
      error: error.message
    });
  }
}
