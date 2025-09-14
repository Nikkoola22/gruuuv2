import React, { useState, useEffect } from "react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
}

const AdminNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newNews, setNewNews] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/news");
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setNews(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      // Erreur silencieuse - affichée dans l'interface utilisateur
      setError("Impossible de se connecter au serveur d'actualités. Veuillez vérifier que le serveur est démarré sur le port 4000.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId 
      ? `http://localhost:4000/api/news/${editingId}`
      : "http://localhost:4000/api/news";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { ...newNews, id: editingId } : newNews),
    })
      .then(() => {
        fetchNews();
        setNewNews({ title: "", content: "" });
        setEditingId(null);
      });
  };

  const handleEdit = (item: NewsItem) => {
    setNewNews({ title: item.title, content: item.content });
    setEditingId(item.id);
  };

  const handleDelete = (id: number) => {
    fetch(`http://localhost:4000/api/news/${id}`, { method: "DELETE" })
      .then(() => fetchNews());
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>⚙️ Administration des actualités</h1>
        <p>Chargement des actualités...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>⚙️ Administration des actualités</h1>
        <div style={{ 
          background: "#ffebee", 
          border: "1px solid #f44336", 
          borderRadius: "8px", 
          padding: "1rem", 
          color: "#c62828" 
        }}>
          <h3>⚠️ Erreur de connexion</h3>
          <p>{error}</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9em" }}>
            Pour démarrer le serveur d'actualités, exécutez : <code>npm run server</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>⚙️ Administration des actualités</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <h2>{editingId ? "Modifier" : "Ajouter"} une actualité</h2>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Titre"
            value={newNews.title}
            onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <textarea
            placeholder="Contenu"
            value={newNews.content}
            onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
            style={{ width: "100%", padding: "0.5rem", height: "100px" }}
            required
          />
        </div>
        <button type="submit" style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}>
          {editingId ? "Modifier" : "Ajouter"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setNewNews({ title: "", content: "" });
              setEditingId(null);
            }}
            style={{ padding: "0.5rem 1rem" }}
          >
            Annuler
          </button>
        )}
      </form>

      <div>
        <h2>Actualités existantes</h2>
        {news.map((item) => (
          <div
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
            <div style={{ marginTop: "0.5rem" }}>
              <button
                onClick={() => handleEdit(item)}
                style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ padding: "0.25rem 0.5rem", background: "#ff4444", color: "white" }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNews;
