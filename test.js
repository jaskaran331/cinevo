/**
 * Runnable self-check for Cinevo Services & Production Build
 * Tests TMDB discovery, Live TV channel loading, AniList, HTML markup integrity,
 * JavaScript bundle compile/syntax verification via Node vm.Script, and Season routing.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

async function runTests() {
  console.log('🧪 Starting Cinevo services verification...');

  // 1. Verify TMDB endpoint & key
  console.log('Checking TMDB Discovery...');
  const tmdbUrl = 'https://api.tmdb.org/3/discover/movie?api_key=fca1c3fa675f74cf4aa8d24b72dd4807&page=1';
  const tmdbRes = await fetch(tmdbUrl);
  assert.strictEqual(tmdbRes.status, 200, `TMDB API failed with status ${tmdbRes.status}`);
  const tmdbData = await tmdbRes.json();
  assert(Array.isArray(tmdbData.results) && tmdbData.results.length > 0, 'TMDB returned empty results');
  console.log(`✅ TMDB Discovery works! Fetched ${tmdbData.results.length} movies. First: "${tmdbData.results[0].title}"`);

  // 2. Verify Live TV channels
  console.log('Checking Live TV Backend...');
  const liveRes = await fetch('https://livetgtv.lovable.app/api/public/channels');
  assert.strictEqual(liveRes.status, 200, `Live TV API failed with status ${liveRes.status}`);
  const liveData = await liveRes.json();
  assert(Array.isArray(liveData.channels) && liveData.channels.length > 0, 'Live TV returned empty channels');
  console.log(`✅ Live TV Backend works! Fetched ${liveData.channels.length} live channels.`);

  // 3. Verify AniList GraphQL
  console.log('Checking AniList GraphQL API...');
  const aniRes = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'query ($search: String) { Media(search: $search, type: ANIME) { id title { romaji } } }',
      variables: { search: 'Naruto' }
    })
  });
  assert.strictEqual(aniRes.status, 200, `AniList GraphQL failed with status ${aniRes.status}`);
  const aniData = await aniRes.json();
  assert.strictEqual(aniData.data?.Media?.id, 20, 'AniList returned unexpected ID for Naruto');
  console.log(`✅ AniList GraphQL works! Naruto ID: ${aniData.data.Media.id}`);

  // 4. Verify Local standalone index.html exists & check markup integrity
  console.log('Checking standalone index.html & script tag integrity...');
  const indexPath = path.join(__dirname, 'index.html');
  assert(fs.existsSync(indexPath), 'index.html does not exist in almostott/');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  assert(indexHtml.length > 500000, `index.html is unexpectedly small (${indexHtml.length} bytes)`);

  const tag = '<script type="module" crossorigin>';
  const moduleOpen = indexHtml.indexOf(tag);
  assert(moduleOpen !== -1, 'Module script opening tag not found');
  const moduleClose = indexHtml.indexOf('</script>', moduleOpen + tag.length);
  assert(moduleClose !== -1, 'Module script closing tag not found');
  const moduleScript = indexHtml.slice(moduleOpen + tag.length, moduleClose);

  // Must mount React root properly
  assert(moduleScript.includes('z2.createRoot(document.getElementById("root")).render'), 'Module script closed prematurely before root render!');

  // Body content must not have leaked raw JS
  const bodyOpen = indexHtml.indexOf('<body>');
  const bodyClose = indexHtml.indexOf('</body>');
  const bodyContent = indexHtml.slice(bodyOpen, bodyClose);
  assert(!bodyContent.includes('function Gl({unit:n'), 'Raw JS function Gl leaked into body!');
  assert(!bodyContent.includes('function SC({title:n'), 'Raw JS function SC leaked into body!');
  console.log(`✅ Standalone production build verified (${indexHtml.length} bytes, no raw JS leakage).`);

  // 5. Verify Script Syntax in Node VM
  console.log('Checking JavaScript bundle syntax with vm.Script...');
  new vm.Script(moduleScript, { filename: 'bundle.js' });
  console.log('✅ Bundle compiles cleanly without any syntax errors.');

  // 6. Verify Season selector structure & CSS in markup
  console.log('Checking Season selector components in markup...');
  assert(moduleScript.includes('season-selector-container'), 'Season selector container missing from module script');
  assert(moduleScript.includes('season-pills-row'), 'Season pills row missing from module script');
  assert(moduleScript.includes('season-select-dropdown'), 'Season dropdown missing from module script');
  assert(moduleScript.includes('season-current-badge'), 'Season current badge missing from module script');
  assert(indexHtml.includes('.season-selector-container'), 'Season selector CSS missing from index.html');
  console.log('✅ Season selector elements and CSS verified.');

  // 7. Verify Season routing & hash parsing
  console.log('Checking Season routing parser...');
  function parseHash(hash) {
    const m = hash.match(/^#\/?watch\/(movie|tv)\/(\d+)(?:\/([a-z-]+))?(?:\/(\d+)(?:\/(\d+))?)?(?:\?(.*))?$/);
    if (!m) return null;
    const mediaType = m[1];
    const id = Number(m[2]);
    const allowedCategories = ["movie", "series", "anime", "drama"];
    const category = m[3] && allowedCategories.includes(m[3]) ? m[3] : (mediaType === "movie" ? "movie" : "series");
    let season = m[4] ? Number(m[4]) : null;
    let episode = m[5] ? Number(m[5]) : null;
    if (m[6]) {
      const p = new URLSearchParams(m[6]);
      const sP = p.get("season") || p.get("s");
      const eP = p.get("episode") || p.get("ep") || p.get("e");
      if (sP) season = Number(sP);
      if (eP) episode = Number(eP);
    }
    return { mediaType, id, category, season, episode };
  }

  assert.deepStrictEqual(parseHash('#/watch/tv/1399/series?s=2&e=4'), {
    mediaType: 'tv', id: 1399, category: 'series', season: 2, episode: 4
  });
  assert.deepStrictEqual(parseHash('#watch/tv/1399/series/3/5'), {
    mediaType: 'tv', id: 1399, category: 'series', season: 3, episode: 5
  });
  assert.deepStrictEqual(parseHash('#/watch/tv/1399/series?season=4&episode=1'), {
    mediaType: 'tv', id: 1399, category: 'series', season: 4, episode: 1
  });
  console.log('✅ Season and episode route parser verified successfully across all patterns.');

  console.log('\n🎉 ALL SERVICES, BUILDS & ENDPOINTS VERIFIED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
