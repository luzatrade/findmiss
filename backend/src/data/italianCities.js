const fs = require('fs');
const path = require('path');

const ITALIAN_CITIES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../data/italian-cities.json'), 'utf8')
);

function getItalianCities(options = {}) {
  const search = options.search ? String(options.search).trim().toLowerCase() : '';
  const region = options.region ? String(options.region).trim().toLowerCase() : '';
  const limit = Number.parseInt(options.limit, 10);
  const take = Number.isFinite(limit) && limit > 0 ? limit : ITALIAN_CITIES.length;

  let items = ITALIAN_CITIES.filter((city) => city.slug && city.name);

  if (search) {
    items = items.filter(
      (city) =>
        city.name.toLowerCase().includes(search) ||
        city.slug.includes(search) ||
        (city.region && city.region.toLowerCase().includes(search))
    );
  }

  if (region) {
    items = items.filter((city) => city.region && city.region.toLowerCase() === region);
  }

  return items
    .slice()
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, take)
    .map((city) => ({
      ...city,
      country: 'IT',
      is_active: true,
    }));
}

function getItalianCityBySlug(slug) {
  const normalized = String(slug || '').trim().toLowerCase();
  const city = ITALIAN_CITIES.find((item) => item.slug === normalized);
  if (!city) return null;
  return {
    ...city,
    country: 'IT',
    is_active: true,
  };
}

function getItalianRegions() {
  const regions = new Set(ITALIAN_CITIES.map((city) => city.region).filter(Boolean));
  return Array.from(regions).sort((a, b) => a.localeCompare(b, 'it'));
}

async function ensureItalianCities(prisma) {
  let created = 0;
  let updated = 0;

  for (const city of ITALIAN_CITIES) {
    const existing = await prisma.city.findUnique({ where: { slug: city.slug } });
    const payload = {
      name: city.name,
      region: city.region || null,
      country: 'IT',
      latitude: city.latitude ?? null,
      longitude: city.longitude ?? null,
      population: city.population ?? null,
      is_active: true,
    };

    if (existing) {
      await prisma.city.update({ where: { slug: city.slug }, data: payload });
      updated += 1;
    } else {
      await prisma.city.create({ data: { slug: city.slug, ...payload } });
      created += 1;
    }
  }

  return { created, updated, total: ITALIAN_CITIES.length };
}

module.exports = {
  ITALIAN_CITIES,
  getItalianCities,
  getItalianCityBySlug,
  getItalianRegions,
  ensureItalianCities,
};
