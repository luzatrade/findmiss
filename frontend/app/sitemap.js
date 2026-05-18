const BASE_URL = 'https://www.findmiss.it';

/** Pagine pubbliche indicizzabili (escluse area admin e account). */
const staticPaths = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/citta', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/filtri', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/reels', changeFrequency: 'daily', priority: 0.6 },
  { path: '/stories', changeFrequency: 'daily', priority: 0.6 },
  { path: '/policy', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/termini-condizioni.html', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap() {
  const lastModified = new Date();
  return staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
