// Vercel Serverless Function to fetch live sports news
// Uses The Guardian API (free, production-ready)

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;

// In-memory cache (persists during function warm-up)
let newsCache = {
  data: null,
  timestamp: 0,
  CACHE_DURATION: 60 * 60 * 1000 // 1 hour in milliseconds
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check cache first
    const now = Date.now();
    if (newsCache.data && (now - newsCache.timestamp) < newsCache.CACHE_DURATION) {
      console.log('Returning cached news data');
      return res.status(200).json({
        ...newsCache.data,
        cached: true,
        cacheAge: Math.floor((now - newsCache.timestamp) / 1000 / 60) + ' minutes'
      });
    }

    // Get query parameters
    const { pageSize = 6 } = req.query;

    let newsData = null;

    // Try The Guardian API if key is configured
    if (GUARDIAN_API_KEY && GUARDIAN_API_KEY !== 'YOUR_GUARDIAN_API_KEY_HERE') {
      try {
        // The Guardian API - football section with recent articles
        const apiUrl = `https://content.guardianapis.com/search?section=football&show-fields=thumbnail,trailText,byline&page-size=${pageSize}&order-by=newest&api-key=${GUARDIAN_API_KEY}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok && data.response && data.response.results && data.response.results.length > 0) {
          newsData = {
            status: 'ok',
            totalResults: data.response.results.length,
            articles: data.response.results.map(article => ({
              title: article.webTitle,
              description: article.fields?.trailText || article.webTitle,
              url: article.webUrl,
              urlToImage: article.fields?.thumbnail || 'theme/soccer/images/img_1.jpg',
              publishedAt: article.webPublicationDate,
              source: 'The Guardian',
              author: article.fields?.byline || 'The Guardian'
            })),
            source: 'The Guardian API'
          };
          console.log('Fetched fresh football news from The Guardian');
        }
      } catch (error) {
        console.error('Guardian API error:', error.message);
      }
    }

    // Fallback to sample data if NewsAPI failed or not configured
    if (!newsData) {
      console.log('Using fallback sample news data');
      newsData = {
        status: 'ok',
        totalResults: 6,
        articles: [
          {
            title: 'Premier League: Title Race Heats Up as Season Reaches Critical Stage',
            description: 'The battle for the Premier League title intensifies with just weeks remaining. Manchester City, Arsenal, and Liverpool remain in contention.',
            url: 'https://www.bbc.com/sport/football',
            urlToImage: 'theme/soccer/images/img_1.jpg',
            publishedAt: new Date().toISOString(),
            source: 'BBC Sport',
            author: 'Sports Desk'
          },
          {
            title: 'Champions League Quarter-Finals: Dramatic Comeback Secures Semi-Final Spot',
            description: 'A stunning late goal ensures progression to the semi-finals in one of the most exciting Champions League ties of the season.',
            url: 'https://www.espn.com/soccer',
            urlToImage: 'theme/soccer/images/img_2.jpg',
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            source: 'ESPN',
            author: 'Football Correspondent'
          },
          {
            title: 'Transfer Window: Record-Breaking Deal Expected This Summer',
            description: 'Sources confirm that several top European clubs are preparing massive bids as the transfer window approaches.',
            url: 'https://www.skysports.com/football',
            urlToImage: 'theme/soccer/images/img_3.jpg',
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            source: 'Sky Sports',
            author: 'Transfer News'
          },
          {
            title: 'World Cup Qualifiers: Favorites Struggle in Surprising Upsets',
            description: 'Several top-ranked national teams face unexpected challenges in World Cup qualification matches.',
            url: 'https://www.goal.com',
            urlToImage: 'theme/soccer/images/bg_3.jpg',
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            source: 'Goal.com',
            author: 'International Football'
          },
          {
            title: 'La Liga: Barcelona and Real Madrid Set for El Clasico Showdown',
            description: 'The stage is set for one of football\'s greatest rivalries as Barcelona host Real Madrid in a crucial La Liga encounter.',
            url: 'https://www.marca.com/en',
            urlToImage: 'public/celebrations 1.webp',
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            source: 'Marca',
            author: 'La Liga Reporter'
          },
          {
            title: 'Serie A: Young Talent Shines as Underdog Team Climbs Table',
            description: 'A remarkable season continues for the surprise package of Serie A, powered by emerging young stars.',
            url: 'https://www.gazzetta.it',
            urlToImage: 'public/chelsea trophy.webp',
            publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
            source: 'La Gazzetta dello Sport',
            author: 'Serie A News'
          }
        ],
        source: 'Fallback'
      };
    }

    // Update cache
    newsCache = {
      data: newsData,
      timestamp: now
    };

    // Return fresh data
    return res.status(200).json({
      ...newsData,
      cached: false,
      cacheAge: '0 minutes'
    });

  } catch (error) {
    console.error('News API error:', error);
    
    // Return minimal fallback on complete failure
    return res.status(200).json({
      status: 'ok',
      totalResults: 3,
      articles: [
        {
          title: 'Football News Updates',
          description: 'Stay updated with the latest football news and match results.',
          url: 'https://www.bbc.com/sport/football',
          urlToImage: 'theme/soccer/images/img_1.jpg',
          publishedAt: new Date().toISOString(),
          source: 'Smart-Win'
        },
        {
          title: 'Match Predictions & Analysis',
          description: 'Expert analysis and predictions for upcoming fixtures.',
          url: 'blog.html',
          urlToImage: 'theme/soccer/images/img_2.jpg',
          publishedAt: new Date().toISOString(),
          source: 'Smart-Win'
        },
        {
          title: 'Transfer News & Rumors',
          description: 'Latest transfer news, rumors, and confirmed deals.',
          url: 'blog.html',
          urlToImage: 'theme/soccer/images/img_3.jpg',
          publishedAt: new Date().toISOString(),
          source: 'Smart-Win'
        }
      ],
      cached: false,
      error: error.message,
      source: 'Emergency Fallback'
    });
  }
}
