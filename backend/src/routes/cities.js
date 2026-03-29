const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { getFallbackCities, getFallbackCityBySlug } = require('../data/fallbackData');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    const where = { is_active: true };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const cities = await prisma.city.findMany({
      where,
      take: parseInt(limit),
      orderBy: { population: 'desc' }
    });

    res.json({ success: true, data: cities });
  } catch (error) {
    const cities = getFallbackCities({ search: req.query.search, limit: req.query.limit });
    res.json({ success: true, data: cities, fallback: true });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const city = await prisma.city.findUnique({ where: { slug } });

    if (!city) {
      return res.status(404).json({ success: false, error: 'Città non trovata' });
    }

    const announcementsCount = await prisma.announcement.count({
      where: { city_id: city.id, status: 'active' }
    });

    res.json({ success: true, data: { ...city, announcements_count: announcementsCount } });
  } catch (error) {
    const city = getFallbackCityBySlug(req.params.slug);
    if (!city) {
      return res.status(404).json({ success: false, error: 'Città non trovata' });
    }

    return res.json({ success: true, data: city, fallback: true });
  }
});

module.exports = router;
