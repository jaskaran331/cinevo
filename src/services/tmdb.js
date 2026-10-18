/**
 * TMDB API Service for Cinevo
 * Handles content discovery, search, details, cast, trailers, and platform-filtered queries
 */

import { TMDB_CONFIG, DRAMA_REGIONS } from '../config/constants.js';

const { API_KEY, BASE_URL, FALLBACK_BASE_URL, IMAGE_BASE_URL } = TMDB_CONFIG;

/**
 * Fetch from TMDB with fallback base URL and automatic retries
 */
export async function tmdbFetch(endpoint, params = {}, signal = null) {
  const query = new URLSearchParams({
    api_key: API_KEY,
    ...params
  });

  const hosts = [BASE_URL, FALLBACK_BASE_URL];
  let lastError = null;

  for (const host of hosts) {
    try {
      const res = await fetch(`${host}${endpoint}?${query.toString()}`, { signal });
      if (!res.ok) {
        throw new Error(`TMDB HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    }
  }

  throw lastError || new Error('TMDB could not be reached.');
}

/**
 * Construct full image URL for posters, backdrops, and logos
 */
export function getImageUrl(path, size = 'w500') {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Normalizes TMDB raw item to Cinevo clean data model
 */
export function normalizeItem(raw, defaultMediaType = 'movie', defaultCategory = null) {
  const mediaType = raw.media_type === 'movie' || raw.title ? 'movie' : (defaultMediaType || 'tv');
  const title = raw.title || raw.name || raw.original_title || raw.original_name || 'Untitled';
  const releaseDate = raw.release_date || raw.first_air_date || '';
  const genreIds = raw.genre_ids || (raw.genres ? raw.genres.map(g => g.id) : []);

  let category = defaultCategory;
  if (!category) {
    if (genreIds.includes(16) || raw.original_language === 'ja') {
      category = 'anime';
    } else if (['ko', 'zh', 'ja', 'th', 'tr', 'tl'].includes(raw.original_language)) {
      category = 'drama';
    } else {
      category = mediaType;
    }
  }

  return {
    id: raw.id,
    mediaType,
    category,
    title,
    originalTitle: raw.original_title || raw.original_name || title,
    overview: raw.overview || '',
    posterPath: raw.poster_path || null,
    backdropPath: raw.backdrop_path || null,
    releaseDate,
    rating: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : 0,
    voteCount: raw.vote_count || 0,
    genreIds,
    originalLanguage: raw.original_language || 'en'
  };
}

/**
 * Discover titles by category (movies, series, anime, drama)
 */
export async function discoverTitles(category = 'movie', genreId = null, page = 1, signal = null, dramaRegionKey = 'kdrama', animeSort = 'latest') {
  const isAnimeMovie = category === 'anime' && animeSort === 'movie';
  const mediaType = isAnimeMovie ? 'movie' : category === 'movie' ? 'movie' : 'tv';
  const params = {
    page,
    sort_by: 'popularity.desc',
    'vote_count.gte': 10
  };

  if (category === 'anime') {
    params.with_original_language = 'ja';
    params.with_origin_country = 'JP';
    params.with_genres = genreId ? `16,${genreId}` : '16';
    if (animeSort === 'popular') {
      params.sort_by = 'popularity.desc';
    } else if (animeSort === 'movie') {
      params.sort_by = 'popularity.desc';
    } else {
      params['first_air_date.gte'] = '2021-01-01';
      params.sort_by = 'popularity.desc';
    }
  } else if (category === 'drama') {
    const region = DRAMA_REGIONS.find(r => r.key === dramaRegionKey) || DRAMA_REGIONS[0];
    params.with_original_language = region.language;
    params.with_origin_country = region.country;
    params.with_genres = genreId ? `18,${genreId}` : '18';
    params['vote_count.gte'] = 3;
  } else if (genreId) {
    params.with_genres = genreId;
  }

  const data = await tmdbFetch(`/discover/${mediaType}`, params, signal);
  return {
    items: (data.results || []).map(r => normalizeItem(r, mediaType, isAnimeMovie ? 'movie' : category)),
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0
  };
}

/**
 * Discover titles for a specific OTT platform (e.g. Netflix, Prime Video, Disney+)
 */
export async function discoverByPlatform(platform, mediaType = 'movie', genreId = null, page = 1, signal = null) {
  const params = {
    page,
    sort_by: 'popularity.desc',
    with_watch_providers: platform.tmdbId,
    watch_region: platform.region || 'US',
    'vote_count.gte': 5
  };

  if (genreId) {
    params.with_genres = genreId;
  }

  const data = await tmdbFetch(`/discover/${mediaType}`, params, signal);
  return {
    items: (data.results || []).map(r => normalizeItem(r, mediaType)),
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0
  };
}

const KNOWN_ANIME_MAP = [
  { match: /thousand[- ]year|tybw|blood war/i, tmdbId: 30984, season: 2, title: "BLEACH: Thousand-Year Blood War" },
  { match: /the separation/i, tmdbId: 30984, season: 3, title: "BLEACH: TYBW - The Separation" },
  { match: /the conflict/i, tmdbId: 30984, season: 4, title: "BLEACH: TYBW - The Conflict" },
  { match: /solo leveling.*(?:season 2|arise|shadow)/i, tmdbId: 127532, season: 2, title: "Solo Leveling Season 2 -Arise from the Shadow-" },
  { match: /mugen train/i, tmdbId: 85937, season: 2, title: "Demon Slayer: Mugen Train Arc" },
  { match: /entertainment district/i, tmdbId: 85937, season: 3, title: "Demon Slayer: Entertainment District Arc" },
  { match: /swordsmith village/i, tmdbId: 85937, season: 4, title: "Demon Slayer: Swordsmith Village Arc" },
  { match: /hashira training/i, tmdbId: 85937, season: 5, title: "Demon Slayer: Hashira Training Arc" },
  { match: /final season.*part 2/i, tmdbId: 1429, season: 5, title: "Attack on Titan: The Final Season Part 2" },
  { match: /final (?:chapters|season.*part 3)/i, tmdbId: 1429, season: 6, title: "Attack on Titan: The Final Chapters" },
  { match: /final season/i, tmdbId: 1429, season: 4, title: "Attack on Titan: The Final Season" },
  { match: /shibuya incident|jujutsu kaisen.*season 2/i, tmdbId: 95479, season: 2, title: "Jujutsu Kaisen Season 2: Shibuya Incident" }
];

/**
 * Instant multi-search across movies & TV shows
 */
export async function searchTitles(query, signal = null) {
  if (!query || query.trim().length < 2) return [];

  const tmdbP = tmdbFetch('/search/multi', { query: query.trim() }, signal)
    .then(data => (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv').map(item => normalizeItem(item)))
    .catch(() => []);

  const aniQry = `query ($search: String) {
    Page(page: 1, perPage: 12) {
      media(search: $search, type: ANIME, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
        id
        title { romaji english native }
        format
        status
        episodes
        seasonYear
        coverImage { extraLarge large }
        bannerImage
        description
        averageScore
      }
    }
  }`;

  const aniP = fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: aniQry, variables: { search: query.trim() } }),
    signal
  }).then(async r => {
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data?.Page?.media || []).map(m => {
      const engTitle = m.title.english || m.title.romaji || 'Untitled';
      const fullTxt = `${engTitle} ${m.title.romaji || ''}`;
      const mapped = KNOWN_ANIME_MAP.find(k => k.match.test(fullTxt));

      return {
        id: mapped ? mapped.tmdbId : m.id,
        mediaType: m.format === 'MOVIE' ? 'movie' : 'tv',
        category: 'anime',
        title: mapped ? mapped.title : engTitle,
        originalTitle: m.title.native || m.title.romaji || '',
        overview: m.description ? m.description.replace(/<[^>]*>/g, '') : '',
        posterPath: m.coverImage?.extraLarge || m.coverImage?.large || null,
        backdropPath: m.bannerImage || m.coverImage?.extraLarge || null,
        releaseDate: m.seasonYear ? String(m.seasonYear) : '',
        rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 0,
        voteCount: 100,
        genreIds: [16],
        originalLanguage: 'ja',
        targetSeason: mapped ? mapped.season : null,
        aniId: m.id,
        isAniList: !mapped
      };
    });
  }).catch(() => []);

  const [tItems, aItems] = await Promise.all([tmdbP, aniP]);
  const seen = new Set();
  const merged = [];

  for (const item of [...aItems, ...tItems]) {
    const key = `${item.category}-${(item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  return merged;
}

/**
 * Fetch full item details, videos, credits, seasons, and episodes
 */
export async function getTitleDetails(mediaType, id, signal = null) {
  try {
    const data = await tmdbFetch(`/${mediaType}/${id}`, {
      append_to_response: 'videos,credits,recommendations'
    }, signal);

    const base = normalizeItem(data, mediaType);

    const youtubeVideos = (data.videos?.results || []).filter(v => v.site === 'YouTube');
    const trailerVideo = youtubeVideos.find(v => v.type === 'Trailer' && v.official)
      || youtubeVideos.find(v => v.type === 'Trailer')
      || youtubeVideos.find(v => v.type === 'Teaser')
      || youtubeVideos[0];

    return {
      ...base,
      tagline: data.tagline || '',
      runtime: data.runtime ?? null,
      episodeRuntime: data.episode_run_time?.[0] ?? null,
      numberOfSeasons: data.number_of_seasons || 0,
      numberOfEpisodes: data.number_of_episodes || 0,
      seasons: (data.seasons || [])
        .filter(s => s.season_number > 0)
        .map(s => ({
          id: s.id,
          name: s.name,
          seasonNumber: s.season_number,
          episodeCount: s.episode_count,
          posterPath: s.poster_path
        })),
      trailerKey: trailerVideo?.key || null,
      cast: (data.credits?.cast || []).slice(0, 15).map(c => ({
        id: c.id,
        name: c.name,
        character: c.character || '',
        profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w185') : null
      })),
      recommendations: (data.recommendations?.results || []).slice(0, 12).map(r => normalizeItem(r, mediaType))
    };
  } catch (err) {
    // If TMDB 404s, attempt AniList lookup
    try {
      const qry = `query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          format
          status
          episodes
          seasonYear
          coverImage { extraLarge large }
          bannerImage
          description
          averageScore
          trailer { id site }
        }
      }`;
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: qry, variables: { id: Number(id) } }),
        signal
      });
      if (res.ok) {
        const d = await res.json();
        const m = d.data?.Media;
        if (m) {
          const epCount = m.episodes || 12;
          return {
            id: m.id,
            mediaType: m.format === 'MOVIE' ? 'movie' : 'tv',
            category: 'anime',
            title: m.title.english || m.title.romaji || 'Untitled',
            originalTitle: m.title.native || m.title.romaji || '',
            overview: m.description ? m.description.replace(/<[^>]*>/g, '') : '',
            posterPath: m.coverImage?.extraLarge || m.coverImage?.large || null,
            backdropPath: m.bannerImage || m.coverImage?.extraLarge || null,
            releaseDate: m.seasonYear ? String(m.seasonYear) : '',
            rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 0,
            voteCount: 100,
            genreIds: [16],
            originalLanguage: 'ja',
            aniId: m.id,
            isAniList: true,
            tagline: '',
            runtime: null,
            episodeRuntime: 24,
            numberOfSeasons: 1,
            numberOfEpisodes: epCount,
            seasons: [{ id: 1, seasonNumber: 1, name: 'Complete Series', episodeCount: epCount, aniId: m.id, isDef: true }],
            trailerKey: m.trailer?.site === 'youtube' ? m.trailer.id : null,
            cast: [],
            recommendations: []
          };
        }
      }
    } catch (e2) {}
    throw err;
  }
}

