// --- TYPES ---
export interface PodcastEpisode {
  id: number;
  title: string;
  url: string;
  duration?: string;
  description?: string;
  date?: string;
}

// Import de l’asset local sous src/data/podcasts/
import rqthUrl from './RQTH.mp3';

// --- ÉPISODES DE PODCAST AVEC URLS ---
export const podcastEpisodes: PodcastEpisode[] = [
  { 
    id: 1, 
    title: "La retraite progressive - 10/09/2025", 
    url: "https://media.radiofrance-podcast.net/podcast09/11548-06.09.2025-ITEMA_24237901-2025F18386S0249-NET_MFI_3E105361-19F3-4A2A-BF6D-1CAB7D05CA24-27.m4a",
    duration: "02:25", 
    description: "La retraite progressive",
    date: "10/09/2025"
  },
  { 
    id: 2, 
    title: "La minute statutaire", 
    url: "https://vod.api.video/vod/vi0zHzmWQnIIrtlBfAM4JAB/mp4/source.mp4",
    duration: "00:00", 
    description: "La minute statutaire",
    date: "05/2025"
  },
  { 
    id: 3, 
    title: "Podcast Radio France - Dépense publique : stop ou encore ?", 
    url: "https://media.radiofrance-podcast.net/podcast09/24408-05.05.2025-ITEMA_24123940-2025F51881S0125-NET_MFI_2B52238C-DD76-4DED-A1BD-C848BABD1642-27.m4a",
    duration: "18:20", 
    description: "Tout savoir sur la dépense",
    date: "18/08/2025"
  },
  { 
    id: 4, 
    title: "Le contrat à durée indeterminée (CDI)", 
    url: "https://vod.api.video/vod/vi5pOcokezXtOcExeMpobXey/mp4/source.mp4",
    duration: "00:00", 
    description: "Le contrat à durée indeterminée (CDI)",
    date: "18/11/2025"
  },
  {
    id: 5,  
    title: "Conditions de recrutement", 
    url: "https://vod.api.video/vod/vi3fMf8grPVgzkbpTdOd74R0/mp4/source.mp4",
    duration: "00:00", 
    description: "Conditions de recrutement",
    date: "09/2025"
  },
  {
    id: 6,
    title: "RQTH - Audio (local)",
    url: rqthUrl, // URL générée par Vite
    duration: "00:00",
    description: "Fichier audio local RQTH.mp3 importé depuis src/data/podcasts",
    date: "08/09/2025"
  },
  {
    id: 7,
    title: "SVP statut",
    url: "https://vod.api.video/vod/vi1UUFqrsaLf2j09cEuG6QEk/mp4/source.mp4",
    duration: "00:00",
    description: "SVP statut",
    date: "18/11/2025"
  }
];
