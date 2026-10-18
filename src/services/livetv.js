/**
 * Live TV Service for Cinevo
 * Fetches Live TV channel playlists from Lovable TV backend, parses genres, sports, and language tags.
 */

import { LIVE_TV_CONFIG } from '../config/constants.js';

export const LIVE_GENRES = [
  { key: 'sports', label: 'Sports', icon: '🏏' },
  { key: 'movies', label: 'Movies', icon: '🎬' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { key: 'kids', label: 'Kids', icon: '🧸' },
  { key: 'news', label: 'News', icon: '📰' },
  { key: 'discovery', label: 'Discovery & Science', icon: '🔭' },
  { key: 'music', label: 'Music', icon: '🎵' },
  { key: 'devotional', label: 'Devotional', icon: '🕉️' }
];

export const LIVE_SPORTS_CATEGORIES = [
  { key: 'cricket', label: 'Cricket', icon: '🏏' },
  { key: 'football', label: 'Football', icon: '⚽' },
  { key: 'badminton', label: 'Badminton', icon: '🏸' },
  { key: 'tennis', label: 'Tennis', icon: '🎾' },
  { key: 'motorsport', label: 'Motorsport', icon: '🏎️' },
  { key: 'combat', label: 'Wrestling & MMA', icon: '🥊' },
  { key: 'kabaddi', label: 'Kabaddi', icon: '🤼' },
  { key: 'hockey', label: 'Hockey', icon: '🏑' },
  { key: 'basketball', label: 'Basketball', icon: '🏀' },
  { key: 'golf', label: 'Golf', icon: '⛳' },
  { key: 'esports', label: 'Esports', icon: '🎮' }
];

const LANGUAGE_PATTERNS = [
  ['Hindi', /\bhindi\b/i],
  ['English', /\benglish\b/i],
  ['Tamil', /\btamil\b/i],
  ['Telugu', /\btelugu\b/i],
  ['Malayalam', /\bmalayalam\b/i],
  ['Kannada', /\bkannada\b/i],
  ['Marathi', /\bmarathi\b/i],
  ['Bengali', /\b(bangla|bengali)\b/i],
  ['Gujarati', /\bgujarati\b/i],
  ['Punjabi', /\bpunjabi\b/i],
  ['Odia', /\b(odia|oriya)\b/i],
  ['Assamese', /\bassamese\b/i],
  ['Bhojpuri', /\bbhojpuri\b/i],
  ['Urdu', /\burdu\b/i]
];

function detectLanguage(text) {
  for (const [lang, regex] of LANGUAGE_PATTERNS) {
    if (regex.test(text)) return lang;
  }
  return null;
}

function detectGenre(channelName, declaredCategory = '') {
  const text = `${channelName} ${declaredCategory}`.toLowerCase();
  if (/sport|espn|bein|dazn|nba|nfl|cricket|football|soccer|tennis|f1|wwe|ufc|star sports|sony ten|ten sports|willow/i.test(text)) {
    return 'sports';
  }
  if (/cartoon|nick|pogo|kids|disney|hungama|sonic|chutti|baby tv|toons|sony yay|cbeebies/i.test(text)) {
    return 'kids';
  }
  if (/news|ndtv|cnbc|times now|republic|wion|tv9|abp|cnn|bbc world|al jazeera|bloomberg|aaj tak|india today/i.test(text)) {
    return 'news';
  }
  if (/discovery|nat geo|national geographic|animal planet|history|tlc|science|travelxp|bbc earth|curiosity/i.test(text)) {
    return 'discovery';
  }
  if (/movie|cinema|pictures|gold|max|talkies|flix|hbo|cine|filmy|star movies|sony pix/i.test(text)) {
    return 'movies';
  }
  if (/music|mtv|9xm|zing|mastiii|9x|mtunes/i.test(text)) {
    return 'music';
  }
  if (/aastha|sanskar|devotional|bhakti|ishwar|satsang|divya|peace of mind/i.test(text)) {
    return 'devotional';
  }
  return 'entertainment';
}

/**
 * Normalizes a raw channel object
 */
function normalizeChannel(raw, isWorld = false) {
  const name = (raw.name || `Channel ${raw.id}`).trim();
  const genre = detectGenre(name, raw.category || '');
  const language = detectLanguage(name) || detectLanguage(raw.category || '') || (genre === 'sports' ? 'English' : 'Hindi');
  const hd = /\b(hd|uhd|4k)\b/i.test(name);

  return {
    id: String(raw.id),
    name,
    logo: raw.logo || null,
    genre,
    language,
    hd,
    isWorld,
    embedUrl: isWorld ? `${LIVE_TV_CONFIG.EMBED_WORLD}${raw.id}` : `${LIVE_TV_CONFIG.EMBED_INDIA}${raw.id}`
  };
}

/**
 * Fetch channels from Lovable Live TV backend
 * @param {'india'|'world'} region
 */
export async function getLiveChannels(region = 'india', signal = null) {
  const isWorld = region === 'world';
  const url = isWorld ? LIVE_TV_CONFIG.CHANNELS_WORLD : LIVE_TV_CONFIG.CHANNELS_INDIA;

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load Live TV channels (${res.status})`);
  }

  const data = await res.json();
  const rawList = data.channels || [];
  return rawList
    .map(ch => normalizeChannel(ch, isWorld))
    .sort((a, b) => a.name.localeCompare(b.name));
}
