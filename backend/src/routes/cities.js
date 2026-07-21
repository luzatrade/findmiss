const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { getFallbackCities, getFallbackCityBySlug } = require('../data/fallbackData');
const { getItalianCities, getItalianCityBySlug } = require('../data/italianCities');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { search, limit = 200 } = req.query;
    const where = { is_active: true };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const cities = await prisma.city.findMany({
      where,
      take: parseInt(limit),
      orderBy: { population: 'desc' }
    });

    if (cities.length === 0) {
      const fallback = getItalianCities({ search, limit });
      return res.json({ success: true, data: fallback, source: 'catalog' });
    }

    res.json({ success: true, data: cities });
  } catch (error) {
    const cities = getItalianCities({ search: req.query.search, limit: req.query.limit });
    if (cities.length > 0) {
      return res.json({ success: true, data: cities, source: 'catalog' });
    }
    const fallback = getFallbackCities({ search: req.query.search, limit: req.query.limit });
    res.json({ success: true, data: fallback, fallback: true });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const city = await prisma.city.findUnique({ where: { slug } });

    if (!city) {
      const catalogCity = getItalianCityBySlug(slug);
      if (catalogCity) {
        return res.json({
          success: true,
          data: { ...catalogCity, announcements_count: 0 },
          source: 'catalog',
        });
      }
      return res.status(404).json({ success: false, error: 'Città non trovata' });
    }

    const announcementsCount = await prisma.announcement.count({
      where: { city_id: city.id, status: 'active' }
    });

    res.json({ success: true, data: { ...city, announcements_count: announcementsCount } });
  } catch (error) {
    const city = getItalianCityBySlug(req.params.slug) || getFallbackCityBySlug(req.params.slug);
    if (!city) {
      return res.status(404).json({ success: false, error: 'Città non trovata' });
    }

    return res.json({
      success: true,
      data: { ...city, announcements_count: city.announcements_count || 0 },
      source: city.slug ? 'catalog' : 'fallback',
    });
  }
});

module.exports = router;
