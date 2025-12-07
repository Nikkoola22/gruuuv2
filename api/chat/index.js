// API serverless pour proxy Perplexity (évite les erreurs CORS)
import https from 'https';

export default async function handler(req, res) {
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
    
    const postData = JSON.stringify({
      model: model || 'sonar-pro',
      messages: messages,
    });

    const options = {
      hostname: 'api.perplexity.ai',
      port: 443,
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    return new Promise((resolve) => {
      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          try {
            if (apiRes.statusCode !== 200) {
              console.error('Erreur Perplexity:', apiRes.statusCode, data);
              res.status(apiRes.statusCode).json({ 
                error: `Erreur API Perplexity (${apiRes.statusCode})`,
                details: data
              });
            } else {
              const jsonData = JSON.parse(data);
              res.status(200).json(jsonData);
            }
            resolve();
          } catch (e) {
            console.error('Erreur parsing:', e);
            res.status(500).json({ error: 'Erreur de parsing de la réponse' });
            resolve();
          }
        });
      });
      
      apiReq.on('error', (e) => {
        console.error('Erreur requête:', e);
        res.status(500).json({ error: e.message });
        resolve();
      });
      
      apiReq.write(postData);
      apiReq.end();
    });

  } catch (error) {
    console.error('Erreur proxy chat:', error);
    return res.status(500).json({ error: error.message });
  }
}
