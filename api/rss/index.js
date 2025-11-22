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
  const feedUrl = (req.query && req.query.url) || 'https://www.franceinfo.fr/politique.rss';

  try {
    // Cache-buster pour éviter les caches
    const urlAvecCacheBuster = `${feedUrl}${feedUrl.includes('?') ? '&' : '?'}_=${new Date().getTime()}`;

    const response = await fetch(urlAvecCacheBuster, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Statut HTTP ${response.status} pour ${urlAvecCacheBuster}`);
      throw new Error(`Le serveur du flux a répondu avec le statut : ${response.status}`);
    }

    const xmlText = await response.text();
    
    if (!xmlText || xmlText.length < 100) {
      throw new Error('Réponse vide ou invalide du serveur RSS');
    }

    // Parser XML
    let items = parseXML(xmlText).slice(0, 10);
    
    if (!items || items.length === 0) {
      throw new Error('Aucun article trouvé dans le flux');
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');

    res.status(200).json(items);
  } catch (error) {
    console.error('Erreur API RSS :', error.message);
    res.status(502).json({
      error: 'Impossible de récupérer le flux RSS.',
      details: error.message,
    });
  }
};
