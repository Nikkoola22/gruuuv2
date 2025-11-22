const https = require('https');

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Test simple - répondre avec un tableau vide d'abord
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json([
      { title: 'RSS test - loading...', link: '#' }
    ]);

  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.status(502).json({ error: error.message });
  }
};
