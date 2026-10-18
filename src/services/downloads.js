/**
 * Download Service for Cinevo
 * Interacts with Telegram file downloader service to obtain 4K, 1080p, 720p files and Hindi dubbed audio options.
 */

import { DOWNLOAD_SERVICE_ENDPOINT } from '../config/constants.js';

function parseAudioAndKind(name, url) {
  const paren = name.match(/\((.*)\)\s*$/)?.[1] ?? '';
  const bracket = paren.match(/\[(.*?)\]/)?.[1] ?? '';
  const audio = /hindi|english|tamil|telugu|malayalam|kannada|bengali|punjabi|dual|multi/i.test(bracket)
    ? bracket
    : '';
  const kind = /share/i.test(`${paren} ${url}`) ? 'share' : 'direct';

  return { audio, kind };
}

/**
 * Fetch available download links for a movie or TV show episode
 */
export async function fetchDownloads({ item, season = 1, episode = 1, signal = null }) {
  const endpoint = item.mediaType === 'movie'
    ? `movie/${item.id}`
    : `tv/${item.id}/${season}/${episode}`;

  try {
    const res = await fetch(`${DOWNLOAD_SERVICE_ENDPOINT}/${endpoint}`, { signal });
    if (res.status === 404) {
      return [];
    }
    if (res.status === 429) {
      throw new Error('Too many requests. Please wait a few seconds and try again.');
    }
    if (!res.ok) {
      throw new Error(`Download service returned status ${res.status}`);
    }

    const data = await res.json();
    const rawList = Array.isArray(data.downloads) && data.downloads.length > 0
      ? data.downloads
      : data.download_url
      ? [data]
      : [];

    const seenUrls = new Set();
    const results = [];

    for (const d of rawList) {
      const url = d.download_url;
      if (!url || !url.startsWith('https://') || seenUrls.has(url)) continue;
      seenUrls.add(url);

      const name = d.name || 'Download file';
      results.push({
        source: 'TG Fetcher',
        name,
        quality: d.quality || 'Available',
        size: d.size || '',
        url,
        ...parseAudioAndKind(name, url)
      });
    }

    return results;
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new Error(err.message || 'Could not load download links.');
  }
}
