const https = require('https');

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const xmlText = await new Promise((resolve, reject) => {
      https.get('https://www.franceinfo.fr/politique.rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      }).on('error', reject);
    });

    if (!xmlText || xmlText.length < 100) {
      throw new Error('Empty response');
    }

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match, count = 0;

    while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
      const itemXml = match[1];
      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, 's');
        const m = regex.exec(itemXml);
        return m && m[1] ? m[1].replace(/<[^>]*>/g, '').trim() : '';
      };

      const title = getTag('title');
      const link = getTag('link');

      if (title && link) {
        items.push({ title, link, description: getTag('description'), pubDate: getTag('pubDate') });
        count++;
      }
    }

    if (items.length === 0) throw new Error('No items');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(items);

  } catch (error) {
    console.error('[RSS]', error.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(502).json({ error: error.message });
  }
};
