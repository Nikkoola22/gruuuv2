import type React from "react";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";

// Déclarations TypeScript pour la reconnaissance vocale
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import {
  Clock,
  GraduationCap,
  Users,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Send,
  ArrowLeft,
  Home,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Mic,
  MicOff,
  TrendingUp,
  Shield,
  CheckCircle,
  Zap,
} from "lucide-react";

import { sommaire } from "./data/sommaire.ts";
import { chapitres } from "./data/temps.ts";
import { formation } from "./data/formation.ts";
import { teletravailData } from "./data/teletravail.ts";
import { infoItems as defaultInfoItems } from "./data/info-data.ts";
import { podcastEpisodes, type PodcastEpisode } from "./data/podcasts/mp3.ts";
import LoginModal from "./components/LoginModal";
import FAQ from "./pages/FAQ";
import Quiz from "./pages/Quiz";
import Calculateurs from "./pages/Calculateurs";
import Snow from "./components/Snow";

interface ChatMessage {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface InfoItem {
  id: number;
  title: string;
  content: string;
}

interface ChatbotState {
  currentView: "menu" | "chat" | "public" | "quiz";
  selectedDomain: number | null;
  messages: ChatMessage[];
  isProcessing: boolean;
}

const API_KEY = import.meta.env.VITE_APP_PERPLEXITY_KEY;
const API_URL = "https://api.perplexity.ai/chat/completions";

// Fonction pour nettoyer les chaînes de caractères
const nettoyerChaine = (chaine: string): string => {
  return chaine
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Parser les données du sommaire
const sommaireData = JSON.parse(sommaire);

const actualitesSecours = [
  { title: "Réforme des retraites : nouvelles négociations prévues", link: "#", pubDate: new Date().toISOString(), guid: "1" },
  { title: "Budget 2026 : les principales mesures votées", link: "#", pubDate: new Date().toISOString(), guid: "2" },
  { title: "Fonction publique : accord sur les salaires", link: "#", pubDate: new Date().toISOString(), guid: "3" },
  { title: "Télétravail : nouvelles directives gouvernementales", link: "#", pubDate: new Date().toISOString(), guid: "4" },
  { title: "Dialogue social : rencontre avec les syndicats", link: "#", pubDate: new Date().toISOString(), guid: "5" },
];

const NewsTicker: React.FC = () => {
  const [actualites, setActualites] = useState(actualitesSecours);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chargerFlux = async () => {
      try {
        // Utilise le proxy CORS corsproxy.io qui fonctionne en production
        const feedUrl = 'https://www.franceinfo.fr/politique.rss';
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`;
        
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("Échec de la récupération du flux RSS");

        const xmlText = await res.text();
        
        // Parse XML
        const items: { title: string; link: string; pubDate: string; guid: string }[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match, count = 0;

        while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
          const itemXml = match[1];
          
          // Fonction pour décoder les entités HTML
          const decodeHTML = (html: string) => {
            const txt = document.createElement('textarea');
            txt.innerHTML = html;
            return txt.value;
          };
          
          const getTag = (tag: string) => {
            const regex = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, 's');
            const m = regex.exec(itemXml);
            return m && m[1] ? decodeHTML(m[1].replace(/<[^>]*>/g, '')).trim() : '';
          };

          const title = getTag('title');
          const link = getTag('link');

          if (title && link) {
            items.push({ 
              title, 
              link,
              pubDate: getTag('pubDate'),
              guid: getTag('guid') || link
            });
            count++;
          }
        }

        if (items.length) setActualites(items);
      } catch (err) {
        console.error("Erreur lors du chargement du flux RSS, utilisation des données de secours.", err);
      } finally {
        setLoading(false);
      }
    };

    chargerFlux();
  }, []);

  if (loading) {
    return (
        <span className="ml-2 text-white text-sm">Chargement du flux RSS...</span>
    );
  }

  return (
    <div className="w-full bg-transparent rounded-none overflow-hidden">
      <div className="flex items-center whitespace-nowrap py-3 ticker-container">
        <div className="flex animate-ticker hover:[animation-play-state:paused]">
          {[...actualites, ...actualites].map((item, idx) => (
            <a
              key={`${item.guid}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center mx-4 sm:mx-6 text-white hover:text-blue-200 transition-colors no-underline"
            >
              <span className="mr-2 text-yellow-300">📰</span>
              <span className="font-medium text-lg sm:text-xl md:text-2xl">{item.title}</span>
              <span className="mx-4 text-blue-300">•</span>
            </a>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-container { overflow: hidden; white-space: nowrap; }
        .animate-ticker { display: inline-flex; animation: ticker 60s linear infinite; }
      `}</style>
    </div>
  );
};

const trouverContextePertinent = (question: string): string => {
  const qNet = nettoyerChaine(question);
  const mots = qNet.split(/\s+/).filter(Boolean);
  const scores = new Map<number, number>();

  sommaireData.chapitres.forEach((chap: any, i: number) => {
    let score = 0;
    const keys = [...(chap.mots_cles || []), ...(chap.articles?.flatMap((a: any) => a.mots_cles) || [])];
    keys.forEach((mc: string) => {
      const m = nettoyerChaine(mc);
      if (mots.includes(m)) score += 10;
      else if (qNet.includes(m)) score += 5;
    });
    if (score) scores.set(i + 1, (scores.get(i + 1) || 0) + score);
  });

  if (!scores.size) {
    return "Aucun chapitre spécifique trouvé. Thèmes : " + sommaireData.chapitres.map((c: any) => c.titre).join(", ");
  }

  const top = Array.from(scores.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => {
      const titre = sommaireData.chapitres[id - 1].titre;
      const contenu = (chapitres as Record<number, string>)[id] || "";
      return `Source: ${titre}\nContenu: ${contenu}`;
    });

  return top.join("\n\n---\n\n");
};

const PodcastPlayer: React.FC = () => {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);

    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      const currentIndex = podcastEpisodes.findIndex((e) => e.id === currentEpisode?.id);
      if (currentIndex !== -1 && currentIndex < podcastEpisodes.length - 1) {
        setCurrentEpisode(podcastEpisodes[currentIndex + 1]);
      }
    };
    const handleError = () => {
      setIsPlaying(false);
      setError("Impossible de charger ce podcast. Vérifiez votre connexion.");
    };

    const handlers: { [key: string]: EventListener } = {
      timeupdate: updateTime,
      loadedmetadata: updateDuration,
      canplay: () => {},
      ended: handleEnded,
      error: handleError,
      loadstart: () => {},
      waiting: () => {},
      playing: () => {
        setIsPlaying(true);
      },
      pause: () => setIsPlaying(false),
    };

    Object.entries(handlers).forEach(([evt, fn]) => audio.addEventListener(evt, fn));
    audio.volume = 1;
    if (currentEpisode) audio.load();

    return () => {
      Object.entries(handlers).forEach(([evt, fn]) => audio.removeEventListener(evt, fn));
    };
  }, [currentEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setError("Impossible de lire ce podcast.");
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const playPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setError(null);
        await audio.play();
      }
    } catch (err) {
      console.error("Error playing audio:", err);
      setError("Impossible de lire ce podcast.");
      setIsPlaying(false);
    }
  };

  const selectEpisode = (episode: PodcastEpisode) => {
    if (currentEpisode?.id !== episode.id) {
      setCurrentEpisode(episode);
      setIsPlaying(true); // Démarre automatiquement la lecture
    } else if (!isPlaying) {
      setIsPlaying(true); // Si le même épisode est cliqué, reprend la lecture
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={`fixed right-4 bottom-4 z-50 transition-all duration-300 ${isMinimized ? "w-64 h-24" : "w-96 h-auto"}`}>
      <div className="flex flex-col bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden p-3">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-gray-700 p-1.5 hover:bg-gray-100 rounded-full border-2 border-orange-500">
            {isMinimized ? <ChevronUp className="w-4 h-4 text-gray-700" /> : <ChevronDown className="w-4 h-4 text-gray-700" />}
          </button>
          {currentEpisode && (
            <button onClick={playPause} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2">
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
            </button>
          )}
          <div className="flex-grow flex flex-col items-center justify-center">
            <img 
              src="./podcast.jpg" 
              alt="Podcast" 
              className="w-8 h-8 rounded-full object-cover mb-1"
            />
            <span className="text-gray-800 font-semibold text-sm">Podcast CFDT</span>
          </div>
        </div>
        <audio ref={audioRef} src={currentEpisode?.url} preload="metadata" style={{ display: "none" }} crossOrigin="anonymous" />
        {!isMinimized && (
          <div className="mt-4">
            <div className="flex flex-col items-center mb-4">
              <img 
                src="./podcast.jpg"
                alt="Illustration Podcast"
                className="w-32 h-32 object-cover rounded-full shadow-md border-2 border-purple-400"
              />
              <h4 className="text-white font-bold text-center mt-2">Épisodes disponibles</h4>
            </div>
            <ul className="max-h-48 overflow-y-auto">
              {podcastEpisodes.map(episode => (
                <li key={episode.id}>
                  <button
                    onClick={() => selectEpisode(episode)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm text-white mb-1 transition-colors ${
                      currentEpisode?.id === episode.id ? "bg-purple-700 font-semibold" : "bg-purple-800/60 hover:bg-purple-700/80"
                    }`}
                  >
                    {episode.title}
                  </button>
                </li>
              ))}
            </ul>
            {currentEpisode && (
              <div className="mt-2 px-2 text-xs text-purple-200">
                <p className="truncate">Lecture : {currentEpisode.title}</p>
                <div>
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                {error && <div className="text-red-300 mt-1">{error}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [infoItems, setInfoItems] = useState<InfoItem[]>(() => {
    // Charger d'abord depuis le fichier source (info-data.ts = source de vérité)
    // Le localStorage n'est utilisé que si l'utilisateur a fait des modifications en admin
    const savedInfo = localStorage.getItem('cfdt-info-items');
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      // Vérifier que le localStorage est à jour en comparant les IDs
      // Si les IDs ne correspondent pas (ancien format), ignorer et recharger depuis la source
      if (parsed.length === defaultInfoItems.length && 
          parsed[parsed.length - 1]?.id === defaultInfoItems[defaultInfoItems.length - 1]?.id) {
        return parsed;
      }
    }
    // Utiliser la source de vérité
    return defaultInfoItems;
  });
  
  const [chatState, setChatState] = useState<ChatbotState>({
    currentView: "menu",
    selectedDomain: null,
    messages: [],
    isProcessing: false,
  });
  const [inputValue, setInputValue] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isPrimesBlocked, setIsPrimesBlockedState] = useState(() => {
    const saved = localStorage.getItem('primes-blocked');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const handlePrimesBlockedChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsPrimesBlockedState(customEvent.detail);
    };
    window.addEventListener('primes-blocked-changed', handlePrimesBlockedChanged);
    return () => window.removeEventListener('primes-blocked-changed', handlePrimesBlockedChanged);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [chatState.messages]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedInfo = localStorage.getItem('cfdt-info-items');
      if (savedInfo) {
        setInfoItems(JSON.parse(savedInfo));
      } else {
        // Si pas de modification locale, recharger depuis info-data.ts
        setInfoItems(defaultInfoItems);
      }
    };

    // Écoute l'événement custom depuis AdminInfo
    const handleInfoItemsUpdate = (e: any) => {
      setInfoItems(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('info-items-updated', handleInfoItemsUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('info-items-updated', handleInfoItemsUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setInputValue(finalTranscript);
            setTimeout(() => {
              if (finalTranscript && finalTranscript.trim()) {
                setInputValue(finalTranscript);
                handleSendMessage();
              }
            }, 500);
            setIsListening(false);
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          } else if (interimTranscript) {
            setInputValue(interimTranscript);
            
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
            }
            
            silenceTimeoutRef.current = setTimeout(() => {
              if (interimTranscript && interimTranscript.trim()) {
                setInputValue(interimTranscript);
                handleSendMessage();
                setIsListening(false);
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                }
              }
            }, 3000);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Erreur de reconnaissance vocale:', event.error, event.message);
          setIsListening(false);
          alert(`Erreur de reconnaissance vocale: ${event.error}`);
        };
        
        recognition.onend = () => {
          setIsListening(false);
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        };
        
        recognitionRef.current = recognition;
      } else {
        setIsVoiceSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    const validCredentials = [
      { username: "admin", password: "cfdt2025" },
      { username: "cfdt", password: "admin123" },
      { username: "gennevilliers", password: "cfdt2025" }
    ];
    
    return validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
  };

  const scrollToChat = () => {
    setTimeout(() => {
      chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setInputValue("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleDomainSelection = (domainId: number) => {
    const welcomes: Record<number, string> = {
      0: "Bonjour ! Je peux vous aider avec vos questions sur les horaires, congés, ARTT, temps partiel, heures supplémentaires, absences, etc.",
      1: "Bonjour ! Je peux vous renseigner sur le CPF, les congés de formation, la VAE, les concours, les bilans de compétences, etc. Quelle est votre question ?",
      2: "Bonjour ! Je suis l'assistant spécialiste du télétravail. Posez-moi vos questions sur la charte, les jours autorisés, les indemnités, etc.",
    };
    setChatState({
      currentView: "chat",
      selectedDomain: domainId,
      messages: [{ type: "assistant", content: welcomes[domainId], timestamp: new Date() }],
      isProcessing: false,
    });
    scrollToChat();
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const returnToMenu = () => {
    setChatState({ currentView: "menu", selectedDomain: null, messages: [], isProcessing: false });
    setInputValue("");
    setSelectedInfo(null);
  };

  const appelPerplexity = async (messages: any[]): Promise<string> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "sonar-pro", messages }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.error("Détail de l'erreur API:", err);
      throw new Error(`Erreur API (${response.status})`);
    }
    const json = await response.json();
    return json.choices[0].message.content;
  };

  const traiterQuestion = async (question: string): Promise<string> => {
    let contexte = "";
    if (chatState.selectedDomain === 0) contexte = trouverContextePertinent(question);
    else if (chatState.selectedDomain === 1) contexte = JSON.stringify(formation, null, 2);
    else if (chatState.selectedDomain === 2) contexte = teletravailData;

    const systemPrompt = `
Tu es un collègue syndical spécialiste pour la mairie de Gennevilliers.
Ta mission est de répondre aux questions des agents en te basant EXCLUSIVEMENT sur la documentation fournie dans le dossier /data.
NE JAMAIS utiliser tes connaissances générales.
Si la réponse ne se trouve pas dans la documentation, réponds : "Je ne trouve pas l'information dans les documents à ma disposition. Veuillez contacter la CFDT au 64 64 pour plus de détails."
Sois précis mais concis , utilise un ton AMICAL et ne cite pas le titre du chapitre ni l"article .
--- DEBUT DE LA DOCUMENTATION PERTINENTE ---
${contexte}
--- FIN DE LA DOCUMENTATION PERTINENTE ---
    `;
    const history = chatState.messages.slice(1).map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));
    const apiMessages = [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: question }];
    return await appelPerplexity(apiMessages);
  };

  const handleSendMessage = async (): Promise<void> => {
    const q = inputValue.trim();
    if (!q || chatState.isProcessing) return;
    const userMsg: ChatMessage = { type: "user", content: q, timestamp: new Date() };
    setChatState((p) => ({ ...p, messages: [...p.messages, userMsg], isProcessing: true }));
    setInputValue("");
    
    try {
      const reply = await traiterQuestion(q);
      const assistantMsg: ChatMessage = { type: "assistant", content: reply, timestamp: new Date() };
      setChatState((p) => ({ ...p, messages: [...p.messages, assistantMsg] }));
      
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);
      
      setChatState((p) => ({ ...p, isProcessing: false }));
    } catch (e) {
      console.error(e);
      const errMsg: ChatMessage = {
        type: "assistant",
        content: "Désolé, une erreur est survenue. Veuillez réessayer ou contacter un représentant si le problème persiste.",
        timestamp: new Date(),
      };
      setChatState((p) => ({ ...p, messages: [...p.messages, errMsg], isProcessing: false }));
    } finally {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen relative font-sans">
      <Snow />
  <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 filter blur-md" style={{ backgroundImage: "url('./mairie.jpeg')" }} />
  <div className="fixed inset-0 bg-black/20 z-0" />
      <PodcastPlayer />

      <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-8 flex-grow">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-lg shadow-lg border-2 border-slate-200">
              <img
                src="./deco.jpg"
                alt="Décoration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Atlas
                </span>
                <span className="text-slate-200 mx-2">•</span>
                <span className="text-slate-100">
                  Chatbot CFDT
                </span>
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-300 mb-3">
                Mairie de <span className="text-cyan-400 font-bold">GENNEVILLIERS</span>
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm sm:text-base font-medium">
                  Assistant syndical pour les agents municipaux
                </span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0">
            <div className="absolute -inset-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full blur-2xl opacity-80 animate-pulse"></div>
            <div className="relative bg-white rounded-full w-28 h-28 sm:w-32 sm:h-32 shadow-2xl overflow-hidden border-2 border-slate-200">
              <img
                src="./logo-cfdt.jpg"
                alt="Logo CFDT"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Bandeau News FPT déplacé sous le header et en full width */}
      <section className="relative bg-orange-300 text-black overflow-hidden w-full rounded-none shadow-lg z-10">
        <div className="relative h-20 flex items-center overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-40 flex items-center justify-center bg-orange-400 z-20 shadow-md">
            <span className="text-2xl font-bold">NEWS FPT:</span>
          </div>
              <div className="animate-marquee whitespace-nowrap flex items-center pl-44" style={{ animation: "marquee 45s linear infinite" }}>
            {[...infoItems, ...infoItems].map((info, idx) => (
              <button
                key={`${info.id}-${idx}`}
                onClick={() => setSelectedInfo(info)}
                className="text-2xl font-medium mx-8 hover:text-blue-200 transition-colors underline decoration-dotted cursor-pointer"
              >
                #{info.id}: {info.title}
              </button>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes blink {
            0%, 50% { color: black; }
            51%, 100% { color: red; }
          }
          .animate-blink {
            animation: blink 2s infinite;
          }
          @keyframes slide-in-left {
            0% { 
              transform: translateX(-100%); 
              opacity: 0; 
            }
            100% { 
              transform: translateX(0); 
              opacity: 1; 
            }
          }
          @keyframes slide-in-right {
            0% { 
              transform: translateX(100%); 
              opacity: 0; 
            }
            100% { 
              transform: translateX(0); 
              opacity: 1; 
            }
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.3s ease-out;
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out;
          }
        `}</style>
      </section>
  <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {selectedInfo && (
          <section className="info-detail bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-md mb-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4">{selectedInfo.title}</h3>
            <p className="whitespace-pre-wrap">{selectedInfo.content}</p>
            <button onClick={() => setSelectedInfo(null)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Fermer
            </button>
          </section>
        )}
        {chatState.currentView === 'quiz' ? (
          <Quiz onBack={() => setChatState({ currentView: 'menu', selectedDomain: null, messages: [], isProcessing: false })} />
        ) : chatState.currentView === 'public' ? (
          <FAQ onBack={() => setChatState({ currentView: 'menu', selectedDomain: null, messages: [], isProcessing: false })} />
        ) : showCalculator ? (
          <Calculateurs onBack={() => setShowCalculator(false)} />
        ) : chatState.currentView === "menu" ? (
          <>

            <section className="text-center -mt-6 mb-6 max-w-xl mx-auto">
              <div className="inline-block bg-gradient-to-r from-blue-600/60 via-purple-600/60 to-indigo-600/60 px-4 py-3 rounded-xl shadow-md">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Choisissez votre domaine d'assistance
                </h3>
                <p className="text-sm text-white/90 max-w-md mx-auto">
                  <span className="animate-blink">Exclusivement à partir des documents de la mairie.</span>
                </p>
              </div>
            </section>

            <div className="relative w-full flex items-center justify-center mb-12">
              {/* Mobile layout: vertical stacking */}
              <div className="md:hidden w-full flex flex-col items-center gap-6">
                {/* PRIMES button */}
                <div className="relative z-10 p-4 rounded-2xl overflow-hidden w-auto max-w-[160px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-700 opacity-70" />
                  <div className="flex flex-col items-center gap-4 relative z-20 text-white">
                    <div className={`relative p-5 bg-cyan-500 rounded-3xl shadow-lg ring-2 ring-cyan-300 ${isPrimesBlocked ? 'opacity-60' : ''}`}>
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <button 
                      onClick={() => {
                        if (!isPrimesBlocked) {
                          setShowCalculator(true);
                        }
                      }}
                      disabled={isPrimesBlocked}
                      aria-label="Ouvrir Calculateur PRIMES"
                      title={isPrimesBlocked ? "Le bouton PRIMES est désactivé" : "Ouvrir Calculateur PRIMES"}
                      className={`px-5 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-lg font-bold text-white shadow-md focus:outline-none ${isPrimesBlocked ? 'opacity-50 cursor-not-allowed hover:bg-cyan-500' : ''}`}
                    >
                      PRIMES
                    </button>
                  </div>
                </div>

                {/* QUIZZ button */}
                <button onClick={() => setChatState(p => ({ ...p, currentView: 'quiz' }))} aria-label="Ouvrir QUIZZ" className="focus:outline-none">
                  <div className="w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full star-anim cursor-pointer" aria-hidden="true">
                      <defs>
                        <linearGradient id="gStar" x1="0%" x2="100%">
                          <stop offset="0%" stopColor="#FFD54A" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                      <polygon points="50,3 61,36 98,36 67,57 78,91 50,70 22,91 33,57 2,36 39,36" fill="url(#gStar)" />
                      <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="700" fill="#3B2F00" stroke="#3B2F00" strokeWidth="1.0" paintOrder="stroke fill" letterSpacing="-0.45">QUIZZ</text>
                    </svg>
                  </div>
                </button>

                {/* Questions fréquentes button */}
                <div className="relative z-10 p-3 rounded-2xl overflow-hidden w-auto max-w-[160px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-70" />
                  <div className="flex flex-col items-center gap-4 relative z-20 text-white">
                    <div className="relative p-4 bg-orange-500 rounded-3xl shadow-lg ring-2 ring-orange-300">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <button onClick={() => setChatState(p => ({ ...p, currentView: 'public' }))} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-full text-base font-bold text-white shadow-md">
                      Questions fréquentes
                    </button>
                  </div>
                </div>
              </div>

              {/* Styles for both mobile and desktop animations */}
              <style>{`
                @keyframes quizz-pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.16); }
                  100% { transform: scale(1); }
                }
                @keyframes quizz-blink {
                  0% { opacity: 1; }
                  50% { opacity: 0.35; }
                  100% { opacity: 1; }
                }
                .star-anim {
                  transform-origin: 50% 50%;
                  animation: quizz-pulse 1.1s ease-in-out infinite, quizz-blink 1.3s linear infinite;
                  filter: drop-shadow(0 10px 30px rgba(217,119,6,0.45));
                }
              `}</style>

              {/* Desktop layout: absolute positioning */}
              <div className="hidden md:block relative w-full min-h-[350px] h-[350px]">
                {/* fixed white circle behind the star (non-interactive) */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <div className="w-44 h-44 rounded-full bg-white shadow-lg" />
                </div>

                {/* PRIMES Window on the left */}
                <div className="absolute left-32 top-1/2 transform -translate-y-1/2 z-30">
                  <div className="relative z-10 p-4 rounded-2xl overflow-hidden w-auto max-w-[200px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-700 opacity-70" />
                    <div className="flex flex-col items-center gap-4 relative z-20 text-white">
                      <div className={`relative p-5 bg-cyan-500 rounded-3xl shadow-lg ring-2 ring-cyan-300 ${isPrimesBlocked ? 'opacity-60' : ''}`}>
                        <TrendingUp className="w-10 h-10 text-white" />
                      </div>
                      <button 
                        onClick={() => {
                          if (!isPrimesBlocked) {
                            setShowCalculator(true);
                          }
                        }}
                        disabled={isPrimesBlocked}
                        aria-label="Ouvrir Calculateur PRIMES"
                        title={isPrimesBlocked ? "Le bouton PRIMES est désactivé" : "Ouvrir Calculateur PRIMES"}
                        className={`px-5 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-xl font-bold text-white shadow-md focus:outline-none ${isPrimesBlocked ? 'opacity-50 cursor-not-allowed hover:bg-cyan-500' : ''}`}
                      >
                        PRIMES
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center the QUIZZ star */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                  <button onClick={() => setChatState(p => ({ ...p, currentView: 'quiz' }))} aria-label="Ouvrir QUIZZ" className="focus:outline-none">
                    <div className="w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full star-anim cursor-pointer" aria-hidden="true">
                        <defs>
                          <linearGradient id="gStar" x1="0%" x2="100%">
                            <stop offset="0%" stopColor="#FFD54A" />
                            <stop offset="50%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#D97706" />
                          </linearGradient>
                        </defs>
                        <polygon points="50,3 61,36 98,36 67,57 78,91 50,70 22,91 33,57 2,36 39,36" fill="url(#gStar)" />
                        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="700" fill="#3B2F00" stroke="#3B2F00" strokeWidth="1.0" paintOrder="stroke fill" letterSpacing="-0.45">QUIZZ</text>
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Questions fréquentes on the right */}
                <div className="absolute right-32 top-1/2 transform -translate-y-1/2 z-30">
                  <div className="relative z-10 p-3 rounded-2xl overflow-hidden w-auto max-w-[160px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-70" />
                    <div className="flex flex-col items-center gap-4 relative z-20 text-white">
                      <div className="relative p-4 bg-orange-500 rounded-3xl shadow-lg ring-2 ring-orange-300">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <button onClick={() => setChatState(p => ({ ...p, currentView: 'public' }))} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-full text-lg font-bold text-white shadow-md">
                        Questions fréquentes
                      </button>
                    </div>
                  </div>
                </div>

                {/* Spacer for layout */}
                <div className="h-64" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <button
                onClick={() => handleDomainSelection(0)}
                className="group relative overflow-hidden bg-orange-100/70 border-2 border-orange-200 rounded-3xl p-8 transition-all duration-500 hover:bg-orange-100 hover:border-orange-400 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-xl group-hover:rotate-3 group-hover:scale-110 transition-transform">
                    <Clock className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 group-hover:text-orange-700">Temps de Travail</h4>
                  <p className="text-center text-gray-600">Horaires, congés, ARTT, temps partiel, absences…</p>
                </div>
              </button>

              <button
                onClick={() => handleDomainSelection(1)}
                className="group relative overflow-hidden bg-purple-100/70 border-2 border-purple-200 rounded-3xl p-8 transition-all duration-500 hover:bg-purple-100 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative p-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-xl group-hover:rotate-3 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 group-hover:text-purple-700">Formation</h4>
                  <p className="text-center text-gray-600">CPF, VAE, concours, bilans de compétences…</p>
                </div>
              </button>
              
              <button
                onClick={() => handleDomainSelection(2)}
                className="group relative overflow-hidden bg-green-100/70 border-2 border-green-200 rounded-3xl p-8 transition-all duration-500 hover:bg-green-100 hover:border-green-400 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative p-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-xl group-hover:rotate-3 group-hover:scale-110 transition-transform">
                    <Home className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 group-hover:text-green-700">Télétravail</h4>
                  <p className="text-center text-gray-600">Charte, jours autorisés, indemnités, modalités…</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div ref={chatContainerRef} className="bg-white/95 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={returnToMenu} className="text-orange-600 hover:text-orange-700 p-2 sm:p-3 rounded-full hover:bg-orange-50 bg-white border-2 border-orange-300 hover:border-orange-400 transition-colors">
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                    {chatState.selectedDomain === 0 && "Assistant Temps de Travail"}
                    {chatState.selectedDomain === 1 && "Assistant Formation"}
                    {chatState.selectedDomain === 2 && "Assistant Télétravail"}
                  </h3>
                  <p className="text-orange-100 text-xs sm:text-sm hidden sm:block">Posez vos questions, je suis là pour vous aider</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white flex-shrink-0" />
                <button onClick={returnToMenu} className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-base">Retour</button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center py-4 bg-gray-50/50 px-4 sm:px-6 gap-4">
              <div className="flex-1 w-full sm:w-auto">
                {chatState.messages.length > 0 && chatState.messages[0].type === 'assistant' && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 text-xs sm:text-sm">CFDT</div>
                    <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-md flex-1">
                      <p className="text-sm sm:text-lg md:text-xl leading-relaxed">{chatState.messages[0].content}</p>
                      <p className="text-xs mt-2 opacity-70 text-right">{chatState.messages[0].timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="hidden sm:flex flex-shrink-0">
                <img
                  src="./cfdtmanga.gif"
                  alt="CFDT Manga"
                  className="w-1/2 h-auto rounded-2xl shadow-lg border-2 border-orange-300"
                />
              </div>
            </div>

            <div className="flex flex-row">
              <div className="flex-1 min-h-[20vh] max-h-[50vh] sm:min-h-[15vh] sm:max-h-[40vh] overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {chatState.messages.slice(1).map((msg, i) => (
                  <div key={i + 1} className={`flex items-end gap-2 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.type === 'assistant' && <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 text-xs sm:text-sm">CFDT</div>}
                    <div
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-md ${
                        msg.type === "user"
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                      } ${msg.type === "assistant" ? "text-left animate-slide-in-left" : "text-right animate-slide-in-right"}`}
                    >
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-2 opacity-70 ${msg.type === "assistant" ? "text-left" : "text-right"}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}

                {chatState.isProcessing && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 text-xs sm:text-sm">CFDT</div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-md rounded-bl-none max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm text-gray-600">CFDT écrit</span>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-gray-50/80 border-t border-gray-200 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Écoute en cours..." : "Tapez votre question ici..."}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={chatState.isProcessing || isListening}
                />
                {isVoiceSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={chatState.isProcessing}
                    className={`p-2 sm:p-3 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isListening ? "Arrêter l'écoute" : "Démarrer l'écoute vocale"}
                  >
                    {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                )}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatState.isProcessing}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 sm:p-3 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bandeau Flux RSS — full width, collé au-dessus du footer (fond bleu) */}
  <section className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white z-10">
        <div className="w-full px-0">
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden w-full rounded-none shadow-none z-10">
            <div className="relative h-20 flex items-center overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-40 flex items-center justify-center bg-blue-800 z-20 shadow-md">
                <span className="text-2xl font-bold text-white">FLUX RSS:</span>
              </div>
              <div className="w-full pl-44">
                <NewsTicker />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative backdrop-blur-xl bg-slate-900/80 border-t border-slate-800 py-6 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact CFDT */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Contact CFDT
              </h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3 text-white/80 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-orange-400" />
                  </div>
                  <span>01 40 85 64 64</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-white/80 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-orange-400" />
                  </div>
                  <a
                    href="mailto:cfdt-interco@ville-gennevilliers.fr"
                    className="hover:text-orange-300 transition-colors"
                  >
                    cfdt-interco@ville-gennevilliers.fr
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-white/80">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-orange-400" />
                  </div>
                  <span>Mairie de Gennevilliers</span>
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Services
              </h4>
              </div>
              <ul className="space-y-3 text-white/80 flex flex-col items-center justify-center">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Accompagnement syndical</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Santé</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Retraite</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Juridique</span>
                </li>
              </ul>
            </div>
            
            {/* Horaires */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Horaires
              </h4>
              </div>
              <div className="space-y-3 text-white/80">
                <div className="text-lg font-medium text-white">Lundi - Vendredi</div>
                <div className="text-xl font-bold text-white bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  9h00-12h00 / 13h30-17h00
            </div>
                <div className="text-sm text-white/60">Permanences sur RDV</div>
                <div className="flex items-center justify-center md:justify-end gap-2 mt-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-300">Ouvert maintenant</span>
              </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-6 pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-white/80">
                  © 2025 CFDT Gennevilliers
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <div className="text-white/60">
                  Assistant IA pour les agents municipaux
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/70">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">Powered by AI</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Sécurisé</span>
                </div>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
                  title="Administrer les actualités et informations"
                >
                  ⚙️ Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

