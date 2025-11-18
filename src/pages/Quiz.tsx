import { useState, useEffect } from 'react';
import { faqData } from '../data/FAQdata';

interface QuizProps {
  onBack?: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

// Build quiz questions from the FAQ data: take the FAQ question as the quiz question
// and use a short first-sentence excerpt of the FAQ answer as the correct option.
// Distractors are pulled from other FAQ answers.
const extractShort = (text: string) => {
  if (!text) return 'Voir la FAQ';
  const clean = text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  const parts = clean.split(/[\.\n\!\?]+/).map(p => p.trim()).filter(Boolean);
  return parts.length ? parts[0].slice(0, 140) : clean.slice(0, 140);
};

// helper: tokenize text (simple French-friendly tokenizer)
const stopwords = new Set([
  'le','la','les','de','des','du','un','une','et','à','a','en','pour','par','sur','dans','ne','pas','que','qui','se','au','aux','est','sont','avec','ou','son','sa','ses','ce','cette','ces','plus','moins','d','l','lors','chez','entre','comme','aujourd','hui'
]);

const tokenize = (s: string) => {
  return s
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(Boolean)
    .filter(w => !stopwords.has(w));
};

const similarityScore = (a: string, b: string) => {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  ta.forEach((w) => { if (tb.has(w)) common++; });
  // Jaccard-like score
  const union = new Set([...ta, ...tb]).size;
  return common / union;
};

// Build a pool of short excerpts with refs back to their faq index and category
const excerpts = faqData.map((f, i) => ({
  idx: i,
  text: extractShort(f.answer),
  category: f.category || 'general'
})).filter(e => e.text && e.text.length > 0);

// Custom override for question 10 (index 9)
const CUSTOM_Q10 = {
  question: "Combien de fois peut-on me refuser ma formation ?",
  answer: "On ne peut pas te refuser plus de deux fois la même formation sans avis de la commission paritaire compétente."
};

const pickDistractors = (sourceIdx: number, needed = 3) => {
  const source = excerpts.find(e => e.idx === sourceIdx);
  if (!source) return [] as string[];

  // candidates exclude the source exact text
  const candidates = excerpts.filter(e => e.idx !== sourceIdx && e.text !== source.text);

  // 1) prefer same category
  const sameCat = candidates.filter(c => c.category === source.category);

  // score them by similarity to the source text
  // Try to generate numeric / strong-similarity synthetic distractors first
  const generateNumericVariants = (text: string, count: number) => {
    const variants: string[] = [];
    // find numbers of 2-4 digits (years/hours) and small numbers (hours per week)
    const nums = Array.from(text.matchAll(/\d{1,4}/g)).map(m => ({ raw: m[0], idx: m.index ?? 0 }));
    if (nums.length === 0) return variants;

    // helper to replace nth occurrence
    const replaceNth = (s: string, n: number, newVal: string) => {
      let i = 0;
      return s.replace(/\d{1,4}/g, (m) => {
        i++;
        return (i === n) ? newVal : m;
      });
    };

    // common numeric tweaks
    const commonReplacements = [
      (v: number) => Math.max(1, Math.round(v * 0.9)),
      (v: number) => Math.round(v * 1.1),
      (v: number) => v + 100,
      (v: number) => Math.max(1, v - 100),
      (v: number) => v + 500,
      (v: number) => Math.max(1, v - 500),
    ];

    // also some fixed plausible alternatives
    const fixedAlternatives = [1500, 2500, 1800, 2000, 1200];

    // create variants by changing each numeric token
    for (let ni = 0; ni < nums.length && variants.length < count * 3; ni++) {
      const nRaw = nums[ni].raw;
      const nVal = parseInt(nRaw, 10);
      if (Number.isNaN(nVal)) continue;

      // apply percent/offset tweaks
      for (const fn of commonReplacements) {
        const newNum = fn(nVal);
        const candidate = replaceNth(text, ni + 1, String(newNum));
        if (candidate !== text && !variants.includes(candidate)) variants.push(candidate);
        if (variants.length >= count) break;
      }

      if (variants.length >= count) break;

      // try fixed alternatives
      for (const alt of fixedAlternatives) {
        const candidate = replaceNth(text, ni + 1, String(alt));
        if (candidate !== text && !variants.includes(candidate)) variants.push(candidate);
        if (variants.length >= count) break;
      }
    }

    // if still few, generate cross-combinations of replacing multiple tokens
    if (variants.length < count && nums.length >= 2) {
      const first = parseInt(nums[0].raw, 10);
      const second = parseInt(nums[1].raw, 10);
      const combos = [
        [Math.round(first * 0.9), Math.round(second * 1.1)],
        [Math.round(first * 1.2), Math.round(second * 0.8)],
      ];
      for (const c of combos) {
        let candidate = text;
        // replace sequentially
        candidate = replaceNth(candidate, 1, String(c[0]));
        candidate = replaceNth(candidate, 2, String(c[1]));
        if (candidate !== text && !variants.includes(candidate)) variants.push(candidate);
        if (variants.length >= count) break;
      }
    }

    return variants.slice(0, count);
  };

  // generate variants that are textually close: change number words, swap small phrases
  const generateCloseVariants = (text: string, count: number) => {
    const variants: string[] = [];

    const wordNums: Record<string, string[]> = {
      un: ['une','1','une fois'],
      une: ['un','1','une fois'],
      deux: ['1','3','trois'],
      trois: ['2','4','quatre'],
      '0': ['aucune','zéro','aucun'],
      quelques: ['plusieurs','quelquefois']
    };

    // replace number words with close alternatives
    const numWordRegex = /\b(un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|aucune|aucun|quelques|plusieurs)\b/gi;
    const foundNums = Array.from(text.matchAll(numWordRegex)).map(m => m[0]);
    for (const fn of foundNums) {
      const lower = fn.toLowerCase();
      const alts = (wordNums as any)[lower] || ['1','2','3'];
      for (const alt of alts) {
        const candidate = text.replace(new RegExp(fn, 'g'), alt);
        if (candidate !== text && !variants.includes(candidate)) variants.push(candidate);
        if (variants.length >= count) break;
      }
      if (variants.length >= count) break;
    }

    if (variants.length < count) {
      // phrase-level paraphrases
      const phraseSwaps: [RegExp, string[]][] = [
        [ /sans avis de la commission paritaire compétente/gi, [ 'avec avis de la commission paritaire compétente', 'sans avis formel', 'après avis de la DRH' ] ],
        [ /commission paritaire compétente/gi, [ 'commission paritaire', 'direction des ressources humaines', 'instance compétente' ] ],
        [ /sans avis/gi, [ 'avec avis', 'après avis', 'sans décision' ] ]
      ];

      for (const [rx, subs] of phraseSwaps) {
        if (rx.test(text)) {
          for (const s of subs) {
            const cand = text.replace(rx, s);
            if (cand !== text && !variants.includes(cand)) variants.push(cand);
            if (variants.length >= count) break;
          }
        }
        if (variants.length >= count) break;
      }
    }

    // fallback: small negation/number tweaks
    const fallbackCandidates = [
      text.replace(/\bne\s+peut pas\b/gi, 'peut'),
      text + ' (sous conditions)',
      text.replace(/la même formation/gi, 'une formation similaire')
    ].filter(Boolean) as string[];
    for (const f of fallbackCandidates) {
      if (variants.length >= count) break;
      if (f !== text && !variants.includes(f)) variants.push(f);
    }

    return variants.slice(0, count);
  };

  // prioritize close paraphrase-like variants (including number-word swaps)
  const closeVariants = generateCloseVariants(source.text, needed);
  const synthetic = [...closeVariants, ...generateNumericVariants(source.text, needed)].filter(s => s !== source.text);

  const scored = candidates.map(c => ({
    ...c,
    // boost same-category before sorting
    score: similarityScore(source.text, c.text) * (c.category === source.category ? 1.25 : 1)
  })).sort((a, b) => b.score - a.score);

  const picked: string[] = [];

  // use synthetic numeric distractors first (these are aggressive and close)
  for (const s of synthetic) {
    if (picked.length >= needed) break;
    if (!picked.includes(s) && s !== source.text) picked.push(s);
  }

  // take from same category top-scoring next
  if (sameCat.length) {
    const sameScored = scored.filter(s => s.category === source.category);
    for (const s of sameScored) {
      if (picked.length >= needed) break;
      if (!picked.includes(s.text)) picked.push(s.text);
    }
  }

  // then take top-scoring from other categories
  for (const s of scored) {
    if (picked.length >= needed) break;
    if (!picked.includes(s.text)) picked.push(s.text);
  }

  // if still not enough, fill randomly (but similar length)
  if (picked.length < needed) {
    const remaining = candidates.map(c => c.text).filter(t => !picked.includes(t));
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    for (const t of remaining) {
      if (picked.length >= needed) break;
      picked.push(t);
    }
  }

  return picked.slice(0, needed);
};



const INITIAL_QUESTIONS: Question[] = faqData.slice(0, 10).map((f, idx) => {
  const sourceAnswer = idx === 9 ? CUSTOM_Q10.answer : f.answer;
  const correctFinal = extractShort(sourceAnswer);
  let opts: string[] = [];
  let correctIndex = 0;

  if (idx === 9) {
    // explicit options ordered as requested (correct answer is the 4th)
    opts = [
      "On ne peut pas te refuser plus de 4 fois la même formation sans avis de la commission paritaire compétente",
      "On ne peut pas te refuser plus de 3 fois la même formation sans avis de la commission paritaire compétente",
      "On ne peut pas te refuser plus de 1 fois la même formation sans avis de la commission paritaire compétente",
      "On ne peut pas te refuser plus de deux fois la même formation sans avis de la commission paritaire compétente"
    ];
    correctIndex = 3;
  } else if (idx === 0) {
    // explicit options for 'J'ai droit à combien de jours de forfait ?' (faq slice index 0)
    opts = [
      "À la mairie de Gennevilliers, le forfait télétravail annuel est de 14 jours par an, à utiliser dans la limite de 3 jours maximum par mois",
      "À la mairie de Gennevilliers, le forfait télétravail annuel est de 17 jours par an, à utiliser dans la limite de 3 jours maximum par mois",
      "À la mairie de Gennevilliers, le forfait télétravail annuel est de 15 jours par an, à utiliser dans la limite de 3 jours maximum par mois (sous conditions)",
      "À la mairie de Gennevilliers, le forfait télétravail annuel est de 15 jours par an, à utiliser dans la limite de 4 jours maximum par mois"
    ];
    correctIndex = 2; // third option is correct (15 jours, sous conditions)
  } else if (idx === 1) {
    // explicit options for 'Je peux mettre combien de jours dans mon CET ?' (faq slice index 1)
    opts = [
      "Tu peux mettre au maximum 6 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT",
      "Tu peux mettre au maximum 105 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT",
      "Tu peux mettre au maximum 10 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT",
      "Tu peux mettre au maximum 5 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT"
    ];
    correctIndex = 3; // fourth option is correct (5 jours)
  } else if (idx === 2) {
    // explicit options for 'Quelle est la durée légale du temps de travail ?' (faq slice index 2)
    opts = [
      "La durée légale du temps de travail est de 1768 heures par an, répartie sur la base de 35 heures par semaine",
      "La durée légale du temps de travail est de 1607 heures par an, répartie sur la base de 35 heures par semaine",
      "La durée légale du temps de travail est de 1446 heures par an, répartie sur la base de 35 heures par semaine",
      "La durée légale du temps de travail est de 1600 heures par an, répartie sur la base de 35 heures par semaine"
    ];
    correctIndex = 1; // second option is correct (1607 heures)
  } else if (idx === 6) {
    // explicit options for 'Qu'est-ce que la journée de solidarité ?' (faq slice index 6 in the slice)
    opts = [
      "La journée de solidarité représente 7 heures de travail supplémentaires par an (sous conditions)",
      "La journée de solidarité représente 8 heures de travail supplémentaires par an",
      "La journée de solidarité représente 6 heures de travail supplémentaires par an",
      "La journée de solidarité représente 7,36 heures de travail supplémentaires par an"
    ];
    correctIndex = 0; // first option is correct (7 heures)
  } else if (idx === 7) {
    // explicit options for 'Combien de jours de congés annuels ai-je droit ?' (faq slice index 7)
    opts = [
      "Vous avez droit à 23 jours ouvrés de congés annuels par an (soit 5 semaines)",
      "Vous avez droit à 28 jours ouvrés de congés annuels par an (soit 5 semaines)",
      "Vous avez droit à 25 jours ouvrés de congés annuels par an (soit 5 semaines)",
      "Vous avez droit à 24 jours ouvrés de congés annuels par an (soit 5 semaines)"
    ];
    correctIndex = 2; // third option is correct (25 jours)
  } else if (idx === 3) {
      // explicit options for 'Comment fonctionnent les plages fixes et les plages de souplesse ?' (faq slice index 3)
      opts = [
        "Les plages fixes sont des périodes où la présence est obligatoire pour tous les agents — les plages de souplesse laissent le choix (flexibilité)",
        "Les plages fixes sont des périodes où la présence est optionelle pour tous les agents",
        "Les plages de souplesse sont des périodes où la présence est aux choix pour tous les agents",
        "Les plages de souplesse sont des périodes où la présence est obligatoire pour tous les agents"
      ];
      correctIndex = 0; // combined option is correct
    } else if (idx === 4) {
      // explicit options for 'Quelles sont les conditions pour bénéficier du temps partiel ?' (faq slice index 4)
      opts = [
        "Le temps partiel peut être accordé de droit ou sur autorisation selon les situations",
        "Le temps partiel peut être accordé de droit uniquement pour les femmes.",
        "Le temps partiel peut être accordé sur autorisation pour se reposer",
        "Le temps partiel peut être accordé de droit ou sur autorisation a 40 %"
      ];
      correctIndex = 0; // first option is correct
    } else if (idx === 5) {
      // explicit options for 'Comment sont rémunérées les heures supplémentaires ?' (faq slice index 5)
      opts = [
        "Les heures supplémentaires sont rémunérées uniquement les 15 premieres",
        "Les heures supplémentaires sont rémunérées uniquement si elles sont effectuées à la demande de la hiérarchie.",
        "Les heures supplémentaires sont rémunérées uniquement si vous le demandez",
        "Les heures supplémentaires sont rémunérées uniquement si votre indice est en dessous de 545"
      ];
      correctIndex = 1; // second option is correct (à la demande de la hiérarchie)
    } else if (idx === 8) {
      // explicit options for 'Comment fonctionnent les jours d'ARTT ?' (faq slice index 8)
      opts = [
        "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser le fait de travailler week-end",
        "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser le fait de travailler trop tard",
        "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser la fatigue",
        "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser le fait de depasser les 35h",
        "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des heures de repos attribuées pour compenser le fait de travailler 5 jours / semaine"
      ];
      correctIndex = 3; // fourth option (annualisation) is correct
    } else {
    const distractors = pickDistractors(idx, 3);
    opts = [correctFinal, ...distractors];
    // shuffle options
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    correctIndex = opts.findIndex(o => o === correctFinal);
  }
  const questionText = idx === 9 ? CUSTOM_Q10.question : f.question;
  return { id: idx + 1, question: questionText, options: opts, correctIndex } as Question;
});

export default function Quiz({ onBack }: QuizProps) {
  const [index, setIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(INITIAL_QUESTIONS.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  // helper to regenerate options for questions starting at startIdx (0-based)
  const regenerateFrom = (startIdx: number) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i < startIdx) return q;
      const faqIdx = i; // maps directly to faqData index as we sliced 0..9
      if (i === 9) {
        const opts = [
          "On ne peut pas te refuser plus de 4 fois la même formation sans avis de la commission paritaire compétente",
          "On ne peut pas te refuser plus de 3 fois la même formation sans avis de la commission paritaire compétente",
          "On ne peut pas te refuser plus de 1 fois la même formation sans avis de la commission paritaire compétente",
          "On ne peut pas te refuser plus de deux fois la même formation sans avis de la commission paritaire compétente"
        ];
        const correctIndex = 3;
        const questionText = CUSTOM_Q10.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
      // fixed options for 'journée de solidarité' question (faq slice index 6)
      if (i === 6) {
        const opts = [
          "La journée de solidarité représente 7 heures de travail supplémentaires par an (sous conditions)",
          "La journée de solidarité représente 8 heures de travail supplémentaires par an",
          "La journée de solidarité représente 6 heures de travail supplémentaires par an",
          "La journée de solidarité représente 7,36 heures de travail supplémentaires par an"
        ];
        const correctIndex = 0;
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
        // fixed options for 'h.eures supplémentaires' question (faq slice index 5)
    if (i === 5) {
          const opts = [
            "Les heures supplémentaires sont rémunérées uniquement les 15 premieres",
            "Les heures supplémentaires sont rémunérées uniquement si elles sont effectuées à la demande de la hiérarchie.",
            "Les heures supplémentaires sont rémunérées uniquement si vous le demandez",
            "Les heures supplémentaires sont rémunérées uniquement si votre indice est en dessous de 545"
          ];
          const correctIndex = 1;
          const questionText = faqData[faqIdx].question || q.question;
          return { ...q, question: questionText, options: opts, correctIndex } as Question;
        }
        // fixed options for 'plages fixes / plages de souplesse' question (faq slice index 3)
      if (i === 3) {
        const opts = [
          "Les plages fixes sont des périodes où la présence est obligatoire pour tous les agents — les plages de souplesse laissent le choix (flexibilité)",
          "Les plages fixes sont des périodes où la présence est optionelle pour tous les agents",
          "Les plages de souplesse sont des périodes où la présence est aux choix pour tous les agents",
          "Les plages de souplesse sont des périodes où la présence est obligatoire pour tous les agents"
        ];
        const correctIndex = 0;
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
  // fixed options for 'ARTT' question (faq slice index 8)
      if (i === 8) {
        const opts = [
          "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser le fait de travailler week-end",
          "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser le fait de travailler trop tard",
          "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser la fatigue",
          "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des journées de repos attribuées pour compenser le fait de depasser les 35h",
          "Les jours d'ARTT (Aménagement et Réduction du Temps de Travail) sont des heures de repos attribuées pour compenser le fait de travailler 5 jours / semaine"
        ];
        const correctIndex = 3; // annualisation
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
      // fixed options for 'forfait télétravail' question (faq slice index 0)
      if (i === 0) {
        const opts = [
          "À la mairie de Gennevilliers, le forfait télétravail annuel est de 14 jours par an, à utiliser dans la limite de 3 jours maximum par mois",
          "À la mairie de Gennevilliers, le forfait télétravail annuel est de 17 jours par an, à utiliser dans la limite de 3 jours maximum par mois",
          "À la mairie de Gennevilliers, le forfait télétravail annuel est de 15 jours par an, à utiliser dans la limite de 3 jours maximum par mois (sous conditions)",
          "À la mairie de Gennevilliers, le forfait télétravail annuel est de 15 jours par an, à utiliser dans la limite de 4 jours maximum par mois"
        ];
        const correctIndex = 2; // third option is correct (15 jours, sous conditions)
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
      // fixed options for 'durée légale du travail' question (faq slice index 2)
      if (i === 2) {
        const opts = [
          "La durée légale du temps de travail est de 1768 heures par an, répartie sur la base de 35 heures par semaine",
          "La durée légale du temps de travail est de 1607 heures par an, répartie sur la base de 35 heures par semaine",
          "La durée légale du temps de travail est de 1446 heures par an, répartie sur la base de 35 heures par semaine",
          "La durée légale du temps de travail est de 1600 heures par an, répartie sur la base de 35 heures par semaine"
        ];
        const correctIndex = 1; // second option is correct (1607 heures)
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
      // fixed options for 'temps partiel' question (faq slice index 4)
      if (i === 4) {
        const opts = [
          "Le temps partiel peut être accordé de droit ou sur autorisation selon les situations",
          "Le temps partiel peut être accordé de droit uniquement pour les femmes.",
          "Le temps partiel peut être accordé sur autorisation pour se reposer",
          "Le temps partiel peut être accordé de droit ou sur autorisation a 40 %"
        ];
        const correctIndex = 0; // first option is correct
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
      // fixed options for CET question (faq slice index 1)
      if (i === 1) {
        const opts = [
          "Tu peux mettre au maximum 6 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT",
          "Tu peux mettre au maximum 105 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT",
          "Tu peux mettre au maximum 10 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT",
          "Tu peux mettre au maximum 5 jours de congés annuels et 2 jours de fractionnement ainsi que 50 % des jours de RTT"
        ];
        const correctIndex = 3; // fourth option is correct (5 jours)
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
      // fixed options for 'congés annuels' question (faq slice index 7)
      if (i === 7) {
        const opts = [
          "Vous avez droit à 23 jours ouvrés de congés annuels par an (soit 5 semaines)",
          "Vous avez droit à 28 jours ouvrés de congés annuels par an (soit 5 semaines)",
          "Vous avez droit à 25 jours ouvrés de congés annuels par an (soit 5 semaines)",
          "Vous avez droit à 24 jours ouvrés de congés annuels par an (soit 5 semaines)"
        ];
        const correctIndex = 2; // third option is correct (25 jours)
        const questionText = faqData[faqIdx].question || q.question;
        return { ...q, question: questionText, options: opts, correctIndex } as Question;
      }
      const sourceAnswer = faqData[faqIdx].answer;
      const correct = extractShort(sourceAnswer);
      const distractors = pickDistractors(faqIdx, 3);
      const opts = [correct, ...distractors];
      for (let k = opts.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [opts[k], opts[j]] = [opts[j], opts[k]];
      }
      const correctIndex = opts.findIndex(o => o === correct);
      const questionText = faqData[faqIdx].question || q.question;
      return { ...q, question: questionText, options: opts, correctIndex } as Question;
    }));
  };

  // On mount, regenerate answers starting from question 4 (index 3)
  useEffect(() => {
    regenerateFrom(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectOption = (opt: number) => {
    setAnswers((a) => {
      const copy = [...a];
      copy[index] = opt;
      return copy;
    });
  };

  const next = () => {
    if (index < questions.length - 1) setIndex(index + 1);
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const submit = () => {
    setSubmitted(true);
  };

  const restart = () => {
    setAnswers(Array(questions.length).fill(null));
    setIndex(0);
    setSubmitted(false);
  };

  const score = answers.reduce((acc: number, ans, i) => (ans === questions[i].correctIndex ? acc + 1 : acc), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-extrabold">QUIZZ</h1>
          <p className="text-sm text-gray-600">10 questions à choix multiple — obtenez votre score à la fin</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200">Retour</button>
          <button onClick={restart} className="px-3 py-1 rounded-full bg-orange-600 text-white hover:bg-orange-700">Recommencer</button>
        </div>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Question {index + 1} / {questions.length}</div>
            <div className="text-sm text-gray-500">Progression: {Math.round(((index + 1) / questions.length) * 100)}%</div>
          </div>

          <h2 className="text-lg font-semibold mb-4">{questions[index].question}</h2>
          <div className="grid gap-3">
            {questions[index].options.map((opt: string, i: number) => {
              const checked = answers[index] === i;
              return (
                <label key={i} className={`block cursor-pointer rounded-md p-3 border ${checked ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                  <input type="radio" name={`q-${index}`} checked={checked} onChange={() => selectOption(i)} className="mr-3" />
                  <span className="align-middle">{opt}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={prev} disabled={index === 0} className="px-3 py-2 rounded bg-white border disabled:opacity-50">Précédent</button>
              <button onClick={next} disabled={index === questions.length - 1} className="px-3 py-2 rounded bg-white border disabled:opacity-50">Suivant</button>
            </div>
            <div>
              {index === questions.length - 1 ? (
                <button onClick={submit} disabled={answers[index] === null || answers.includes(null)} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">Terminer et voir le score</button>
              ) : (
                <button onClick={() => setIndex(index + 1)} disabled={answers[index] === null} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">Valider et continuer</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold mb-2">Résultat</h3>
          <p className="mb-4">Vous avez obtenu <span className="font-extrabold text-orange-600">{score}</span> / {questions.length} bonnes réponses.</p>

          <div className="space-y-3">
            {questions.map((q: Question, i: number) => {
              const user = answers[i];
              const correct = q.correctIndex;
              const isGood = user === correct;
              return (
                <div key={q.id} className="p-3 border rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{i + 1}. {q.question}</div>
                      <div className="text-sm mt-1">
                        Votre réponse: <span className={`${isGood ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}`}>{user !== null ? q.options[user] : '—'}</span>
                      </div>
                      {!isGood && (
                        <div className="text-sm mt-1">Bonne réponse: <span className="text-green-700 font-semibold">{q.options[correct]}</span></div>
                      )}
                    </div>
                    <div className={`ml-4 shrink-0 rounded-full w-9 h-9 flex items-center justify-center ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isGood ? '✓' : '✕'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={restart} className="px-4 py-2 rounded bg-orange-600 text-white">Refaire le quizz</button>
            {onBack && <button onClick={onBack} className="px-4 py-2 rounded bg-slate-100 border">Retour au menu</button>}
          </div>
        </div>
      )}
    </div>
  );
}
