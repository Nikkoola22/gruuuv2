// Fonction serverless Vercel pour le flux RSS
// Parse XML simplifiée sans dépendances externes

function parseXML(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    const extractTag = (tag) => {
      const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`);
      const m = regex.exec(itemXml);
      return m ? m[1].replace(/<[^>]*>/g, '').trim() : '';
    };

    items.push({
      title: extractTag('title') || 'Sans titre',
      link: extractTag('link') || '#',
      pubDate: extractTag('pubDate') || new Date().toISOString(),
      description: extractTag('description') || '',
      guid: extractTag('guid') || extractTag('link'),
    });
  }

  return items;
}

module.exports = async (req, res) => {
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

  // Récupère l'URL du flux depuis les query params ou utilise l'URL par défaut
  const feedUrl = req.query.url || 'https://www.franceinfo.fr/politique.rss';

  try {
    // Cache-buster pour éviter les caches
    const urlAvecCacheBuster = `${feedUrl}?_=${new Date().getTime()}`;

    const response = await fetch(urlAvecCacheBuster, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Le serveur du flux a répondu avec le statut : ${response.status}`);
    }

    const xmlText = await response.text();

    // Parser XML
    let items = parseXML(xmlText).slice(0, 10);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json(items);
  } catch (error) {
    console.error('Erreur API RSS :', error);
    res.status(502).json({
      error: 'Impossible de récupérer le flux RSS.',
      details: error.message,
    });
  }
};
