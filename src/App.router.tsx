import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NewsList from "./pages/NewsList";
import AdminNews from "./pages/AdminNews";

const App: React.FC = () => {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#f0f0f0" }}>
        <Link to="/news" style={{ marginRight: "1rem" }}>
          📰 Actualités
        </Link>
        <Link to="/admin-news">⚙️ Administration</Link>
      </nav>

      <Routes>
        <Route path="/news" element={<NewsList />} />
        <Route path="/admin-news" element={<AdminNews />} />
        <Route path="*" element={<NewsList />} /> {/* redirection par défaut */}
      </Routes>
    </Router>
  );
};

export default App;
