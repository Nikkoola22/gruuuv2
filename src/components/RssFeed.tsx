import { useEffect, useState } from "react";

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export default function RssFeed() {
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRss = async () => {
      try {
        const feedUrl = 'https://www.franceinfo.fr/politique.rss';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}&json`;
        
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Statut HTTP ${res.status}`);
        
        const data = await res.json();
        const xmlText = data.contents;

        // Parse XML
        const items: RssItem[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match, count = 0;

        while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
          const itemXml = match[1];
          const getTag = (tag: string) => {
            const regex = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, 's');
            const m = regex.exec(itemXml);
            return m && m[1] ? m[1].replace(/<[^>]*>/g, '').trim() : '';
          };

          const title = getTag('title');
          const link = getTag('link');

          if (title && link) {
            items.push({
              title,
              link,
              pubDate: getTag('pubDate'),
              description: getTag('description'),
            });
            count++;
          }
        }

        setItems(items);
        setLoading(false);
      } catch (err) {
        console.error("Impossible de charger le flux RSS:", err);
        setError("Impossible de charger le flux RSS.");
        setLoading(false);
      }
    };

    fetchRss();
  }, []);

  if (loading) return <div>Chargement du flux RSS...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Flux RSS France Info (Politique)</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: "1em" }}>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
            <p>{new Date(item.pubDate).toLocaleString()}</p>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
