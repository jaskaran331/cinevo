module.exports = (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'cinevo1.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;

  const robots = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-Video
Allow: /

User-agent: Bingbot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(robots);
};
