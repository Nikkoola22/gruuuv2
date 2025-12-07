#!/usr/bin/env python3
"""
Script d'amélioration du sommaire.ts
Analyse les fichiers temps.ts, formation.ts et teletravail.ts
pour générer un sommaire plus précis avec des mots-clés exhaustifs.
"""

# Nouveau sommaire amélioré basé sur l'analyse détaillée des fichiers sources

SOMMAIRE_AMELIORE = '''/**
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
 * 
 * Version améliorée - 07/12/2025
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
    motsCles: ['temps de travail', 'travail effectif', '1607h', '1607 heures', 'durée légale', 'jours travaillés', '228 jours', '365 jours', 'repos hebdomadaire', '104 jours'],
    source: 'temps',
    chapitre: 1,
    resume: 'Définition légale: 1607h annuelles, 228 jours travaillés (365 - 104 repos - 25 CA - 8 fériés)'
  },
  {
    id: 'temps_ch1_durees',
    titre: 'Durées et cycles de travail hebdomadaires',
    motsCles: ['37h', '37 heures', '37h30', '37.5h', '38h', '38 heures', '39h', '39 heures', 'cycle hebdomadaire', 'cycle de travail', 'annualisation', 'annualisé', 'JNT', 'jours non travaillés', 'crèches', 'heures par semaine', 'durée hebdomadaire'],
    source: 'temps',
    chapitre: 1,
    resume: 'Cycles: 37h, 37.5h, 38h, 39h (crèches). Annualisation pour certains services avec JNT planifiés'
  },
  {
    id: 'temps_ch1_plages',
    titre: 'Plages fixes et plages de souplesse',
    motsCles: ['plages fixes', 'plages souplesse', 'horaires variables', 'horaires flexibles', 'flexibilité', 'pause méridienne', 'pause déjeuner', '9h30', '12h', '14h', '16h30', '16h', '7h30', '19h', '45 minutes', 'lundi', 'jeudi', 'vendredi', 'présence obligatoire', 'horaires de travail'],
    source: 'temps',
    chapitre: 1,
    resume: 'Plages fixes: 9h30-12h et 14h-16h30 (16h vendredi). Souplesse: 7h30-9h30 et 16h30-19h. Pause 45min'
  },
  {
    id: 'temps_ch1_garanties',
    titre: 'Garanties minimales de repos',
    motsCles: ['repos quotidien', 'repos hebdomadaire', '11h', '11 heures', '35h', '35 heures', 'amplitude', '12h', '12 heures', '48h', '48 heures', '44h', 'nuit', '22h', '7h', '10 heures', 'durée maximale', 'pause', '20 minutes', '6 heures'],
    source: 'temps',
    chapitre: 1,
    resume: 'Repos: 11h/jour min, 35h/semaine consécutives. Amplitude max 12h. Durée max 48h/sem ou 44h sur 12 sem'
  },
  {
    id: 'temps_ch1_heures_sup',
    titre: 'Heures supplémentaires et complémentaires',
    motsCles: ['heures supplémentaires', 'heures sup', 'heures complémentaires', 'majoration', '25%', '27%', 'récupération', 'indemnisation', 'nuit', 'dimanche', 'jours fériés', '100%', '66%', '25 heures', '25h', 'catégorie B', 'catégorie C', 'temps non complet'],
    source: 'temps',
    chapitre: 1,
    resume: 'Heures sup: max 25h/mois, majorées 25% (1-14h) puis 27%. Nuit +100%, dimanche +66%. Récup ou paiement'
  },
  {
    id: 'temps_ch1_temps_partiel',
    titre: 'Temps partiel',
    motsCles: ['temps partiel', '50%', '60%', '70%', '80%', '90%', 'droit', 'autorisation', 'rémunération', 'retraite', 'surcotisation', 'temps partiel de droit', 'enfant', 'handicap', '85,72%', '91,42%', 'congé maternité', 'réintégration', 'temps partiel thérapeutique', 'mi-temps thérapeutique', 'carrière', 'avancement'],
    source: 'temps',
    chapitre: 1,
    resume: 'Quotités 50-90%. De droit (enfant <3 ans, handicap) ou sur autorisation. 80% payé 85,72%, 90% payé 91,42%'
  },
  {
    id: 'temps_ch1_solidarite',
    titre: 'Journée de solidarité',
    motsCles: ['solidarité', 'journée de solidarité', '7 heures', '7h', 'jour férié', 'RTT', 'proratisation', '2 minutes', 'fractionnée', 'temps partiel'],
    source: 'temps',
    chapitre: 1,
    resume: '7h supplémentaires fractionnées (2 min/jour), proratisées pour temps partiel'
  },
  {
    id: 'temps_ch1_astreintes',
    titre: 'Astreintes et permanences',
    motsCles: ['astreinte', 'astreintes', 'permanence', 'permanences', 'intervention', 'filière technique', 'indemnité', 'repos compensateur', 'week-end', 'samedi', 'dimanche', 'domicile', 'exploitation', 'décision', 'sécurité', '14 semaines', 'temps de trajet'],
    source: 'temps',
    chapitre: 1,
    resume: '3 types: exploitation, décision, sécurité. Max 14 semaines/an. Permanence = présence sur site week-end/férié'
  },
  {
    id: 'temps_ch1_sujetions',
    titre: 'Sujétions particulières (travail de nuit, dimanche)',
    motsCles: ['sujétions', 'travail de nuit', 'nuit', 'dimanche', 'jours fériés', 'compensation', 'pénibilité', '21 heures', '55 heures', '100 heures', '150 heures', '225 heures', '287 heures', '1 jour', '2 jours', '3 jours', '4 jours', '10 dimanches'],
    source: 'temps',
    chapitre: 1,
    resume: 'Compensation nuit: 1-4 jours selon volume (21-287h). Dimanche: 1-4 jours (min 10 dimanches travaillés)'
  },
  
  // Chapitre 2 : Les congés
  {
    id: 'temps_ch2_conges_annuels',
    titre: 'Congés annuels (CA)',
    motsCles: ['congés annuels', 'congé annuel', 'congés', 'vacances', '25 jours', 'CA', 'C.A', 'planning', 'estivaux', 'report', 'priorité', 'droit', 'combien', 'jours ouvrés', '22.5', '20', '17.5', '15', '12.5', 'prorata', 'fractionnement', '31 jours', 'consécutifs', 'pose congé', 'demande congé', '1er mars', '15 mars', 'délai', 'refus', 'contractuel'],
    source: 'temps',
    chapitre: 2,
    resume: '25 jours ouvrés/an (5j x 5 sem). Prorata selon temps travail. Estivaux: demande avant 1er mars. Max 31j consécutifs'
  },
  {
    id: 'temps_ch2_fractionnement',
    titre: 'Jours de fractionnement',
    motsCles: ['fractionnement', 'jours supplémentaires', 'bonification', '1 jour', '2 jours', '5 jours', '7 jours', '8 jours', 'janvier', 'avril', 'novembre', 'décembre', 'hiver'],
    source: 'temps',
    chapitre: 2,
    resume: '+1 jour si 5-7 CA pris jan-avr ou nov-déc, +2 jours si 8+ CA pris sur ces périodes'
  },
  {
    id: 'temps_ch2_conge_bonifie',
    titre: 'Congé bonifié (outre-mer)',
    motsCles: ['congé bonifié', 'outre-mer', 'DOM', 'Guadeloupe', 'Martinique', 'Réunion', 'Guyane', 'Mayotte', 'Saint Pierre', 'Miquelon', 'Saint Barthélémy', 'Saint Martin', '31 jours', '2 ans', 'métropole'],
    source: 'temps',
    chapitre: 2,
    resume: 'Pour fonctionnaires originaires DOM, tous les 2 ans, max 31 jours calendaires'
  },
  {
    id: 'temps_ch2_rtt',
    titre: 'Jours RTT / ARTT',
    motsCles: ['RTT', 'ARTT', 'A.R.T.T', 'réduction temps travail', '12 jours', '15 jours', '18 jours', '23 jours', 'décompte', 'maladie', 'absence', 'quotient', 'temps partiel', 'proratisé', '37h', '37.5h', '38h', '39h', '15 septembre', '50%', 'CET', 'jours de repos'],
    source: 'temps',
    chapitre: 2,
    resume: 'RTT: 12j (37h), 15j (37.5h), 18j (38h), 23j (39h). 50% pris avant 15/09. Réduit si maladie'
  },
  {
    id: 'temps_ch2_don_jours',
    titre: 'Don de jours de repos',
    motsCles: ['don jours', 'don de jours', 'enfant malade', 'enfant gravement malade', 'proche aidant', 'aidant familial', 'solidarité', 'anonyme', '5 jours', 'moins de 20 ans', 'handicap', 'accident', 'perte autonomie'],
    source: 'temps',
    chapitre: 2,
    resume: 'Don anonyme de RTT/CA (max 5j/an) pour collègue avec enfant malade <20 ans ou proche aidant'
  },
  {
    id: 'temps_ch2_cet',
    titre: 'Compte Épargne Temps (CET)',
    motsCles: ['CET', 'compte épargne temps', 'épargne', 'capitalisation', 'jours non pris', '5 jours', '1 an', 'service', 'ouverture', 'alimentation', 'stagiaire', 'titularisation', 'indemnisation'],
    source: 'temps',
    chapitre: 2,
    resume: 'Épargne max 5j CA + RTT/an, ouvert après 1 an de service. Pas pour stagiaires'
  },
  {
    id: 'temps_ch2_maternite',
    titre: 'Congé maternité',
    motsCles: ['maternité', 'congé maternité', 'grossesse', 'accouchement', 'prénatal', 'postnatal', '16 semaines', '26 semaines', '34 semaines', '46 semaines', 'jumeaux', 'triplés', 'couches pathologiques', '2 semaines', '4 semaines', 'déclaration', '4ème mois', 'plein traitement'],
    source: 'temps',
    chapitre: 2,
    resume: 'Durée: 16 sem (1er/2e enfant), 26 sem (3e+), 34 sem (jumeaux), 46 sem (triplés). Plein traitement'
  },
  {
    id: 'temps_ch2_paternite',
    titre: 'Congé paternité',
    motsCles: ['paternité', 'congé paternité', 'naissance', 'père', 'accueil enfant', '25 jours', '32 jours', '4 jours', '21 jours', '28 jours', '6 mois', 'calendaires', 'hospitalisation', 'naissance multiple'],
    source: 'temps',
    chapitre: 2,
    resume: '25 jours (32 si multiple): 4j obligatoires après naissance + 21j/28j dans les 6 mois'
  },
  
  // Chapitre 3 : Autorisations spéciales d'absence
  {
    id: 'temps_ch3_fetes_religieuses',
    titre: 'Fêtes religieuses',
    motsCles: ['fêtes religieuses', 'musulmane', 'juive', 'orthodoxe', 'bouddhiste', 'arménienne', 'Aïd', 'Aïd El Fitr', 'Aïd El Adha', 'Kippour', 'Yom Kippour', 'Roch Hachana', 'Al Mawlid'],
    source: 'temps',
    chapitre: 3,
    resume: 'Autorisation prioritaire de poser un congé pour fêtes: musulmanes (Aïd), juives (Kippour), orthodoxes...'
  },
  {
    id: 'temps_ch3_garde_enfant',
    titre: 'Garde d\\'enfant malade',
    motsCles: ['garde enfant', 'enfant malade', 'nourrice', 'nourrice malade', 'école fermée', 'crèche fermée', '6 jours', '12 jours', '16 ans', 'grève', 'parent seul', 'handicapé', 'justificatif', 'certificat médical', 'imprévue'],
    source: 'temps',
    chapitre: 3,
    resume: '6 jours/an (12 si parent seul), jusqu\\'aux 16 ans. Pour maladie enfant, nourrice malade, grève école'
  },
  {
    id: 'temps_ch3_soins_malade',
    titre: 'Soins ou assistance à un malade',
    motsCles: ['soins', 'malade', 'conjoint malade', 'ascendant', 'certificat médical', '5 jours', '3 jours', 'père', 'mère', 'parent', 'oncle', 'tante', 'neveu', 'nièce', 'beau-frère', 'belle-sœur', 'frère', 'sœur', 'enfant plus 16 ans'],
    source: 'temps',
    chapitre: 3,
    resume: '5 jours pour conjoint/parents/enfant +16 ans, 3 jours pour autres proches (sur certificat médical)'
  },
  {
    id: 'temps_ch3_proche_aidant',
    titre: 'Congé proche aidant (fin de vie)',
    motsCles: ['proche aidant', 'fin de vie', 'AJPA', 'allocation journalière', 'dépendance', 'handicap', 'non rémunéré', '3 mois', '1 an', 'APA', '80%', 'incapacité', 'CAF', 'pronostic vital', 'phase terminale', 'temps partiel'],
    source: 'temps',
    chapitre: 3,
    resume: 'Congé non rémunéré max 3 mois renouvelable (total 1 an). AJPA possible via CAF'
  },
  {
    id: 'temps_ch3_deces',
    titre: 'Décès d\\'un membre de la famille',
    motsCles: ['décès', 'obsèques', 'deuil', 'mort', 'conjoint', 'parent', 'enfant', 'beaux-parents', 'grands-parents', 'petits-enfants', 'frère', 'sœur', '5 jours', '14 jours', '12 jours', '3 jours', '1 jour', '8 jours', '25 ans', 'certificat de décès'],
    source: 'temps',
    chapitre: 3,
    resume: '5j conjoint/parents, 14j enfant <25 ans (+8j dans l\\'année), 12j enfant >25 ans sans enfant, 3j beaux-parents/grands-parents/frères'
  },
  {
    id: 'temps_ch3_mariage',
    titre: 'Mariage ou PACS',
    motsCles: ['mariage', 'PACS', 'union', 'cérémonie', '7 jours', '5 jours', '3 jours', '1 jour', 'acte de mariage', 'enfant', 'frère', 'sœur', 'neveu', 'nièce', 'consécutifs', 'non fractionnables'],
    source: 'temps',
    chapitre: 3,
    resume: '7 jours pour l\\'agent (5 si PACS), 3 jours enfant, 1 jour autres proches. Consécutifs autour de la cérémonie'
  },
  {
    id: 'temps_ch3_maternite_absence',
    titre: 'Absences liées à la grossesse/maternité',
    motsCles: ['grossesse', 'examens prénataux', 'accouchement sans douleur', 'psychoprophylactique', '1 heure par jour', '1h/jour', '3ème mois', 'troisième mois', 'demi-journée', 'aménagement horaires'],
    source: 'temps',
    chapitre: 3,
    resume: 'Examens prénataux (1/2 journée), 1h/jour dès le 3e mois, séances préparation accouchement'
  },
  {
    id: 'temps_ch3_consultation',
    titre: 'Consultation médicale',
    motsCles: ['consultation', 'rendez-vous médical', 'récupération', 'RQTH', '4 jours', '8 demi-journées', 'handicap', 'maladie grave', 'expertise', 'médecin expert', 'don du sang', 'don plaquettes', 'traitement hospitalier'],
    source: 'temps',
    chapitre: 3,
    resume: 'Absence autorisée mais récupérable, sauf RQTH/maladie grave (4j/an). Don sang autorisé'
  },
  {
    id: 'temps_ch3_rentree',
    titre: 'Rentrée scolaire',
    motsCles: ['rentrée scolaire', 'rentrée', 'école', 'maternelle', 'primaire', '6ème', 'sixième', '1 heure', 'accompagner enfant', 'facilité horaire'],
    source: 'temps',
    chapitre: 3,
    resume: 'Facilité d\\'1h le jour de la rentrée (maternelle, primaire, entrée en 6e)'
  },
  {
    id: 'temps_ch3_demenagement',
    titre: 'Déménagement',
    motsCles: ['déménagement', 'changement adresse', 'domicile', '1 jour', 'semaine précédant', 'semaine suivant', 'changement domicile'],
    source: 'temps',
    chapitre: 3,
    resume: '1 jour d\\'autorisation la semaine précédant ou suivant le déménagement (sur justificatif)'
  },
  {
    id: 'temps_ch3_concours',
    titre: 'Concours et examens professionnels',
    motsCles: ['concours', 'examen professionnel', 'épreuves', 'admissibilité', 'admission', '1 jour', '2 jours', 'convocation', 'fonction publique territoriale', 'catégorie A', 'catégorie B', 'catégorie C'],
    source: 'temps',
    chapitre: 3,
    resume: '1j avant admissibilité + 2j avant admission, une fois par an par concours/examen FPT'
  },
  {
    id: 'temps_ch3_jury_formateur',
    titre: 'Jury de concours et formateur externe',
    motsCles: ['jury', 'jury concours', 'formateur', 'formateur externe', 'colloques', '5 jours', '10 jours', 'cumul emploi', 'autorisation cumul', 'rémunération', 'mission'],
    source: 'temps',
    chapitre: 3,
    resume: '5j/an jury + 5j/an formateur externe (avec autorisation cumul emploi)'
  },
  {
    id: 'temps_ch3_representation',
    titre: 'Congé de représentation',
    motsCles: ['représentation', 'association', 'mutuelle', 'mandat', '9 jours', '12 jours', 'réunion', 'instance', 'politique'],
    source: 'temps',
    chapitre: 3,
    resume: '9 jours/an (jusqu\\'à 12j) pour représenter association/mutuelle auprès instances'
  },
  
  // Chapitre 4 : Maladies et accidents
  {
    id: 'temps_ch4_maladie',
    titre: 'Congé maladie ordinaire',
    motsCles: ['maladie', 'arrêt maladie', 'arrêt', 'carence', 'jour de carence', '48h', '48 heures', 'contrôle', 'contre-visite', 'CMO', 'volet', 'CPAM', 'certificat médical', 'transmission', 'GCR', 'absence injustifiée'],
    source: 'temps',
    chapitre: 4,
    resume: 'Transmission arrêt sous 48h à GCR. 1 jour de carence (3j si <4 mois ancienneté). Contre-visite possible'
  },
  {
    id: 'temps_ch4_accident',
    titre: 'Accident de service ou de trajet',
    motsCles: ['accident service', 'accident travail', 'accident trajet', 'déclaration', '48 heures', '15 jours', 'certificat médical', 'CNRACL', 'régime général', 'parcours habituel', 'lieu de travail', 'lésions'],
    source: 'temps',
    chapitre: 4,
    resume: 'Déclaration sous 48h (régime général) ou 15j (CNRACL). Certificat médical obligatoire. Plein traitement'
  },
  {
    id: 'temps_ch4_remuneration',
    titre: 'Prise en charge rémunération maladie',
    motsCles: ['rémunération', 'plein traitement', 'demi-traitement', 'CLM', 'congé longue maladie', 'CLD', 'congé longue durée', 'grave maladie', 'CGM', 'CNRACL', 'IRCANTEC', '3 mois', '9 mois', '1 an', '2 ans', '3 ans', '5 ans', 'indemnités journalières', 'ancienneté', 'contractuel'],
    source: 'temps',
    chapitre: 4,
    resume: 'Titulaire: maladie ordinaire 3 mois plein + 9 mois demi. CLM 1 an plein + 2 ans demi. CLD 3 ans plein + 2 ans demi'
  },

  // ============================================
  // FORMATION (formation.ts)
  // ============================================
  {
    id: 'formation_integration',
    titre: 'Formation d\\'intégration',
    motsCles: ['intégration', 'formation intégration', 'titularisation', '5 jours', '10 jours', 'catégorie A', 'catégorie B', 'catégorie C', 'CNFPT', 'stagiaire', 'nouvellement nommé', 'environnement territorial', 'statut', '1 an', 'dispense'],
    source: 'formation',
    resume: 'Obligatoire: 10 jours (cat A/B), 5 jours (cat C). Dans l\\'année suivant nomination. Conditionne titularisation'
  },
  {
    id: 'formation_professionnalisation',
    titre: 'Formation de professionnalisation',
    motsCles: ['professionnalisation', 'premier emploi', '1er emploi', 'carrière', 'tout au long', '5 jours', '10 jours', '3 jours', '2 jours', 'nouveau poste', 'poste à responsabilité', '2 ans', '5 ans', '6 mois', 'promotion interne'],
    source: 'formation',
    resume: '1er emploi: 5-10j (A/B), 3-10j (C) dans 2 ans. Carrière: 2-10j tous les 5 ans. Responsabilité: 3-10j dans 6 mois'
  },
  {
    id: 'formation_hygiene_securite',
    titre: 'Formations hygiène et sécurité',
    motsCles: ['sécurité', 'hygiène', 'habilitation', 'habilitation électrique', 'CACES', 'électrique', 'premiers secours', 'SST', 'gestes postures', 'HACCP', 'FIMO', 'conduite engins', 'formation obligatoire', 'poste de travail'],
    source: 'formation',
    resume: 'Formations obligatoires liées au poste: CACES, habilitation électrique, SST, HACCP, gestes/postures...'
  },
  {
    id: 'formation_concours',
    titre: 'Préparation concours et examens professionnels',
    motsCles: ['concours', 'examen professionnel', 'préparation', 'avancement', 'promotion', 'avancement de grade', 'changement cadre emploi', '12 mois', '8 jours', 'IEL', 'inscription'],
    source: 'formation',
    resume: 'Préparation via CNFPT. 12 mois entre 2 prépas similaires. Frais transport 75% + resto 14€'
  },
  {
    id: 'formation_rep',
    titre: 'Reconnaissance Expérience Professionnelle (REP)',
    motsCles: ['REP', 'reconnaissance', 'expérience', 'équivalence', 'diplôme', 'concours', 'sans diplôme', 'validation'],
    source: 'formation',
    resume: 'Permet accès aux concours sans diplôme requis si expérience équivalente reconnue'
  },
  {
    id: 'formation_cpf',
    titre: 'Compte Personnel de Formation (CPF)',
    motsCles: ['CPF', 'compte personnel formation', 'heures', '25 heures', '150 heures', '50 heures', '400 heures', 'diplôme', 'certification', 'diplômante', 'certifiante', 'plafond', 'portabilité', 'secteur privé', 'socle', 'savoirs de base', 'priorité'],
    source: 'formation',
    resume: '25h/an (plafond 150h). Cat C bas niveau: 50h/an (plafond 400h). Formations diplômantes ou certifiantes'
  },
  {
    id: 'formation_conge_pro',
    titre: 'Congé de formation professionnelle',
    motsCles: ['congé formation', 'congé formation professionnelle', '3 ans', '5 ans', '85%', 'traitement', 'projet professionnel', '90 jours', 'indemnité', '2778', 'catégorie C', 'handicap', 'usure professionnelle'],
    source: 'formation',
    resume: 'Max 3 ans sur carrière (5 ans cat C). Indemnité 85% du traitement la 1ère année (plafond 2778€)'
  },
  {
    id: 'formation_bilan',
    titre: 'Bilan de compétences',
    motsCles: ['bilan compétences', 'bilan', '24 heures', '72 heures', 'projet professionnel', 'reconversion', '5 ans', '3 ans', 'handicap', 'catégorie C', 'aptitudes', 'motivations'],
    source: 'formation',
    resume: '24h (72h si handicap/cat C). Renouvelable tous les 5 ans (3 ans si handicap/cat C)'
  },
  {
    id: 'formation_vae',
    titre: 'Validation des Acquis de l\\'Expérience (VAE)',
    motsCles: ['VAE', 'validation acquis', 'expérience', 'diplôme', '24 heures', '72 heures', 'congé VAE', 'certification', 'qualification'],
    source: 'formation',
    resume: '24h de congé (72h si handicap/cat C) pour obtenir diplôme via expérience professionnelle'
  },
  {
    id: 'formation_transition',
    titre: 'Congé de transition professionnelle',
    motsCles: ['transition professionnelle', 'reconversion', 'nouveau métier', '120 heures', '70 heures', '6000€', '1 an', 'certification', 'création entreprise', 'catégorie C', 'handicap', 'usure'],
    source: 'formation',
    resume: 'Max 1 an, formations ≥120h certifiantes. Frais pris en charge jusqu\\'à 6000€. Pour cat C/handicap/usure'
  },
  {
    id: 'formation_immersion',
    titre: 'Période d\\'immersion professionnelle',
    motsCles: ['immersion', 'immersion professionnelle', 'découverte métier', 'mobilité', '2 jours', '10 jours', '20 jours', '3 ans', 'convention tripartite', 'autre collectivité', 'observation'],
    source: 'formation',
    resume: '2 à 10 jours pour observer un autre métier, max 20j sur 3 ans. Convention tripartite'
  },
  {
    id: 'formation_syndicale',
    titre: 'Formation syndicale',
    motsCles: ['formation syndicale', 'syndicat', 'syndical', '12 jours', '12 jours ouvrables', 'représentant', 'organisation syndicale', '5%', 'effectif', '1 mois'],
    source: 'formation',
    resume: '12 jours ouvrables/an. Frais à charge du syndicat. Max 5% de l\\'effectif simultanément'
  },
  {
    id: 'formation_perfectionnement',
    titre: 'Formation de perfectionnement',
    motsCles: ['perfectionnement', 'compétences', 'développement', '70%', 'frais pédagogiques', 'demande agent', '12 mois', '8 jours', 'métier', 'poste'],
    source: 'formation',
    resume: 'Développer compétences liées au poste. 70% frais pédagogiques si demande de l\\'agent seul'
  },
  {
    id: 'formation_diplomante',
    titre: 'Formation diplômante ou qualifiante',
    motsCles: ['diplômante', 'qualifiante', 'diplôme', 'qualification', '70%', 'frais pédagogiques', 'plan formation', 'budget'],
    source: 'formation',
    resume: 'Formations diplômantes/qualifiantes. 70% frais pédagogiques si demande agent seul'
  },
  {
    id: 'formation_illettrisme',
    titre: 'Lutte contre l\\'illettrisme',
    motsCles: ['illettrisme', 'français', 'lecture', 'écriture', 'calcul', 'savoirs de base', 'apprentissage'],
    source: 'formation',
    resume: 'Formations pour réacquérir savoirs de base (lecture, écriture, calcul)'
  },
  {
    id: 'formation_cst',
    titre: 'Formation membres du CST',
    motsCles: ['CST', 'comité social territorial', 'membres', 'santé sécurité', 'conditions travail', '3 jours', '5 jours', 'prévention', 'risques professionnels'],
    source: 'formation',
    resume: '3 à 5 jours pour membres CST. Santé, sécurité, conditions de travail'
  },
  {
    id: 'formation_disponibilite_etudes',
    titre: 'Disponibilité pour études ou recherches',
    motsCles: ['disponibilité', 'disponibilité études', 'études', 'recherches', '3 ans', 'renouvelable', 'non rémunéré', 'sans rémunération', 'avancement'],
    source: 'formation',
    resume: 'Max 3 ans renouvelable une fois. Sans rémunération ni droits à avancement/retraite'
  },
  {
    id: 'formation_formateur_interne',
    titre: 'Formateur interne occasionnel',
    motsCles: ['formateur interne', 'formateur', 'expertise', 'expertise métier', 'RIFSEEP', 'déroulé pédagogique', 'formation de formateur', 'attestation'],
    source: 'formation',
    resume: 'Agents avec expertise métier. Formation de formateur requise. Rémunéré via RIFSEEP'
  },
  {
    id: 'formation_cec',
    titre: 'Compte d\\'Engagement Citoyen (CEC)',
    motsCles: ['CEC', 'compte engagement citoyen', 'bénévole', 'bénévolat', 'volontariat', 'service civique', 'réserve militaire', '240 euros', '20 heures', '720 euros', '60 heures'],
    source: 'formation',
    resume: '20h (240€) par activité bénévole éligible, plafond 60h (720€). Service civique, réserve...'
  },
  {
    id: 'formation_handicap',
    titre: 'Formations agents en situation de handicap',
    motsCles: ['handicap', 'RQTH', 'situation de handicap', 'aménagement', 'priorité', 'durée prolongée', '72 heures', '5 ans', '300 heures', 'inaptitude'],
    source: 'formation',
    resume: 'Accès prioritaire, durées prolongées (72h bilan/VAE), crédit CPF supplémentaire (300h)'
  },

  // ============================================
  // TÉLÉTRAVAIL (teletravail.ts)
  // ============================================
  {
    id: 'teletravail_principes',
    titre: 'Principes du télétravail',
    motsCles: ['télétravail', 'principes', 'volontariat', 'volontaire', 'réversibilité', 'confiance', 'management', 'déconnexion', 'droit déconnexion', 'bien-être', 'conciliation', 'vie privée', 'vie professionnelle', 'trajet', 'empreinte écologique'],
    source: 'teletravail',
    resume: 'Volontaire, réversible, droit à la déconnexion. Améliore bien-être et conciliation vie pro/perso'
  },
  {
    id: 'teletravail_eligibilite',
    titre: 'Éligibilité au télétravail',
    motsCles: ['éligibilité', 'éligible', 'métiers', 'compatible', 'exclus', 'catégorie A', 'catégorie B', 'catégorie C', 'titulaire', 'contractuel', 'animateurs', 'crèches', 'écoles', 'voie publique', 'confidentialité', 'contact public'],
    source: 'teletravail',
    resume: 'Ouvert à tous si fonctions compatibles. Exclus: contact public quotidien, voie publique, confidentialité papier'
  },
  {
    id: 'teletravail_quotite',
    titre: 'Quotité et forfait télétravail',
    motsCles: ['forfait', 'jours télétravail', '15 jours', '1 jour par semaine', '1 jour', '3 jours par mois', '3 jours', 'quotité', '2 jours', 'présence obligatoire', '3 jours sur site', 'jour fixe', 'semaine', 'combien de jours', 'temps partiel', 'proratisé', '80%'],
    source: 'teletravail',
    resume: '1 jour fixe/semaine + forfait 15 jours/an (max 3j/mois). Présence obligatoire 3j/semaine sur site'
  },
  {
    id: 'teletravail_demande',
    titre: 'Procédure de demande télétravail',
    motsCles: ['demande', 'demande télétravail', 'formulaire', 'autorisation', 'refus', 'entretien', 'entretien préalable', 'CAP', 'CCP', 'validation', 'responsable hiérarchique', 'autonomie', 'auto-évaluation', '5 jours', 'forfait'],
    source: 'teletravail',
    resume: 'Demande écrite + entretien préalable. Refus motivé contestable en CAP/CCP. Forfait validé 5j à l\\'avance'
  },
  {
    id: 'teletravail_materiel',
    titre: 'Matériel et équipement télétravail',
    motsCles: ['matériel', 'ordinateur', 'portable', 'PC', 'internet', 'haut débit', 'kit ergonomique', 'équipement', 'support dorsal', 'tapis souris', 'support PC', 'dysfonctionnement', 'panne', 'informatique'],
    source: 'teletravail',
    resume: 'Matériel fourni par la collectivité + kit ergonomique. Connexion internet haut débit requise'
  },
  {
    id: 'teletravail_lieu',
    titre: 'Lieu d\\'exercice du télétravail',
    motsCles: ['domicile', 'lieu', 'adresse', 'espace coworking', 'tiers lieu', 'résidence principale', 'autre domicile', 'bibliothèque', 'espace public numérique', 'changement adresse'],
    source: 'teletravail',
    resume: 'Domicile principal ou autre lieu déclaré. Espaces publics gratuits possibles (bibliothèque...)'
  },
  {
    id: 'teletravail_horaires',
    titre: 'Horaires et temps de travail en télétravail',
    motsCles: ['horaires', 'plages fixes', 'joignable', 'déconnexion', 'heures sup', 'heures supplémentaires', 'temps de travail', 'mêmes horaires', 'pause méridienne', 'charge de travail', 'égalité'],
    source: 'teletravail',
    resume: 'Mêmes horaires que sur site, plages fixes obligatoires. Pas d\\'heures sup. Charge de travail égale'
  },
  {
    id: 'teletravail_situations_particulieres',
    titre: 'Situations particulières (grossesse, aidants, handicap)',
    motsCles: ['grossesse', 'enceinte', 'femme enceinte', 'proche aidant', 'aidant', 'handicap', 'situation particulière', 'dérogation', '3 jours', 'au-delà', 'médecin travail', 'santé'],
    source: 'teletravail',
    resume: 'Dérogation possible au-delà de 3j/semaine pour femmes enceintes, aidants, handicap (avis médecin)'
  },
  {
    id: 'teletravail_exceptionnel',
    titre: 'Télétravail exceptionnel (pandémie, intempéries)',
    motsCles: ['exceptionnel', 'télétravail exceptionnel', 'pandémie', 'intempéries', 'circonstances exceptionnelles', 'PCA', 'plan continuité', 'continuité', 'catastrophe', 'crise', 'imposé', '24h', 'difficultés transport'],
    source: 'teletravail',
    resume: 'Peut être imposé en cas de crise (pandémie, catastrophe). Demande exceptionnelle possible sous 24h'
  },
  {
    id: 'teletravail_reversibilite',
    titre: 'Réversibilité et fin du télétravail',
    motsCles: ['réversibilité', 'fin', 'arrêt', 'fin télétravail', 'préavis', '1 mois', '2 mois', '15 jours', 'adaptation', 'période adaptation', 'non-renouvellement', 'interruption', 'changement fonctions'],
    source: 'teletravail',
    resume: 'Préavis 15j ou 1 mois (adaptation) / 2 mois après. Fin si changement de fonctions ou mauvaise exécution'
  },
  {
    id: 'teletravail_suspension',
    titre: 'Suspension du télétravail',
    motsCles: ['suspension', 'absence', 'jour férié', 'congé', 'report', 'pas de report', 'fermeture service', 'empêchement', 'impératifs opérationnels'],
    source: 'teletravail',
    resume: 'Pas de report si absence/férié coïncide avec jour télétravaillé. Suspension possible par l\\'administration'
  },
  {
    id: 'teletravail_frais',
    titre: 'Prise en charge des frais télétravail',
    motsCles: ['frais', 'indemnité', 'prise en charge', 'transport', '50%', 'abonnement', 'Navigo', 'électricité', 'internet', 'pas de prise en charge', 'installation électrique'],
    source: 'teletravail',
    resume: 'Pas d\\'indemnité spécifique. Transport remboursé 50% (inchangé). Pas de frais électricité/internet'
  }
];

/**
 * Fonction utilitaire pour rechercher dans le sommaire
 * Retourne les sections les plus pertinentes pour une question donnée
 */
export function rechercherDansSommaire(question: string, maxResults = 3): SectionIndex[] {
  const q = question.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  
  // Calculer un score pour chaque section
  const scored = sommaireUnifie.map(section => {
    let score = 0;
    
    // Vérifier les mots-clés (score élevé pour match exact)
    for (const motCle of section.motsCles) {
      const mcNorm = motCle.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
      if (q.includes(mcNorm)) {
        score += 10;
      }
      // Match partiel sur mots individuels
      const mots = mcNorm.split(' ');
      for (const mot of mots) {
        if (mot.length > 3 && q.includes(mot)) {
          score += 3;
        }
      }
    }
    
    // Vérifier le titre
    const titreNorm = section.titre.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
    if (q.includes(titreNorm)) {
      score += 15;
    }
    for (const mot of titreNorm.split(' ')) {
      if (mot.length > 3 && q.includes(mot)) {
        score += 2;
      }
    }
    
    // Vérifier le résumé
    if (section.resume) {
      const resumeNorm = section.resume.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
      for (const mot of resumeNorm.split(' ')) {
        if (mot.length > 4 && q.includes(mot)) {
          score += 1;
        }
      }
    }
    
    return { section, score };
  });
  
  // Trier par score décroissant et retourner les meilleurs
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.section);
}

/**
 * Génère un prompt compact du sommaire pour l'API (étape 1)
 * ~500 tokens au lieu de ~15000 pour les docs complètes
 */
export function genererPromptSommaire(): string {
  const lines: string[] = ['SOMMAIRE DES DOCUMENTS INTERNES - MAIRIE DE GENNEVILLIERS\\n'];
  
  let currentSource = '';
  for (const section of sommaireUnifie) {
    if (section.source !== currentSource) {
      currentSource = section.source;
      const sourceLabel = {
        temps: '\\n📅 TEMPS DE TRAVAIL ET CONGÉS',
        formation: '\\n🎓 FORMATION',
        teletravail: '\\n🏠 TÉLÉTRAVAIL'
      }[currentSource];
      if (sourceLabel) {
        lines.push(sourceLabel);
      }
    }
    
    lines.push(`• [${section.id}] ${section.titre}`);
    if (section.resume) {
      lines.push(`  → ${section.resume}`);
    }
  }
  
  return lines.join('\\n');
}
'''

