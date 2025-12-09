const express = require('express');
const { PrismaClient } = require('@prisma/client');

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
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;