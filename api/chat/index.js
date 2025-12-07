// API serverless pour proxy Perplexity (évite les erreurs CORS)

module.exports = async (req, res) => {
  // Gérer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.PERPLEXITY_API_KEY;
  
  if (!API_KEY) {
    console.error('PERPLEXITY_API_KEY non définie');
    return res.status(500).json({ error: 'Configuration serveur manquante' });
  }

  try {
    const { model, messages } = req.body;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'sonar-pro',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Perplexity:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Erreur API Perplexity (${response.status})`,
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erreur proxy chat:', error);
    return res.status(500).json({ error: error.message });
  }
};