# Statistiques
def count_sections():
    import re
    sections = re.findall(r"id: '([^']+)'", SOMMAIRE_AMELIORE)
    temps = [s for s in sections if s.startswith('temps_')]
    formation = [s for s in sections if s.startswith('formation_')]
    teletravail = [s for s in sections if s.startswith('teletravail_')]
    
    print("=" * 60)
    print("STATISTIQUES DU SOMMAIRE AMÉLIORÉ")
    print("=" * 60)
    print(f"Total sections: {len(sections)}")
    print(f"  - Temps de travail: {len(temps)} sections")
    print(f"  - Formation: {len(formation)} sections")  
    print(f"  - Télétravail: {len(teletravail)} sections")
    print()
    
    # Compter les mots-clés
    mots_cles = re.findall(r"motsCles: \[([^\]]+)\]", SOMMAIRE_AMELIORE)
    total_mc = sum(len(mc.split(',')) for mc in mots_cles)
    print(f"Total mots-clés: ~{total_mc}")
    print(f"Moyenne par section: ~{total_mc // len(sections)} mots-clés")
    print()
    
    print("NOUVELLES SECTIONS AJOUTÉES:")
    nouvelles = [
        'temps_ch2_fractionnement - Jours de fractionnement',
        'temps_ch3_concours - Concours et examens professionnels',
        'temps_ch3_jury_formateur - Jury de concours et formateur externe',
        'temps_ch3_representation - Congé de représentation',
        'formation_illettrisme - Lutte contre illettrisme',
        'formation_cst - Formation membres du CST',
        'formation_cec - Compte Engagement Citoyen',
        'formation_handicap - Formations agents handicap',
        'teletravail_suspension - Suspension du télétravail',
        'teletravail_frais - Prise en charge frais'
    ]
    for n in nouvelles:
        print(f"  + {n}")
    print()
    
    print("AMÉLIORATIONS CLÉS:")
    print("  ✓ Mots-clés enrichis avec variantes (ex: '25 jours', '25j', 'CA', 'C.A')")
    print("  ✓ Ajout de chiffres clés dans les mots-clés (ex: '48h', '85%', '6000€')")
    print("  ✓ Résumés plus précis avec valeurs numériques")
    print("  ✓ Meilleure couverture des questions fréquentes")
    print("  ✓ Séparation maternité/paternité en 2 sections")
    print("  ✓ Ajout sections manquantes (fractionnement, CEC, CST...)")

if __name__ == '__main__':
    count_sections()
    
    # Écrire le nouveau sommaire
    output_path = '../src/data/sommaire-ameliore.ts'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(SOMMAIRE_AMELIORE)
    print(f"\n✅ Nouveau sommaire écrit dans: {output_path}")
    print("\nPour appliquer, renommer en sommaire.ts")
