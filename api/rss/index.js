import https from 'https';

export default function handler(req, res) {
  https.get('https://www.franceinfo.fr/politique.rss', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  }, (response) => {
    if (response.statusCode !== 200) {
      res.status(502).json({ error: `HTTP ${response.statusCode}` });
      return;
    }

    let xmlText = '';
    response.on('data', chunk => xmlText += chunk);
    response.on('end', () => {
      try {
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
        res.status(502).json({ error: error.message });
      }
    });
  }).on('error', (error) => {
    res.status(502).json({ error: error.message });
  });
}
