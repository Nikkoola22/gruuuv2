import React, { useState } from "react";
import NewsList from "./pages/NewsList";
import AdminNews from "./pages/AdminNews";
import AdminInfo from "./pages/AdminInfo";

const AdminApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<"news" | "admin-news" | "admin-info">("admin-info");

  const renderPage = () => {
    switch (currentPage) {
      case "news":
        return <NewsList />;
      case "admin-news":
        return <AdminNews />;
      case "admin-info":
        return <AdminInfo />;
      default:
        return <AdminInfo />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <nav style={{ 
        padding: "1rem", 
        background: "#2c3e50", 
        color: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "2rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>🔧 Administration CFDT</h1>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button 
              onClick={() => setCurrentPage("news")}
              style={{ 
                color: "white", 
                textDecoration: "none", 
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                background: currentPage === "news" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              📰 Actualités
            </button>
            <button 
              onClick={() => setCurrentPage("admin-news")}
              style={{ 
                color: "white", 
                textDecoration: "none", 
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                background: currentPage === "admin-news" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              ⚙️ Actualités API
            </button>
            <button 
              onClick={() => setCurrentPage("admin-info")}
              style={{ 
                color: "white", 
                textDecoration: "none", 
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                background: currentPage === "admin-info" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              📋 NEWS FPT
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminApp;
