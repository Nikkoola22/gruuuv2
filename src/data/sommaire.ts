/**
 * SOMMAIRE UNIFIÉ - Index léger pour la recherche en 2 étapes
 * 
 * Ce fichier contient uniquement les titres et mots-clés de chaque section
 * des documents internes (temps.ts, formation.ts, teletravail.ts).
 * 
 * Stratégie :
 * 1. L'API interroge ce sommaire léger (~500 tokens) pour identifier OÙ se trouve la réponse
 * 2. Une fois la section identifiée, on charge uniquement le texte pertinent du bon fichier
 * 
 * Économie : ~90% de tokens en moins par requête
 */

export interface SectionIndex {
  id: string;
  titre: string;
  motsCles: string[];
  source: 'temps' | 'formation' | 'teletravail';
  chapitre?: number;
  resume?: string;
}

export const sommaireUnifie: SectionIndex[] = [
  // ============================================
  // TEMPS DE TRAVAIL (temps.ts - chapitres 1-4)
  // ============================================
  
  // Chapitre 1 : Le temps de travail
  {
    id: 'temps_ch1_definition',
    titre: 'Définition du temps de travail',
    motsCles: ['temps de travail', 'travail effectif', '1607h', 'durée légale', 'jours travaillés', 'solidarité'],
    source: 'temps',
    chapitre: 1,
    resume: 'Définition légale du temps de travail, calcul des 1607h annuelles, journée de solidarité'
  },
  {
    id: 'temps_ch1_durees',
    titre: 'Durées et cycles de travail',
    motsCles: ['37h', '38h', '39h', 'cycle hebdomadaire', 'annualisation', 'JNT', 'crèches'],
    source: 'temps',
    chapitre: 1,
    resume: 'Cycles de travail (37h, 37.5h, 38h, 39h), annualisation, jours non travaillés'
  },
  {
    id: 'temps_ch1_plages',
    titre: 'Plages fixes et plages de souplesse',
    motsCles: ['plages fixes', 'plages souplesse', 'horaires variables', 'flexibilité', 'pause méridienne', '9h30', '16h30'],
    source: 'temps',
    chapitre: 1,
    resume: 'Horaires de présence obligatoire (9h30-12h, 14h-16h30) et plages de souplesse'
  },
  {
    id: 'temps_ch1_garanties',
    titre: 'Garanties minimales',
    motsCles: ['repos quotidien', 'repos hebdomadaire', '11h', '35h', 'amplitude', '48h', 'nuit'],
    source: 'temps',
    chapitre: 1,
    resume: 'Repos minimum (11h/jour, 35h/semaine), amplitude max 12h, durée max 48h/semaine'
  },
  {
    id: 'temps_ch1_heures_sup',
    titre: 'Heures supplémentaires et complémentaires',
    motsCles: ['heures supplémentaires', 'heures complémentaires', 'majoration', '25%', '27%', 'récupération', 'nuit', 'dimanche'],
    source: 'temps',
    chapitre: 1,
    resume: 'Heures sup majorées 25%/27%, max 25h/mois, récupération ou indemnisation'
  },
  {
    id: 'temps_ch1_temps_partiel',
    titre: 'Temps partiel',
    motsCles: ['temps partiel', '50%', '60%', '70%', '80%', '90%', 'droit', 'autorisation', 'rémunération', 'retraite', 'surcotisation'],
    source: 'temps',
    chapitre: 1,
    resume: 'Temps partiel de droit (enfant, handicap) ou sur autorisation, quotités 50-90%'
  },
  {
    id: 'temps_ch1_astreintes',
    titre: 'Astreintes et permanences',
    motsCles: ['astreinte', 'permanence', 'intervention', 'filière technique', 'indemnité', 'repos compensateur', 'week-end'],
    source: 'temps',
    chapitre: 1,
    resume: 'Astreintes (exploitation, décision, sécurité), permanences week-end/fériés'
  },
  
  // Chapitre 2 : Les congés
  {
    id: 'temps_ch2_conges_annuels',
    titre: 'Congés annuels',
    motsCles: ['congés annuels', 'congé annuel', 'congés', 'vacances', '25 jours', 'CA', 'planning', 'estivaux', 'report', 'priorité', 'droit', 'combien'],
    source: 'temps',
    chapitre: 2,
    resume: '25 jours ouvrés/an, règles de pose, priorités, report exceptionnel'
  },
  {
    id: 'temps_ch2_conge_bonifie',
    titre: 'Congé bonifié (outre-mer)',
    motsCles: ['congé bonifié', 'outre-mer', 'DOM', 'Guadeloupe', 'Martinique', 'Réunion', 'Guyane', 'Mayotte'],
    source: 'temps',
    chapitre: 2,
    resume: 'Congé pour fonctionnaires originaires des DOM, tous les 2 ans, max 31 jours'
  },
  {
    id: 'temps_ch2_rtt',
    titre: 'Jours RTT / ARTT',
    motsCles: ['RTT', 'ARTT', 'réduction temps travail', '12 jours', '15 jours', '18 jours', '23 jours', 'décompte', 'maladie'],
    source: 'temps',
    chapitre: 2,
    resume: 'RTT selon cycle (12j à 37h, 15j à 37.5h, 18j à 38h, 23j à 39h), déduction si maladie'
  },
  {
    id: 'temps_ch2_don_jours',
    titre: 'Don de jours de repos',
    motsCles: ['don jours', 'enfant malade', 'proche aidant', 'solidarité', 'anonyme'],
    source: 'temps',
    chapitre: 2,
    resume: 'Don anonyme de RTT/CA (max 5j/an) pour collègue avec enfant malade ou aidant'
  },
  {
    id: 'temps_ch2_cet',
    titre: 'Compte Épargne Temps (CET)',
    motsCles: ['CET', 'compte épargne temps', 'épargne', 'capitalisation', 'jours non pris'],
    source: 'temps',
    chapitre: 2,
    resume: 'Épargne de jours CA (max 5j) et RTT, ouvert après 1 an de service'
  },
  {
    id: 'temps_ch2_naissance',
    titre: 'Congés maternité et paternité',
    motsCles: ['maternité', 'paternité', 'naissance', 'accouchement', 'grossesse', 'prénatal', 'postnatal', '16 semaines', '25 jours'],
    source: 'temps',
    chapitre: 2,
    resume: 'Maternité 16 semaines (+ si 3e enfant/jumeaux), paternité 25 jours calendaires'
  },
  
  // Chapitre 3 : Autorisations spéciales d'absence
  {
    id: 'temps_ch3_fetes_religieuses',
    titre: 'Fêtes religieuses',
    motsCles: ['fêtes religieuses', 'musulmane', 'juive', 'orthodoxe', 'bouddhiste', 'Aïd', 'Kippour'],
    source: 'temps',
    chapitre: 3,
    resume: 'Autorisation prioritaire de poser un congé pour fêtes religieuses'
  },
  {
    id: 'temps_ch3_garde_enfant',
    titre: 'Garde d\'enfant malade',
    motsCles: ['garde enfant', 'enfant malade', 'nourrice', 'école fermée', '6 jours', '16 ans', 'grève'],
    source: 'temps',
    chapitre: 3,
    resume: '6 jours/an (doublés si parent seul), jusqu\'aux 16 ans de l\'enfant'
  },
  {
    id: 'temps_ch3_deces',
    titre: 'Décès d\'un membre de la famille',
    motsCles: ['décès', 'obsèques', 'deuil', 'conjoint', 'parent', 'enfant', '5 jours', '14 jours'],
    source: 'temps',
    chapitre: 3,
    resume: '5j conjoint/parents, 14j enfant <25 ans, 3j grands-parents/frères/soeurs'
  },
  {
    id: 'temps_ch3_mariage',
    titre: 'Mariage ou PACS',
    motsCles: ['mariage', 'PACS', 'union', 'cérémonie', '5 jours', '7 jours', '3 jours', '1 jour'],
    source: 'temps',
    chapitre: 3,
    resume: '5 jours ouvrables pour l\'agent, 3 jours pour enfant, 1 jour pour autres proches'
  },
  {
    id: 'temps_ch3_demenagement',
    titre: 'Déménagement',
    motsCles: ['déménagement', 'demenagement', 'changement adresse', 'domicile', '1 jour', 'une journée'],
    source: 'temps',
    chapitre: 3,
    resume: '1 jour d\'autorisation la semaine précédant ou suivant le déménagement'
  },
  {
    id: 'temps_ch3_rentree',
    titre: 'Rentrée scolaire',
    motsCles: ['rentrée scolaire', 'école', 'maternelle', 'primaire', '6ème', '1 heure'],
    source: 'temps',
    chapitre: 3,
    resume: 'Facilité d\'1h le jour de la rentrée (maternelle, primaire, entrée en 6e)'
  },
  
  // Chapitre 4 : Maladies et accidents
  {
    id: 'temps_ch4_maladie',
    titre: 'Congé maladie',
    motsCles: ['maladie', 'arrêt', 'carence', '48h', 'contrôle', 'contre-visite', 'CMO'],
    source: 'temps',
    chapitre: 4,
    resume: 'Transmission sous 48h, 1 jour de carence, contre-visite possible'
  },
  {
    id: 'temps_ch4_accident',
    titre: 'Accident de service ou de trajet',
    motsCles: ['accident service', 'accident travail', 'accident trajet', 'déclaration', '15 jours', 'certificat'],
    source: 'temps',
    chapitre: 4,
    resume: 'Déclaration sous 48h (régime général) ou 15j (CNRACL), plein traitement'
  },

  // ============================================
  // FORMATION (formation.ts)
  // ============================================
  {
    id: 'formation_obligatoire',
    titre: 'Formations obligatoires (intégration, professionnalisation)',
    motsCles: ['formation obligatoire', 'intégration', 'professionnalisation', 'CNFPT', 'titularisation', '5 jours', '10 jours'],
    source: 'formation',
    resume: 'Formation intégration (5-10j), professionnalisation 1er emploi (3-10j), tout au long carrière (2-10j)'
  },
  {
    id: 'formation_cpf',
    titre: 'Compte Personnel de Formation (CPF)',
    motsCles: ['CPF', 'compte formation', 'heures', '25 heures', '150 heures', 'diplôme', 'certification'],
    source: 'formation',
    resume: '25h/an (plafond 150h), formations diplômantes ou certifiantes'
  },
  {
    id: 'formation_conge_pro',
    titre: 'Congé de formation professionnelle',
    motsCles: ['congé formation', '3 ans', '85%', 'traitement', 'projet professionnel'],
    source: 'formation',
    resume: 'Max 3 ans sur carrière (5 ans cat C), rémunéré 85% la 1ère année'
  },
  {
    id: 'formation_vae',
    titre: 'Validation des Acquis de l\'Expérience (VAE)',
    motsCles: ['VAE', 'validation acquis', 'expérience', 'diplôme', '24 heures'],
    source: 'formation',
    resume: '24h de congé (72h si handicap/cat C) pour obtenir un diplôme via expérience'
  },

  // ============================================
  // TÉLÉTRAVAIL (teletravail.ts)
  // ============================================
  {
    id: 'teletravail_principes',
    titre: 'Principes du télétravail',
    motsCles: ['télétravail', 'principes', 'volontariat', 'réversibilité', 'confiance', 'déconnexion'],
    source: 'teletravail',
    resume: 'Volontaire, réversible, droit à la déconnexion, management par confiance'
  },
  {
    id: 'teletravail_quotite',
    titre: 'Quotité et forfait télétravail',
    motsCles: ['forfait', 'jours télétravail', '2 jours', '3 jours', '1 jour par semaine', 'quotité', 'combien'],
    source: 'teletravail',
    resume: '1 jour fixe/semaine + forfait 15 jours/an (max 3j/mois), présence obligatoire 3j/semaine'
  },
  {
    id: 'teletravail_demande',
    titre: 'Procédure de demande télétravail',
    motsCles: ['demande', 'formulaire', 'autorisation', 'refus', 'entretien', 'CAP'],
    source: 'teletravail',
    resume: 'Demande écrite, entretien préalable, refus motivé contestable en CAP'
  },
  {
    id: 'teletravail_materiel',
    titre: 'Matériel et équipement télétravail',
    motsCles: ['matériel', 'ordinateur', 'internet', 'kit ergonomique', 'équipement'],
    source: 'teletravail',
    resume: 'Matériel fourni par la collectivité, kit ergonomique, connexion internet requise'
  }
];

/**
 * Fonction utilitaire pour rechercher dans le sommaire
 * Retourne les sections les plus pertinentes pour une question donnée
 */
export function rechercherDansSommaire(question: string, maxResults = 3): SectionIndex[] {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const scored = sommaireUnifie.map(section => {
    let score = 0;
    
    for (const motCle of section.motsCles) {
      const mcNorm = motCle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (q.includes(mcNorm)) {
        score += 10;
      }
      const mots = mcNorm.split(' ');
      for (const mot of mots) {
        if (mot.length > 3 && q.includes(mot)) {
          score += 3;
        }
      }
    }
    
    const titreNorm = section.titre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (q.includes(titreNorm)) {
      score += 15;
    }
    for (const mot of titreNorm.split(' ')) {
      if (mot.length > 3 && q.includes(mot)) {
        score += 2;
      }
    }
    
    if (section.resume) {
      const resumeNorm = section.resume.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      for (const mot of resumeNorm.split(' ')) {
        if (mot.length > 4 && q.includes(mot)) {
          score += 1;
        }
      }
    }
    
    return { section, score };
  });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.section);
}
