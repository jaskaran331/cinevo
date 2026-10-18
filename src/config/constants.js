/**
 * Cinevo Constants & Configuration
 * Next-Generation OTT Discovery, Streaming & Live TV Platform
 */

export const TMDB_CONFIG = {
  API_KEY: 'fca1c3fa675f74cf4aa8d24b72dd4807',
  BASE_URL: 'https://api.tmdb.org/3',
  FALLBACK_BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  POSTER_SIZE: 'w500',
  BACKDROP_SIZE: 'original',
  LOGO_SIZE: 'w154'
};

export const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';
export const JIKAN_ANIME_ENDPOINT = 'https://api.jikan.moe/v4/anime';

export const LIVE_TV_CONFIG = {
  BASE_URL: 'https://livetgtv.lovable.app',
  CHANNELS_INDIA: 'https://livetgtv.lovable.app/api/public/channels',
  CHANNELS_WORLD: 'https://livetgtv.lovable.app/api/public/v2/channels',
  EMBED_INDIA: 'https://livetgtv.lovable.app/embed/',
  EMBED_WORLD: 'https://livetgtv.lovable.app/v2/embed/'
};

export const DOWNLOAD_SERVICE_ENDPOINT = 'https://tgdl.lovable.app/api';

export const OTT_PLATFORMS = [
  {
    id: 8,
    tmdbId: 8,
    key: 'netflix',
    name: 'Netflix',
    accent: '#e50914',
    region: 'US',
    domain: 'netflix.com',
    logoPath: '/rK1KljqmbvO9HQa1PBFLILWah72.png'
  },
  {
    id: 119,
    tmdbId: '9|119',
    key: 'prime',
    name: 'Prime Video',
    accent: '#00a8e1',
    region: 'US',
    domain: 'primevideo.com',
    logoPath: '/gMZdpavHmxFNnLpMHwVxfqeux2g.png'
  },
  {
    id: 337,
    tmdbId: 337,
    key: 'disney',
    name: 'Disney+',
    accent: '#2d7dff',
    region: 'US',
    domain: 'disneyplus.com',
    logoPath: '/5eZ872CghnHFLB1j8grszbrx0dx.png'
  },
  {
    id: 1899,
    tmdbId: '1899|1825',
    key: 'max',
    name: 'HBO Max',
    accent: '#9a4bff',
    region: 'US',
    domain: 'hbomax.com',
    logoPath: '/64fLWeSyZ1KQZhIdvTdy4QHeWty.png'
  },
  {
    id: 15,
    tmdbId: 15,
    key: 'hulu',
    name: 'Hulu',
    accent: '#1ce783',
    region: 'US',
    domain: 'hulu.com',
    logoPath: '/44uAnmSqvA4yBOdbPWN8YgQHjWm.png'
  },
  {
    id: 350,
    tmdbId: 350,
    key: 'appletv',
    name: 'Apple TV',
    accent: '#d6d9dd',
    region: 'US',
    domain: 'tv.apple.com',
    logoPath: '/9icYBfYFcwgCbky5VdGUIKJ4C5i.png'
  },
  {
    id: 2303,
    tmdbId: '531|2303|2616',
    key: 'paramount',
    name: 'Paramount+',
    accent: '#2b7bff',
    region: 'US',
    domain: 'paramountplus.com',
    logoPath: '/4N4BMd0Mm0kHAmF7RZgL5lW3cwc.png'
  },
  {
    id: 386,
    tmdbId: 386,
    key: 'peacock',
    name: 'Peacock',
    accent: '#ffc44d',
    region: 'US',
    domain: 'peacocktv.com',
    logoPath: '/a1UIdq5BrkcAxnxcUhFsNbXnxeu.png'
  },
  {
    id: 2336,
    tmdbId: '2336|122',
    key: 'hotstar',
    name: 'JioHotstar',
    accent: '#2f8fff',
    region: 'IN',
    domain: 'hotstar.com',
    logoPath: '/ledoS6EgdjTNq8F1e6wubUQer18.png'
  },
  {
    id: 237,
    tmdbId: 237,
    key: 'sonyliv',
    name: 'SonyLIV',
    accent: '#ff4757',
    region: 'IN',
    domain: 'sonyliv.com',
    logoPath: '/coM4QWbmIOa0xJ5cGR9BRmoV25B.png'
  },
  {
    id: 232,
    tmdbId: 232,
    key: 'zee5',
    name: 'ZEE5',
    accent: '#a855f7',
    region: 'IN',
    domain: 'zee5.com',
    logoPath: '/uQvhdtB8skccsGHmvKi3y5bqBsX.png'
  },
  {
    id: 283,
    tmdbId: 283,
    key: 'crunchyroll',
    name: 'Crunchyroll',
    accent: '#f47521',
    region: 'US',
    domain: 'crunchyroll.com',
    logoPath: '/uFL3c4Cq8M6WoLymlC5Y8bmGytV.png'
  }
];

export const DRAMA_REGIONS = [
  { key: 'kdrama', name: 'K-Drama', flag: '🇰🇷', language: 'ko', country: 'KR' },
  { key: 'cdrama', name: 'C-Drama', flag: '🇨🇳', language: 'zh', country: 'CN' },
  { key: 'jdrama', name: 'J-Drama', flag: '🇯🇵', language: 'ja', country: 'JP' },
  { key: 'thaidrama', name: 'Thai Drama', flag: '🇹🇭', language: 'th', country: 'TH' },
  { key: 'turkishdrama', name: 'Turkish Drama', flag: '🇹🇷', language: 'tr', country: 'TR' },
  { key: 'taiwandrama', name: 'Taiwanese Drama', flag: '🇹🇼', language: 'zh', country: 'TW' },
  { key: 'philippinedrama', name: 'Filipino Drama', flag: '🇵🇭', language: 'tl', country: 'PH' },
  { key: 'spanishdrama', name: 'Spanish Drama', flag: '🇪🇸', language: 'es', country: 'ES' }
];

export const STORAGE_KEYS = {
  WATCHLIST: 'cinevo-watchlist-v1',
  AUDIO_SKIP: 'cinevo-audio-skip',
  AUDIO_LAST: (type) => `cinevo-audio-last-${type}`,
  SHARE_SNOOZE: 'cinevo-share-snooze'
};
