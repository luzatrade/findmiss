const express = require('express');
const { PrismaClient } = require('@prisma/client');

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
    res.status(500).json({ success: false, error: 'Errore server' });
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
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;