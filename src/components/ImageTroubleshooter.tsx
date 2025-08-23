import React, { useState, useEffect } from "react";

// Créez un nouveau fichier ImageDebug.tsx avec ce contenu
const ImageDebug = () => {
  const [images, setImages] = useState([
    { name: "unnamed.png", path: "/unnamed.png", loaded: false, error: false },
    { name: "logo-cfdt.png", path: "/logo-cfdt.png", loaded: false, error: false }
  ]);

  useEffect(() => {
    testAllImages();
  }, []);

  const testImage = (index) => {
    const img = new Image();
    const image = images[index];
    
    img.onload = () => {
      const updatedImages = [...images];
      updatedImages[index] = { ...image, loaded: true, error: false };
      setImages(updatedImages);
    };
    
    img.onerror = () => {
      const updatedImages = [...images];
      updatedImages[index] = { ...image, loaded: false, error: true };
      setImages(updatedImages);
    };
    
    img.src = image.path;
  };

  const testAllImages = () => {
    images.forEach((_, index) => testImage(index));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Diagnostic d'images - CFDT App</h1>
      <p>Base URL: <strong>{window.location.origin}</strong></p>
      
      <button 
        onClick={testAllImages}
        style={{ 
          padding: '10px 15px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Tester toutes les images
      </button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {images.map((image, index) => (
          <div key={index} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ marginTop: 0 }}>{image.name}</h3>
            
            <div style={{ 
              height: '150px', 
              border: '2px dashed #bbb', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '15px',
              backgroundColor: 'white'
            }}>
              {image.loaded ? (
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={image.path} 
                    alt={image.name} 
                    style={{ maxHeight: '140px', maxWidth: '100%' }}
                  />
                  <p style={{ color: 'green', margin: '5px 0 0 0' }}>✓ Chargée avec succès</p>
                </div>
              ) : image.error ? (
                <div style={{ color: 'red', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>❌</div>
                  <p>Erreur de chargement</p>
                </div>
              ) : (
                <div style={{ color: '#666', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                  <p>En attente de test...</p>
                </div>
              )}
            </div>
            
            <div>
              <p><strong>Chemin utilisé:</strong> <code>{image.path}</code></p>
              <p><strong>URL complète:</strong> <code>{window.location.origin}{image.path}</code></p>
              <p>
                <strong>Statut:</strong> 
                {image.loaded ? 
                  <span style={{ color: 'green', fontWeight: 'bold' }}> ✓ Chargée</span> : 
                  image.error ? 
                  <span style={{ color: 'red', fontWeight: 'bold' }}> ✗ Erreur</span> : 
                  <span style={{ color: 'orange', fontWeight: 'bold' }}> ? Non testée</span>
                }
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h2>Solutions possibles</h2>
        
        <h3>1. Vérifiez l'emplacement des fichiers</h3>
        <p>Les images doivent être directement dans le dossier <code>public/</code> à la racine de votre projet :</p>
        <pre style={{ 
          backgroundColor: '#2d2d2d', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
{`public/
  ├── unnamed.png
  └── logo-cfdt.png`}</pre>
        
        <h3>2. Utilisez les bons chemins</h3>
        <p>Dans votre code, utilisez les chemins absolus comme ceci :</p>
        <pre style={{ 
          backgroundColor: '#2d2d2d', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
{`// Pour l'image de fond
<div style={{ backgroundImage: "url('/unnamed.png')" }} />

// Pour le logo
<img src="/logo-cfdt.png" alt="Logo CFDT" />`}</pre>
        
        <h3>3. Testez l'accès direct</h3>
        <p>Ouvrez ces liens dans votre navigateur pour vérifier l'accès :</p>
        <ul>
          <li><a href="/unnamed.png" target="_blank" rel="noopener noreferrer">{window.location.origin}/unnamed.png</a></li>
          <li><a href="/logo-cfdt.png" target="_blank" rel="noopener noreferrer">{window.location.origin}/logo-cfdt.png</a></li>
        </ul>
        
        <h3>4. Vérifiez la console</h3>
        <p>Ouvrez les outils de développement (F12) et regardez dans l'onglet "Console" pour voir les erreurs éventuelles.</p>
      </div>
    </div>
  );
};

// VOTRE APPLICATION PRINCIPALE
export default function MainApp() {
  const [showDebug, setShowDebug] = useState(true);
  
  // Pour afficher le diagnostic, utilisez ceci :
  if (showDebug) {
    return <ImageDebug />;
  }
  
  // Sinon, retournez votre application normale
  return (
    <div>
      {/* Votre application normale ici */}
      <h1>Votre Application CFDT</h1>
      <button onClick={() => setShowDebug(true)}>
        Afficher le diagnostic
      </button>
    </div>
  );
}