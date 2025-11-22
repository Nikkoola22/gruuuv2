import React, { useState, useEffect } from "react";
import { infoItems as defaultInfoItems } from "../data/info-data.ts";

interface RssConfig {
  url: string;
  enabled: boolean;
}

interface InfoItem {
  id: number;
  title: string;
  content: string;
}

const AdminNews: React.FC = () => {
  const [rssConfig, setRssConfig] = useState<RssConfig>({ url: "", enabled: false });
  const [rssTestResult, setRssTestResult] = useState<string | null>(null);
  const [infoItems, setInfoItems] = useState<InfoItem[]>([]);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [cfdtInfoItems, setCfdtInfoItems] = useState<InfoItem[]>([]);

  useEffect(() => {
    loadRssConfig();
    loadInfoItems();
    loadCfdtInfoItems();
  }, []);

  const loadCfdtInfoItems = () => {
    const saved = localStorage.getItem('cfdt-info-items');
    if (saved) {
      setCfdtInfoItems(JSON.parse(saved));
    }
  };

  const loadRssConfig = () => {
    const saved = localStorage.getItem('rssConfig');
    if (saved) {
      setRssConfig(JSON.parse(saved));
    }
  };

  const loadInfoItems = () => {
    const saved = localStorage.getItem('infoItems');
    if (saved) {
      setInfoItems(JSON.parse(saved));
    } else {
      // Si aucune modification en localStorage, charger depuis le code source
      setInfoItems(defaultInfoItems);
    }
  };

  const saveRssConfig = (config: RssConfig) => {
    localStorage.setItem('rssConfig', JSON.stringify(config));
    setRssConfig(config);
  };

  const exportNewsToCode = () => {
    const code = `export interface InfoItem {
  id: number;
  title: string;
  content: string;
}

export const infoItems: InfoItem[] = ${JSON.stringify(infoItems, null, 2)};

// Pour compatibilité avec l'ancien système
export const infoData = infoItems.map(item => item.title).join(" • ");`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(code));
    element.setAttribute('download', 'info-data.ts');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExportMessage('✅ Fichier info-data.ts téléchargé ! Remplacez le fichier src/data/info-data.ts et commitez les changements.');
    setTimeout(() => setExportMessage(null), 5000);
  };

  const importNewsFromCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const match = content.match(/export const infoItems: InfoItem\[\] = (\[[\s\S]*?\]);/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          setInfoItems(parsed);
          localStorage.setItem('infoItems', JSON.stringify(parsed));
          setExportMessage('✅ News importées avec succès depuis le fichier !');
          setTimeout(() => setExportMessage(null), 3000);
        } else {
          setExportMessage('❌ Format de fichier invalide. Assurez-vous que c\'est un fichier info-data.ts valide.');
          setTimeout(() => setExportMessage(null), 5000);
        }
      } catch (err) {
        setExportMessage(`❌ Erreur lors de la lecture du fichier: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setTimeout(() => setExportMessage(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const exportCfdtNewsToCode = () => {
    const code = `export interface InfoItem {
  id: number;
  title: string;
  content: string;
}

export const infoItems: InfoItem[] = ${JSON.stringify(cfdtInfoItems, null, 2)};

// Pour compatibilité avec l'ancien système
export const infoData = infoItems.map(item => item.title).join(" • ");`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(code));
    element.setAttribute('download', 'info-data.ts');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExportMessage('✅ Fichier info-data.ts téléchargé avec vos 7 news FPT ! Remplacez le fichier src/data/info-data.ts et commitez les changements.');
    setTimeout(() => setExportMessage(null), 5000);
  };

  const testRssFeed = async (url: string) => {
    try {
      setRssTestResult("Test en cours...");
      const proxyUrl = "https://api.allorigins.win/get?url=";
      const response = await fetch(proxyUrl + encodeURIComponent(url));
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const xml = data.contents;
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const items = doc.querySelectorAll("item");
      
      if (items.length > 0) {
        setRssTestResult(`✅ Flux RSS valide ! ${items.length} articles trouvés.`);
      } else {
        setRssTestResult("⚠️ Flux RSS valide mais aucun article trouvé.");
      }
    } catch (err) {
      setRssTestResult(`❌ Erreur: ${err instanceof Error ? err.message : 'Flux RSS invalide'}`);
    }
  };

  // Fonction supprimée - plus besoin de se connecter au serveur

  // Fonctions de gestion des actualités supprimées - focus sur la configuration RSS

  // Suppression des conditions d'erreur - page toujours accessible

  return (
    <div style={{ padding: "2rem" }}>
      <h1>⚙️ Administration des actualités</h1>
      
      {/* Export/Import News FPT */}
      <div style={{ 
        marginBottom: "2rem", 
        padding: "1.5rem", 
        border: "1px solid #ddd", 
        borderRadius: "8px",
        backgroundColor: "#f0f8ff"
      }}>
        <h2>📥 Gestion des news FPT (Fonction Publique Territoriale)</h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Vous avez modifié <strong>{cfdtInfoItems.length} news FPT</strong> dans le panneau "📋 NEWS FPT" (AdminInfo.tsx).
          Cliquez sur le bouton ci-dessous pour les exporter vers le code source et les pousser sur GitHub.
        </p>
        
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={exportCfdtNewsToCode}
            disabled={cfdtInfoItems.length === 0}
            style={{ 
              padding: "0.5rem 1rem", 
              backgroundColor: cfdtInfoItems.length > 0 ? "#28a745" : "#6c757d", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: cfdtInfoItems.length > 0 ? "pointer" : "not-allowed",
              opacity: cfdtInfoItems.length > 0 ? 1 : 0.5
            }}
          >
            📥 Exporter {cfdtInfoItems.length > 0 ? `${cfdtInfoItems.length} news` : "news"} vers info-data.ts
          </button>
        </div>
        
        {exportMessage && (
          <div style={{ 
            padding: "0.5rem", 
            backgroundColor: exportMessage.includes("✅") ? "#d4edda" : "#f8d7da",
            border: `1px solid ${exportMessage.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
            borderRadius: "4px",
            color: exportMessage.includes("✅") ? "#155724" : "#721c24"
          }}>
            {exportMessage}
          </div>
        )}
      </div>
      
      {/* Configuration RSS */}
      <div style={{ 
        marginBottom: "2rem", 
        padding: "1.5rem", 
        border: "1px solid #ddd", 
        borderRadius: "8px",
        backgroundColor: "#f9f9f9"
      }}>
        <h2>📡 Configuration du flux RSS</h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Configurez un flux RSS personnalisé qui remplacera le flux par défaut dans l'application principale.
        </p>
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            URL du flux RSS :
          </label>
          <input
            type="url"
            placeholder="https://example.com/rss.xml"
            value={rssConfig.url}
            onChange={(e) => setRssConfig({ ...rssConfig, url: e.target.value })}
            style={{ 
              width: "100%", 
              padding: "0.5rem", 
              marginBottom: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={rssConfig.enabled}
              onChange={(e) => setRssConfig({ ...rssConfig, enabled: e.target.checked })}
            />
            Activer ce flux RSS
          </label>
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => testRssFeed(rssConfig.url)}
            disabled={!rssConfig.url}
            style={{ 
              padding: "0.5rem 1rem", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: rssConfig.url ? "pointer" : "not-allowed",
              opacity: rssConfig.url ? 1 : 0.5
            }}
          >
            Tester le flux
          </button>
          
          <button
            type="button"
            onClick={() => saveRssConfig(rssConfig)}
            style={{ 
              padding: "0.5rem 1rem", 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Sauvegarder
          </button>
        </div>
        
        {rssTestResult && (
          <div style={{ 
            padding: "0.5rem", 
            backgroundColor: rssTestResult.includes("✅") ? "#d4edda" : rssTestResult.includes("❌") ? "#f8d7da" : "#fff3cd",
            border: `1px solid ${rssTestResult.includes("✅") ? "#c3e6cb" : rssTestResult.includes("❌") ? "#f5c6cb" : "#ffeaa7"}`,
            borderRadius: "4px",
            color: rssTestResult.includes("✅") ? "#155724" : rssTestResult.includes("❌") ? "#721c24" : "#856404"
          }}>
            {rssTestResult}
          </div>
        )}
      </div>
      
      {/* Section d'information */}
      <div style={{ 
        marginBottom: "2rem", 
        padding: "1rem", 
        backgroundColor: "#e3f2fd", 
        border: "1px solid #2196f3", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#1976d2" }}>ℹ️ Information</h3>
        <p style={{ margin: 0, color: "#1565c0" }}>
          Cette page vous permet de configurer un flux RSS personnalisé qui remplacera le flux par défaut 
          dans l'application principale. Le flux configuré sera utilisé dans le bandeau "Actualités nationales".
        </p>
      </div>
    </div>
  );
};

export default AdminNews;
