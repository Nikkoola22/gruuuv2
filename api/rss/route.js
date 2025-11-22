import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(request) {
  try {
    const https = await import('https');
    
    const xmlText = await new Promise((resolve, reject) => {
      https.default.get('https://www.franceinfo.fr/politique.rss', {
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

    if (items.length === 0) throw new Error('No items parsed');

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, max-age=300' }
    });

  } catch (error) {
    console.error('[RSS]', error.message);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
