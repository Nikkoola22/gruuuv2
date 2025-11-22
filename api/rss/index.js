module.exports = async (req, res) => {
  try {
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Gestion OPTIONS
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Récupère l'URL du flux ou utilise l'URL par défaut
    const feedUrl = 'https://www.franceinfo.fr/politique.rss';

    // Fetch le RSS avec cache-buster
    const timestamp = Date.now();
    const response = await fetch(`${feedUrl}?_=${timestamp}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();

    if (!xmlText || xmlText.length < 100) {
      throw new Error('Empty response');
    }

    // Parser XML simple
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
      const itemXml = match[1];

      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
        const m = regex.exec(itemXml);
        if (m && m[1]) {
          return m[1].replace(/<[^>]*>/g, '').trim();
        }
        return '';
      };

      const title = getTag('title');
      const link = getTag('link');

      if (title && link) {
        items.push({
          title: title,
          link: link,
          description: getTag('description'),
          pubDate: getTag('pubDate'),
          guid: getTag('guid') || link,
        });
        count++;
      }
    }

    if (items.length === 0) {
      throw new Error('No items found in RSS');
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(items);

  } catch (error) {
    console.error('RSS API Error:', error.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(502).json({
      error: 'Failed to fetch RSS',
      details: error.message,
    });
  }
};
