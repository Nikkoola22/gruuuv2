import React, { useEffect, useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
}

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/news")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des actualités:", err);
        setError("Impossible de charger les actualités. Vérifiez que le serveur est démarré.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Chargement des actualités...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-2">⚠️</div>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Dernières actualités CFDT
      </h2>
      <div className="grid gap-6">
        {news.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune actualité disponible pour le moment.
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsList;
