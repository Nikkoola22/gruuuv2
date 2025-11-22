import React, { useState, useEffect } from "react";

interface InfoItem {
  id: number;
  title: string;
  content: string;
}

interface CalculatorStatus {
  primes: boolean;
  cia: boolean;
  treizeme: boolean;
  grilles: boolean;
}

const AdminInfo: React.FC = () => {
  const [infoItems, setInfoItems] = useState<InfoItem[]>([]);
  const [newInfo, setNewInfo] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPrimesBlocked, setIsPrimesBlocked] = useState(() => {
    const saved = localStorage.getItem('primes-blocked');
    return saved ? JSON.parse(saved) : false;
  });

  const [calculatorsStatus, setCalculatorsStatus] = useState<CalculatorStatus>(() => {
    const saved = localStorage.getItem('calculators-status');
    return saved ? JSON.parse(saved) : { primes: true, cia: true, treizeme: true, grilles: true };
  });

  const togglePrimesBlock = () => {
    const newValue = !isPrimesBlocked;
    setIsPrimesBlocked(newValue);
    localStorage.setItem('primes-blocked', JSON.stringify(newValue));
    window.dispatchEvent(new CustomEvent('primes-blocked-changed', { detail: newValue }));
  };

  const toggleCalculator = (calculator: keyof CalculatorStatus) => {
    const updatedStatus = {
      ...calculatorsStatus,
      [calculator]: !calculatorsStatus[calculator]
    };
    setCalculatorsStatus(updatedStatus);
    localStorage.setItem('calculators-status', JSON.stringify(updatedStatus));
    window.dispatchEvent(new CustomEvent('calculators-status-changed', { detail: updatedStatus }));
  };

  useEffect(() => {
    // Charger les données depuis le localStorage ou utiliser les données par défaut
    const savedInfo = localStorage.getItem('cfdt-info-items');
    if (savedInfo) {
      setInfoItems(JSON.parse(savedInfo));
    } else {
      // Données par défaut
      const defaultInfo: InfoItem[] = [
        {
          id: 1,
          title: "Accident de trajet : où commence le trajet domicile-travail lorsqu'un agent réside dans un immeuble collectif ?",
          content: "Le trajet domicile-travail commence dès la sortie de l'immeuble collectif où réside l'agent. Cela inclut les parties communes de l'immeuble (hall, escaliers, ascenseur) jusqu'à la voie publique. En cas d'accident dans ces espaces communs, celui-ci peut être reconnu comme accident de trajet si l'agent se rendait effectivement au travail ou en revenait."
        },
        {
          id: 2,
          title: "Un fonctionnaire territorial peut-il demander une mutation tout en étant en disponibilité ?",
          content: "Dans la fonction publique territoriale, un fonctionnaire placé en disponibilité ne peut pas être muté directement puisqu'il n'est pas en position d'activité. Toutefois, il lui reste possible de préparer sa mobilité et de poser sa candidature à une mutation, à condition de respecter la procédure adaptée. Ce cadre juridique doit être bien compris par les services RH afin d'accompagner correctement les agents."
        },
        {
          id: 3,
          title: "Repenser le recrutement pour une fonction publique plus inclusive.",
          content: "La fonction publique territoriale s'engage vers plus d'inclusivité en diversifiant ses méthodes de recrutement. Cela passe par l'adaptation des épreuves pour les personnes en situation de handicap, la valorisation de l'expérience professionnelle via la reconnaissance des acquis, et le développement de parcours d'insertion pour favoriser l'égalité des chances dans l'accès aux emplois publics."
        },
        {
          id: 4,
          title: "Entretien avec son chef: accident de service?.",
          content: "La circonstance qu'un chef de service, recevant en entretien individuel l'un de ses agents, ait pu adresser à ce dernier plusieurs reproches sur sa manière de servir et s'énerver en lui reprochant notamment « tricher sur ses horaires de travail », n'est pas constitutive d'un accident de service, dès lors que la restitution de cet entretien par l'intéressé ne fait apparaitre aucun propos ou comportement excédant l'exercice normal du pouvoir hiérarchique de ce supérieur.TA Besançon 2400131 du 19.06.2025."
        },
        {
          id: 5,
          title: "Sanction: Utilisation WhatApp.",
          content: "La circonstance qu'un agent ait envoyé depuis son téléphone personnel et sa messagerie WhatsApp, à l'attention de plusieurs personnes, dont des élus, des photos montages assortis de sous-titre déshonorants à l'encontre de la maire de la ville et de son troisième adjoint, présente un caractère fautif et non humoristique, compte-tenu de la nature des photographies diffusées et des personnes visées par ces montages. Par suite, le comportement de l'intéressé constitue un manquement à son obligation de dignité, de réserve de probité, d'intégrité et de loyauté, justifiant son exclusion de fonctions durant deux ans. La circonstance que les messages incriminés soient provenus de la messagerie privée de l'intéressé et en dehors du service est sans incidence dès lors que le comportement d'un agent public peut avoir pour effet de perturber le service ou de jeter le discrédit sur l'administration, comme en l'espèce.TA Cergy-Pontoise 2201748 du 09.07.2025."
        }
      ];
      setInfoItems(defaultInfo);
      localStorage.setItem('cfdt-info-items', JSON.stringify(defaultInfo));
    }
  }, []);

  const saveInfoItems = (items: InfoItem[]) => {
    setInfoItems(items);
    localStorage.setItem('cfdt-info-items', JSON.stringify(items));
    // Déclenche un événement pour que App.tsx se synchronise
    window.dispatchEvent(new CustomEvent('info-items-updated', { detail: items }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Modification
      const updatedItems = infoItems.map(item =>
        item.id === editingId ? { ...newInfo, id: editingId } : item
      );
      saveInfoItems(updatedItems);
    } else {
      // Ajout
      const newId = Math.max(...infoItems.map(item => item.id), 0) + 1;
      const updatedItems = [...infoItems, { ...newInfo, id: newId }];
      saveInfoItems(updatedItems);
    }
    setNewInfo({ title: "", content: "" });
    setEditingId(null);
  };

  const handleEdit = (item: InfoItem) => {
    setNewInfo({ title: item.title, content: item.content });
    setEditingId(item.id);
  };

  const handleDelete = (id: number) => {
    const updatedItems = infoItems.filter(item => item.id !== id);
    saveInfoItems(updatedItems);
  };

  const exportToInfoDataTs = () => {
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
    alert('✅ Fichier info-data.ts téléchargé !\n\nÉtapes:\n1. Remplacez le fichier src/data/info-data.ts\n2. Poussez les changements sur GitHub\n3. Vercel se redéploiera automatiquement');
  };

  const generateAndCopyScript = () => {
    const code = `export interface InfoItem {
  id: number;
  title: string;
  content: string;
}

export const infoItems: InfoItem[] = ${JSON.stringify(infoItems, null, 2)};

// Pour compatibilité avec l'ancien système
export const infoData = infoItems.map(item => item.title).join(" • ");`;

    // Crée le script en évitant tout risque d'interpolation
    const lines = [
      '#!/bin/zsh',
      'cd /Users/nikkoolagarnier/Downloads/gruuuv2-master',
      "cat > src/data/info-data.ts << 'EOFSCRIPT'",
      code,
      'EOFSCRIPT',
      'git add src/data/info-data.ts',
      'git commit -m "Synchronisation: mise à jour news FPT depuis AdminInfo"',
      'git push',
      'echo "✅ News FPT mises à jour et poussées sur GitHub !"'
    ];
    const script = lines.join('\n');

    // Copier dans le clipboard
    navigator.clipboard.writeText(script).then(() => {
      alert('✅ Script copié dans le clipboard !\n\n1. Ouvrez un terminal\n2. Collez le script (Cmd+V ou Ctrl+V)\n3. Appuyez sur Entrée\n4. Voilà ! Les changements sont pushés vers GitHub');
    }).catch(() => {
      alert('❌ Erreur lors de la copie. Téléchargez le fichier à la place.');
      // Fallback: télécharger le script
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(script));
      element.setAttribute('download', 'update-news.sh');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };

  const handleMoveUp = (id: number) => {
    const index = infoItems.findIndex(item => item.id === id);
    if (index > 0) {
      const newItems = [...infoItems];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      saveInfoItems(newItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const index = infoItems.findIndex(item => item.id === id);
    if (index < infoItems.length - 1) {
      const newItems = [...infoItems];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      saveInfoItems(newItems);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📰 Administration des informations NEWS FPT</h1>
      
      {/* Bouton Bloquer/Débloquer PRIMES */}
      <div style={{
        marginBottom: "2rem",
        padding: "1rem",
        background: isPrimesBlocked ? "#ffebee" : "#e8f5e9",
        border: `2px solid ${isPrimesBlocked ? "#f44336" : "#4caf50"}`,
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>🔒 Contrôle du bouton PRIMES</h3>
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          État actuel : <strong>{isPrimesBlocked ? "🔒 BLOQUÉ" : "🔓 DÉVERROUILLÉ"}</strong>
        </p>
        <button
          onClick={togglePrimesBlock}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "white",
            background: isPrimesBlocked ? "#f44336" : "#4caf50",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 0.3s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = isPrimesBlocked ? "#d32f2f" : "#388e3c"}
          onMouseOut={(e) => e.currentTarget.style.background = isPrimesBlocked ? "#f44336" : "#4caf50"}
        >
          {isPrimesBlocked ? "🔓 Débloquer PRIMES" : "🔒 Bloquer PRIMES"}
        </button>
      </div>

      {/* Section Contrôle des Calculateurs */}
      <div style={{
        marginBottom: "2rem",
        padding: "1rem",
        background: "#f0f7ff",
        border: "2px solid #2196F3",
        borderRadius: "8px"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>📊 Contrôle des Calculateurs</h3>
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          Activez ou désactivez l'accès à chaque calculateur
        </p>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem"
        }}>
          {/* PRIMES */}
          <div style={{
            padding: "1rem",
            background: "white",
            border: `2px solid ${calculatorsStatus.primes ? "#4caf50" : "#f44336"}`,
            borderRadius: "6px",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>💎 PRIMES</h4>
            <p style={{ margin: "0 0 0.75rem 0", color: "#666", fontSize: "0.9em" }}>
              État: <strong>{calculatorsStatus.primes ? "✅ ACTIF" : "❌ INACTIF"}</strong>
            </p>
            <button
              onClick={() => toggleCalculator('primes')}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
                color: "white",
                background: calculatorsStatus.primes ? "#4caf50" : "#f44336",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              {calculatorsStatus.primes ? "Désactiver" : "Activer"}
            </button>
          </div>

          {/* CIA */}
          <div style={{
            padding: "1rem",
            background: "white",
            border: `2px solid ${calculatorsStatus.cia ? "#4caf50" : "#f44336"}`,
            borderRadius: "6px",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>🧮 CIA</h4>
            <p style={{ margin: "0 0 0.75rem 0", color: "#666", fontSize: "0.9em" }}>
              État: <strong>{calculatorsStatus.cia ? "✅ ACTIF" : "❌ INACTIF"}</strong>
            </p>
            <button
              onClick={() => toggleCalculator('cia')}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
                color: "white",
                background: calculatorsStatus.cia ? "#4caf50" : "#f44336",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              {calculatorsStatus.cia ? "Désactiver" : "Activer"}
            </button>
          </div>

          {/* 13ème Mois */}
          <div style={{
            padding: "1rem",
            background: "white",
            border: `2px solid ${calculatorsStatus.treizeme ? "#4caf50" : "#f44336"}`,
            borderRadius: "6px",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>💰 13ème Mois</h4>
            <p style={{ margin: "0 0 0.75rem 0", color: "#666", fontSize: "0.9em" }}>
              État: <strong>{calculatorsStatus.treizeme ? "✅ ACTIF" : "❌ INACTIF"}</strong>
            </p>
            <button
              onClick={() => toggleCalculator('treizeme')}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
                color: "white",
                background: calculatorsStatus.treizeme ? "#4caf50" : "#f44336",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              {calculatorsStatus.treizeme ? "Désactiver" : "Activer"}
            </button>
          </div>

          {/* Grilles Indiciaires */}
          <div style={{
            padding: "1rem",
            background: "white",
            border: `2px solid ${calculatorsStatus.grilles ? "#4caf50" : "#f44336"}`,
            borderRadius: "6px",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>📚 Grilles</h4>
            <p style={{ margin: "0 0 0.75rem 0", color: "#666", fontSize: "0.9em" }}>
              État: <strong>{calculatorsStatus.grilles ? "✅ ACTIF" : "❌ INACTIF"}</strong>
            </p>
            <button
              onClick={() => toggleCalculator('grilles')}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
                color: "white",
                background: calculatorsStatus.grilles ? "#4caf50" : "#f44336",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              {calculatorsStatus.grilles ? "Désactiver" : "Activer"}
            </button>
          </div>
        </div>
      </div>

      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Gérez les informations qui apparaissent dans le bandeau déroulant "NEWS FPT"
      </p>

      {/* Section d'Export */}
      <div style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        background: "#e3f2fd",
        border: "2px solid #2196F3",
        borderRadius: "8px"
      }}>
        <h2 style={{ marginTop: 0, color: "#1976d2" }}>📤 Synchroniser avec GitHub</h2>
        <p style={{ color: "#555", marginBottom: "1rem" }}>
          Vous avez modifié <strong>{infoItems.length} news FPT</strong>. 
          Cliquez sur le bouton ci-dessous pour générer un script de mise à jour automatique.
        </p>
        <button
          onClick={generateAndCopyScript}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "white",
            background: "#4caf50",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 0.3s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#388e3c"}
          onMouseOut={(e) => e.currentTarget.style.background = "#4caf50"}
        >
          🚀 Pousser les changements
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1.5rem", borderRadius: "8px" }}>
        <h2>{editingId ? "Modifier" : "Ajouter"} une information</h2>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Titre (affiché dans le bandeau) :
          </label>
          <input
            type="text"
            placeholder="Titre de l'information"
            value={newInfo.title}
            onChange={(e) => setNewInfo({ ...newInfo, title: e.target.value })}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "4px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Contenu détaillé (affiché dans la popup) :
          </label>
          <textarea
            placeholder="Contenu détaillé de l'information"
            value={newInfo.content}
            onChange={(e) => setNewInfo({ ...newInfo, content: e.target.value })}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "4px", height: "120px" }}
            required
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {editingId ? "Modifier" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setNewInfo({ title: "", content: "" });
                setEditingId(null);
              }}
              style={{ padding: "0.75rem 1.5rem", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h2>Informations existantes ({infoItems.length})</h2>
        {infoItems.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>Aucune information pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {infoItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
                      #{item.id}: {item.title}
                    </h3>
                    <p style={{ margin: "0", color: "#666", fontSize: "0.9em", lineHeight: "1.4" }}>
                      {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginLeft: "1rem" }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{ padding: "0.25rem 0.5rem", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8em" }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ padding: "0.25rem 0.5rem", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8em" }}
                    >
                      Supprimer
                    </button>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button
                        onClick={() => handleMoveUp(item.id)}
                        disabled={index === 0}
                        style={{ padding: "0.25rem 0.5rem", background: index === 0 ? "#ccc" : "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: index === 0 ? "not-allowed" : "pointer", fontSize: "0.8em" }}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(item.id)}
                        disabled={index === infoItems.length - 1}
                        style={{ padding: "0.25rem 0.5rem", background: index === infoItems.length - 1 ? "#ccc" : "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: index === infoItems.length - 1 ? "not-allowed" : "pointer", fontSize: "0.8em" }}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInfo;
