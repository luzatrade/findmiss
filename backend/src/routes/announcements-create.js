const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/announcements - Crea nuovo annuncio
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      category_id,
      city_id,
      title,
      description,
      stage_name,
      age,
      height,
      weight,
      hair_color,
      hair_length,
      eye_color,
      ethnicity,
      cup_size,
      language,
      nationality,
      smoker,
      price_30min,
      price_1hour,
      price_2hour,
      price_night,
      price_videochat,
      is_available_now,
      available_overnight,
      working_hours_start,
      working_hours_end,
      available_for,
      services,
      phone_visible
    } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ success: false, error: 'Titolo e categoria richiesti' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        user_id: userId,
        category_id,
        city_id: city_id || null,
        title,
        description: description || null,
        stage_name: stage_name || null,
        age: age ? parseInt(age) : null,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        hair_color: hair_color || null,
        hair_length: hair_length || null,
        eye_color: eye_color || null,
        ethnicity: ethnicity || null,
        cup_size: cup_size || null,
        language: language || null,
        nationality: nationality || null,
        smoker: smoker !== undefined ? smoker : null,
        price_30min: price_30min ? parseFloat(price_30min) : null,
        price_1hour: price_1hour ? parseFloat(price_1hour) : null,
        price_2hour: price_2hour ? parseFloat(price_2hour) : null,
        price_night: price_night ? parseFloat(price_night) : null,
        price_videochat: price_videochat ? parseFloat(price_videochat) : null,
        is_available_now: is_available_now || false,
        available_overnight: available_overnight || false,
        working_hours_start: working_hours_start || null,
        working_hours_end: working_hours_end || null,
        available_for: available_for ? JSON.stringify(available_for) : null,
        services: services ? JSON.stringify(services) : null,
        phone_visible: phone_visible !== undefined ? phone_visible : true,
        status: 'pending' // Richiede approvazione admin
      },
      include: {
        category: true,
        city: true
      }
    });

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Errore creazione annuncio:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/announcements/:id - Aggiorna annuncio
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verifica che l'annuncio appartenga all'utente
    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { user_id: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    }

    if (existing.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accesso negato' });
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.status; // Solo admin può cambiare status

    // Converti array in JSON se necessario
    if (updateData.available_for && Array.isArray(updateData.available_for)) {
      updateData.available_for = JSON.stringify(updateData.available_for);
    }
    if (updateData.services && Array.isArray(updateData.services)) {
      updateData.services = JSON.stringify(updateData.services);
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        city: true,
        media: true
      }
    });

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Errore aggiornamento annuncio:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// DELETE /api/announcements/:id - Elimina annuncio
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { user_id: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    }

    if (existing.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accesso negato' });
    }

    await prisma.announcement.delete({ where: { id } });

    res.json({ success: true, message: 'Annuncio eliminato' });
  } catch (error) {
    console.error('Errore eliminazione annuncio:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;

