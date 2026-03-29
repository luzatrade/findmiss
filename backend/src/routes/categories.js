const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { getFallbackCategories } = require('../data/fallbackData');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.json({ success: true, data: getFallbackCategories(), fallback: true });
  }
});

module.exports = router;
