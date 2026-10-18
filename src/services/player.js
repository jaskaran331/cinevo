/**
 * Video Player Embed Service for Cinevo
 * Resolves high-availability fallback streaming providers for Movies, TV Series, and Anime.
 */

import { ANILIST_GRAPHQL_ENDPOINT, JIKAN_ANIME_ENDPOINT } from '../config/constants.js';

export const VIDEO_AUDIO_OPTIONS = [
  { audio: 'english', glyph: 'EN', label: 'English', detail: 'Original English audio' },
  { audio: 'hindi', glyph: 'हि', label: 'हिन्दी · Hindi', detail: 'Hindi dubbed audio. Depends on the title.' }
];

export const ANIME_AUDIO_OPTIONS = [
  { audio: 'sub', glyph: 'SUB', label: 'Subbed', detail: 'Japanese audio with English subtitles' },
  { audio: 'dub', glyph: 'DUB', label: 'Dubbed', detail: 'English voice-over audio' }
];

export const MOVIE_SERVERS = [
  { id: 0, name: 'VidStuck', color: 'ffffff' },
  { id: 1, name: 'ZXCStream', color: 'primary' },
  { id: 2, name: 'Bingr', color: 'primary' },
  { id: 3, name: 'Nxsha', color: 'primary' },
  { id: 4, name: 'Flix Vumeto', color: 'primary' },
  { id: 5, name: 'VidLink Pro (Default)', color: 'emerald' },
  { id: 6, name: 'TGVid Fast', color: 'cyan' }
];

export const ANIME_SERVERS = [
  { id: 0, name: 'MegaPlay' },
  { id: 1, name: '4Animo HD-1' },
  { id: 2, name: 'ZokoAnime' },
  { id: 3, name: '4Animo HD-2' },
  { id: 4, name: 'Flix Vumeto' },
  { id: 5, name: 'ZokoAnime Alt' }
];

/**
 * Resolves AniList ID and episode count from title for Anime embed providers
 */
export async function getAniListDetails(title, signal = null) {
  try {
    const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query: 'query ($search: String) { Media(search: $search, type: ANIME) { id episodes nextAiringEpisode { episode } } }',
        variables: { search: title }
      }),
      signal
    });
    if (!res.ok) return null;
    const data = await res.json();
    const media = data.data?.Media;
    if (!media) return null;
    return {
      id: media.id,
      episodes: media.episodes || (media.nextAiringEpisode?.episode ? media.nextAiringEpisode.episode - 1 : 0)
    };
  } catch {
    return null;
  }
}

export async function getAniListId(title, signal = null) {
  const details = await getAniListDetails(title, signal);
  return details?.id ?? null;
}

/**
 * Resolves MyAnimeList (MAL) ID via Jikan API
 */
export async function getMalId(title, signal = null) {
  try {
    const query = new URLSearchParams({ q: title, limit: '1', sfw: 'true' });
    const res = await fetch(`${JIKAN_ANIME_ENDPOINT}?${query}`, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.mal_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Builds the player iframe embed URL for Movies, TV Shows, and Anime
 */
export function buildEmbedUrl({
  item,
  serverIndex = 5,
  season = 1,
  episode = 1,
  anilistId = null,
  malId = null,
  animeAudio = 'sub'
}) {
  const id = item.id;
  const isAnime = item.category === 'anime';
  const isMovie = item.mediaType === 'movie';

  // 1. Anime Player
  if (isAnime) {
    const subDub = animeAudio === 'dub' ? 'dub' : 'sub';
    if (!anilistId) {
      if (malId && (serverIndex === 2 || serverIndex === 5)) {
        return `https://zokoanime.video/stream/mal/${malId}/${episode}/${subDub}?color=ffffff`;
      }
      return null;
    }

    switch (serverIndex) {
      case 0:
        return `https://megaplay.buzz/stream/ani/${anilistId}/${episode}/${subDub}`;
      case 1:
        return `https://cdn.4animo.xyz/embed/hd-1/ani/${anilistId}/${episode}/${subDub}?k=1`;
      case 2:
        return `https://zokoanime.video/stream/anilist/${anilistId}/${episode}/${subDub}?color=ffffff`;
      case 3:
        return `https://cdn.4animo.xyz/embed/hd-2/ani/${anilistId}/${episode}/${subDub}?k=1`;
      case 4:
        return `https://flix.vumeto.xyz/embed/anime/${anilistId}/${episode}?id_type=anilist&dub=${subDub}`;
      default:
        return `https://zokoanime.video/stream/anilist/${anilistId}/${episode}/${subDub}?color=ffffff&alt=1`;
    }
  }

  // 2. Movies
  if (isMovie) {
    switch (serverIndex) {
      case 6:
        return `https://tgvid.lovable.app/embed/movie/${id}`;
      case 0:
        return `https://vidstuck.xyz/embed/movie/${id}?color=ffffff`;
      case 1:
        return `https://zxcstream.xyz/player/movie/${id}`;
      case 2:
        return `https://bingr.one/watch/movie/${id}`;
      case 3:
        return `https://nxsha.space/embed/movie/${id}`;
      case 4:
        return `https://flix.vumeto.xyz/embed/movie/${id}`;
      default:
        return `https://vidlink.pro/movie/${id}?autoplay=true`;
    }
  }

  // 3. TV Series
  switch (serverIndex) {
    case 6:
      return `https://tgvid.lovable.app/embed/tv/${id}/${season}/${episode}`;
    case 0:
      return `https://vidstuck.xyz/embed/tv/${id}/${season}/${episode}?color=ffffff`;
    case 1:
      return `https://zxcstream.xyz/player/tv/${id}?season=${season}&episode=${episode}`;
    case 2:
      return `https://bingr.one/watch/tv/${id}/${season}/${episode}`;
    case 3:
      return `https://nxsha.space/embed/tv/${id}/${season}/${episode}`;
    case 4:
      return `https://flix.vumeto.xyz/embed/tv/${id}/${season}/${episode}`;
    default:
      return `https://vidlink.pro/tv/${id}/${season}/${episode}?autoplay=true`;
  }
}
