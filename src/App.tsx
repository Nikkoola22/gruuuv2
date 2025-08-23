import type React from "react";
import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from "react";
import {
  Clock,
  GraduationCap,
  Users,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  Send,
  ArrowLeft,
  Home,
  Play,
  Pause,
  Volume2,
} from "lucide-react";

import { sommaire } from "./data/sommaire.ts";
import { chapitres } from "./data/temps.ts";
import { formation } from "./data/formation.ts";
import { teletravailData } from "./data/teletravail.ts";
import { infoItems } from "./data/info-data.ts";
import { podcastEpisodes, type PodcastEpisode } from "./data/podcasts/mp3.ts";

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
  currentView: "menu" | "chat";
  selectedDomain: number | null;
  messages: ChatMessage[];
  isProcessing: boolean;
}

const API_KEY = "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";
const API_URL = "https://api.perplexity.ai/chat/completions";

const fluxOriginal = "https://www.franceinfo.fr/politique.rss";
const proxyUrl = "https://corsproxy.io/?";
const FLUX_ACTUALITES_URL = proxyUrl + encodeURIComponent(fluxOriginal);

const actualitesSecours = [
  { title: "Réforme des retraites : nouvelles négociations prévues", link: "#", pubDate: new Date().toISOString(), guid: "1" },
  { title: "Budget 2024 : les principales mesures votées", link: "#", pubDate: new Date().toISOString(), guid: "2" },
  { title: "Fonction publique : accord sur les salaires", link: "#", pubDate: new Date().toISOString(), guid: "3" },
  { title: "Télétravail : nouvelles directives gouvernementales", link: "#", pubDate: new Date().toISOString(), guid: "4" },
  { title: "Dialogue social : rencontre avec les syndicats", link: "#", pubDate: new Date().toISOString(), guid: "5" },
];

const sommaireData = JSON.parse(sommaire);

const nettoyerChaine = (chaine: unknown): string => {
  if (typeof chaine !== "string") return "";
  return chaine
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .trim();
};

