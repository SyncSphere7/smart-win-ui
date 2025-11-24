// Vercel Serverless Function to fetch live sports news
// Uses NewsAPI.org (requires free API key)

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { category = 'sports', country = 'us', pageSize = 10 } = req.query;

    // If NEWS_API_KEY is not configured, return sample data
    if (!NEWS_API_KEY) {
      console.warn('NEWS_API_KEY not configured, returning sample data');
      return res.status(200).json({
        status: 'ok',
        totalResults: 3,
        articles: [
          {
            title: 'Configure NEWS_API_KEY for live updates',
            description: 'Add your NewsAPI.org API key to Vercel environment variables to get real-time sports news.',
            url: 'https://newsapi.org',
            urlToImage: 'public/trophy.jpeg',
            publishedAt: new Date().toISOString(),
            source: { name: 'Configuration Required' }
          }
        ]
      });
    }

    // Fetch news from NewsAPI
    const apiUrl = `https://newsapi.org/v2/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Filter and format articles
    const formattedArticles = data.articles
      .filter(article => article.title && article.description)
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage || 'public/trophy.jpeg',
        publishedAt: article.publishedAt,
        source: article.source.name,
        author: article.author
      }));

    // Return formatted response
    return res.status(200).json({
      status: 'ok',
      totalResults: formattedArticles.length,
      articles: formattedArticles,
      cached: false
    });

  } catch (error) {
    console.error('News API error:', error);
    
    // Return fallback sample news on error
    return res.status(200).json({
      status: 'ok',
      totalResults: 3,
      articles: [
        {
          title: 'Premier League: Manchester City extends winning streak',
          description: 'Manchester City continued their dominant form with a 3-1 victory, maintaining their position at the top of the league.',
          url: '#',
          urlToImage: 'theme/soccer/images/img_1.jpg',
          publishedAt: new Date().toISOString(),
          source: { name: 'Sports News' }
        },
        {
          title: 'Champions League: Dramatic late winner decides quarter-final',
          description: 'A last-minute goal secured a thrilling victory in the Champions League quarter-final match.',
          url: '#',
          urlToImage: 'theme/soccer/images/img_2.jpg',
          publishedAt: new Date().toISOString(),
          source: { name: 'Sports News' }
        },
        {
          title: 'Transfer News: Big money move confirmed',
          description: 'A record-breaking transfer deal has been confirmed as the winter transfer window heats up.',
          url: '#',
          urlToImage: 'theme/soccer/images/img_3.jpg',
          publishedAt: new Date().toISOString(),
          source: { name: 'Sports News' }
        }
      ],
      cached: true,
      error: error.message
    });
  }
}
