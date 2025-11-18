import React, { useEffect, useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
}

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = () => {
      try {
        // Charger depuis localStorage
        const savedNews = localStorage.getItem('cfdt-news-items');
        if (savedNews) {
          setNews(JSON.parse(savedNews));
        } else {
          // Données par défaut vides
          setNews([]);
        }
        setLoading(false);
      } catch (err) {
        setNews([]);
        setLoading(false);
      }
    };
    
    loadNews();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>📰 Dernières actualités</h1>
        <p>Chargement des actualités...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📰 Dernières actualités</h1>
      {news.length === 0 ? (
        <div style={{ 
          background: "#e3f2fd", 
          border: "1px solid #2196f3", 
          borderRadius: "8px", 
          padding: "1rem", 
          color: "#1565c0" 
        }}>
          <p>Aucune actualité pour le moment. Allez dans <strong>⚙️ Actualités API</strong> pour en ajouter.</p>
        </div>
      ) : (
        <ul>
          {news.map((item) => (
            <li
              key={item.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <h3>{item.title}</h3>
              <p>{item.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsList;