const NewsTicker: React.FC = () => {
  const [actualites, setActualites] = useState(actualitesSecours);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chargerFlux = async () => {
      try {
        const res = await fetch(FLUX_ACTUALITES_URL);
        if (!res.ok) throw new Error();
        const xml = await res.text();
        const doc = new DOMParser().parseFromString(xml, "text/xml");
        const items = Array.from(doc.querySelectorAll("item")).slice(0, 10).map((item, i) => ({
          title: item.querySelector("title")?.textContent || `Actualité ${i + 1}`,
          link: item.querySelector("link")?.textContent || "#",
          pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
          guid: item.querySelector("guid")?.textContent || `${i}`,
        }));
        if (items.length) setActualites(items);
      } catch {
        console.log("Utilisation des données de secours pour les actualités");
      } finally {
        setLoading(false);
      }
    };
    chargerFlux();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-900/80 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
        <span className="ml-2 text-white text-sm">Chargement des actualités...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-blue-900/80 rounded-lg overflow-hidden border border-blue-500/30 shadow-inner">
      <div className="flex items-center whitespace-nowrap py-3 ticker-container">
        <div className="flex animate-ticker hover:[animation-play-state:paused]">
          {[...actualites, ...actualites].map((item, idx) => (
            <a
              key={`${item.guid}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center mx-6 text-white hover:text-blue-200 transition-colors no-underline"
            >
              <span className="mr-2 text-yellow-300">📰</span>
              <span className="font-medium text-sm sm:text-base">{item.title}</span>
              <span className="mx-4 text-blue-300">•</span>
            </a>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-container { overflow: hidden; white-space: nowrap; }
        .animate-ticker { display: inline-flex; animation: ticker 40s linear infinite; }
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
  const [volume, setVolume] = useState(1);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(false);

    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    const handlers = {
      timeupdate: updateTime,
      loadedmetadata: updateDuration,
      canplay: () => setIsLoading(false),
      ended: () => {
        setIsPlaying(false);
        const idx = podcastEpisodes.findIndex((e) => e.id === currentEpisode?.id);
        if (idx < podcastEpisodes.length - 1) setCurrentEpisode(podcastEpisodes[idx + 1]);
      },
      error: () => {
        setIsLoading(false);
        setIsPlaying(false);
        setError("Impossible de charger ce podcast. Vérifiez votre connexion.");
      },
      loadstart: () => setIsLoading(true),
      waiting: () => setIsLoading(true),
      playing: () => {
        setIsLoading(false);
        setIsPlaying(true);
      },
      pause: () => setIsPlaying(false),
    };
    Object.entries(handlers).forEach(([evt, fn]) => audio.addEventListener(evt, fn as any));
    audio.volume = volume;
    if (currentEpisode) audio.load();

    return () => {
      Object.entries(handlers).forEach(([evt, fn]) => audio.removeEventListener(evt, fn as any));
    };
  }, [currentEpisode, volume]);

  const playPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        setError(null);
        if (audio.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
          audio.load();
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);
            const onCan = () => { clearTimeout(timeout); resolve(); };
            const onErr = () => { clearTimeout(timeout); reject(); };
            audio.addEventListener("canplay", onCan);
            audio.addEventListener("error", onErr);
          });
        }
        const promise = audio.play();
        if (promise !== undefined) await promise;
        setIsPlaying(true);
      }
    } catch {
      setError("Impossible de lire ce podcast.");
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const selectEpisode = (episode: PodcastEpisode) => {
    setCurrentEpisode(episode);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(false);
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={`fixed right-4 bottom-4 z-50 transition-all duration-300 ${isMinimized ? "w-48 h-12" : "w-80 h-auto"}`}>
      <div className="flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-xl shadow-lg border border-purple-500/30 overflow-hidden px-2 py-2">
        <div className="flex items-center justify-between">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-white p-1.5">
            {isMinimized ? "⬜" : "➖"}
          </button>
          {currentEpisode && (
            <button onClick={playPause} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-1.5">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
          <Volume2 className="w-4 h-4 text-gray-300" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={e => setVolume(parseFloat(e.target.value) / 100)}
            className="w-24 h-1 bg-purple-300 rounded slider"
          />
        </div>
        <audio ref={audioRef} src={currentEpisode?.url} preload="metadata" style={{ display: "none" }} crossOrigin="anonymous" />
        {!isMinimized && (
          <div className="mt-4">
            <h4 className="text-white font-bold text-center mb-2">Épisodes disponibles</h4>
            <ul>
              {podcastEpisodes.map(episode => (
                <li key={episode.id}>
                  <button
                    onClick={() => selectEpisode(episode)}
                    className={`block w-full text-left px-4 py-2 rounded hover:bg-purple-700 text-white mb-1 ${
                      currentEpisode?.id === episode.id ? "bg-purple-700 font-semibold" : "bg-purple-600"
                    }`}
                  >
                    {episode.title}
                  </button>
                </li>
              ))}
            </ul>
            {currentEpisode && (
              <div className="mt-2 px-4 text-sm text-purple-200">
                <span>Lecture : {currentEpisode.title}</span>
                <div>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                {error && <div className="text-red-300">{error}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [chatState, setChatState] = useState<ChatbotState>({
    currentView: "menu",
    selectedDomain: null,
    messages: [],
    isProcessing: false,
  });
  const [inputValue, setInputValue] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToChat = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        const target = chatContainerRef.current.offsetTop - 150;
        window.scrollTo({ top: target < 0 ? 0 : target, behavior: "smooth" });
      }
    }, 100);
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
Ta mission est de répondre aux questions des agents en te basant EXCLUSIVEMENT sur la documentation fournie ci-dessous.
NE JAMAIS utiliser tes connaissances générales.
Si la réponse ne se trouve pas dans la documentation, réponds : "Je ne trouve pas l'information dans les documents à ma disposition. Veuillez contacter le 64 64 pour plus de détails."
Sois précis, utilise un ton AMICAL et cite le titre du chapitre si possible.
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
    scrollToChat();
    try {
      const reply = await traiterQuestion(q);
      const assistantMsg: ChatMessage = { type: "assistant", content: reply, timestamp: new Date() };
      setChatState((p) => ({ ...p, messages: [...p.messages, assistantMsg] }));
    } catch (e) {
      console.error(e);
      const errMsg: ChatMessage = {
        type: "assistant",
        content: "Désolé, une erreur est survenue. Veuillez réessayer ou contacter un représentant si le problème persiste.",
        timestamp: new Date(),
      };
      setChatState((p) => ({ ...p, messages: [...p.messages, errMsg] }));
    } finally {
      setChatState((p) => ({ ...p, isProcessing: false }));
      scrollToChat();
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
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: `url('/unnamed.png')` }} />
      <div className="fixed inset-0 bg-black/10 z-0" />
      <PodcastPlayer />

      <header className="relative bg-gradient-to-r from-white/95 via-orange-50/95 to-white/95 shadow-2xl border-b-4 border-orange-500 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-grow">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 rounded-full blur-lg opacity-70 animate-pulse" />
              <div className="relative p-6 bg-gradient-to-br from-white to-orange-50 rounded-full shadow-2xl">
                <Users className="w-20 h-20 text-orange-500" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent drop-shadow-sm">
                Atlas: Chatbot CFDT
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mairie de GENNEVILLIERS
              </h2>
              <p className="mt-4 flex justify-center sm:justify-start items-center gap-2 text-lg text-gray-700">
                <Users className="text-orange-500 w-5 h-5 animate-pulse" />
                Assistant syndical CFDT pour les agents municipaux
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 rounded-full blur-2xl opacity-90 animate-pulse"></div>
            <div className="absolute -inset-6 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 rounded-full blur-xl opacity-70"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400 rounded-full blur-lg opacity-50"></div>
            <div className="relative bg-white rounded-full w-48 h-48 shadow-lg flex items-center justify-center p-0">
              <img
                src="/logo-cfdt.png"
                alt="Logo CFDT"
                className="w-full h-full object-contain"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        {chatState.currentView === "menu" ? (
          <>
            <section className="relative bg-orange-300 text-black overflow-hidden mx-4 rounded-2xl shadow-lg z-10">
              <div className="relative h-20 flex items-center overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-40 flex items-center justify-center bg-orange-400 z-20 shadow-md">
                  <span className="text-2xl font-bold">NEWS FTP:</span>
                </div>
                <div className="animate-marquee whitespace-nowrap flex items-center pl-44" style={{ animation: "marquee 30s linear infinite" }}>
                  {[...infoItems, ...infoItems, ...infoItems].map((info, idx) => (
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
              <style jsx>{`
                @keyframes marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-33.33%); }
                }
              `}</style>
            </section>

            {selectedInfo && (
              <section className="info-detail bg-white p-6 rounded-lg shadow-md mt-8 max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-4">{selectedInfo.title}</h3>
                <p>{selectedInfo.content}</p>
                <button onClick={() => setSelectedInfo(null)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Fermer
                </button>
              </section>
            )}

            <section className="text-center my-8">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-purple-700 bg-clip-text text-transparent mb-4">
                Choisissez votre domaine d’assistance
              </h3>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Sélectionnez le service qui correspond à vos besoins. Nos assistants IA spécialisés vous aideront.
              </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <button
                onClick={() => handleDomainSelection(0)}
                className="group relative overflow-hidden bg-white/95 border-2 border-orange-200 rounded-3xl p-10 transition-all duration-500 hover:border-orange-400 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <span className="absolute -inset-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl opacity-20 blur-lg group-hover:scale-110 transition"></span>
                    <div className="relative p-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl group-hover:rotate-3 group-hover:scale-110 transition-all">
                      <Clock className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 group-hover:text-orange-700">Règlement du Temps de Travail</h4>
                  <p className="text-center text-gray-600">Horaires, congés, ARTT, temps partiel, heures sup, absences…</p>
                  <div className="flex items-center gap-2 text-orange-500 opacity-0 group-hover:opacity-100 transition">
                    <span className="font-semibold">Accéder à l’assistant</span>
                    <ArrowRight className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDomainSelection(1)}
                className="group relative overflow-hidden bg-white/95 border-2 border-purple-200 rounded-3xl p-10 transition-all duration-500 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <span className="absolute -inset-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl opacity-20 blur-lg group-hover:scale-110 transition"></span>
                    <div className="relative p-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-2xl group-hover:rotate-3 group-hover:scale-110 transition-all">
                      <GraduationCap className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 group-hover:text-purple-700">Formation Professionnelle</h4>
                  <p className="text-center text-gray-600">CPF, congés formation, VAE, concours, bilans de compétences…</p>
                  <div className="flex items-center gap-2 text-purple-500 opacity-0 group-hover:opacity-100 transition">
                    <span className="font-semibold">Accéder à l’assistant</span>
                    <ArrowRight className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <button
                onClick={() => handleDomainSelection(2)}
                className="group relative overflow-hidden bg-white/95 border-2 border-green-200 rounded-3xl p-10 transition-all duration-500 hover:border-green-400 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-teal-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <span className="absolute -inset-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl opacity-20 blur-lg group-hover:scale-110 transition"></span>
                    <div className="relative p-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-2xl group-hover:rotate-3 group-hover:scale-110 transition-all">
                      <Home className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 group-hover:text-green-700">Télétravail</h4>
                  <p className="text-center text-gray-600">Charte, jours autorisés, indemnités, modalités…</p>
                  <div className="flex items-center gap-2 text-green-500 opacity-0 group-hover:opacity-100 transition">
                    <span className="font-semibold">Accéder à l’assistant</span>
                    <ArrowRight className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
              </button>

              <div className="group relative overflow-hidden bg-white/95 border-2 border-blue-200 rounded-3xl p-10 transition-all duration-500 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <span className="absolute -inset-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl opacity-20 blur-lg group-hover:scale-110 transition"></span>
                    <div className="relative p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl group-hover:rotate-3 group-hover:scale-110 transition-all">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700">Actualités Politiques</h4>
                  <div className="w-full">
                    <NewsTicker />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div ref={chatContainerRef} className="bg-white/95 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={returnToMenu} className="text-white hover:text-orange-200">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {chatState.selectedDomain === 0 && "Assistant Temps de Travail"}
                    {chatState.selectedDomain === 1 && "Assistant Formation"}
                    {chatState.selectedDomain === 2 && "Assistant Télétravail"}
                  </h3>
                  <p className="text-orange-100 text-sm">Posez vos questions, je suis là pour vous aider</p>
                </div>
              </div>
              <Users className="w-8 h-8 text-white" />
            </div>

            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {chatState.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-2 opacity-70">{msg.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}

              {chatState.isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      <span className="text-sm text-gray-600">L’assistant réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre question ici..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={chatState.isProcessing}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatState.isProcessing}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Contact CFDT
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Phone className="w-5 h-5 text-orange-400" />
                  <span>01 40 85 64 64</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Mail className="w-5 h-5 text-orange-400" />
                  <span>cfdt-interco@ville-gennevilliers.fr</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <span>Mairie de Gennevilliers</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Services
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li>Sante</li>
                <li>Retraite</li>
                <li>Juridique</li>
                <li>Accompagnement syndical</li>
              </ul>
            </div>
            <div className="text-center md:text-right">
              <h4 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Horaires
              </h4>
              <div className="space-y-3 text-gray-300">
                <div>Lundi - Vendredi</div>
                <div className="font-semibold text-white">9h00 - 17h00</div>
                <div className="text-sm">Permanences sur RDV</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 CFDT Gennevilliers - Assistant IA pour les agents municipaux</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
