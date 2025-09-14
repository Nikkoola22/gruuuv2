import React, { useEffect, useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
}

const AdminNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/news")
      .then((res) => res.json())
      .then(setNews);
  }, []);

  const addNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    setNews(data);
    setTitle("");
    setContent("");
  };

  const deleteNews = async (id: number) => {
    const res = await fetch(`http://localhost:4000/api/news/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setNews(data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>⚙️ Administration des News</h1>

      <form onSubmit={addNews} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: "0.5rem",
            padding: "0.5rem",
          }}
        />
        <textarea
          placeholder="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: "0.5rem",
            padding: "0.5rem",
          }}
        />
        <button type="submit">➕ Ajouter</button>
      </form>

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
            <strong>{item.title}</strong>
            <p>{item.content}</p>
            <button onClick={() => deleteNews(item.id)}>❌ Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNews;
