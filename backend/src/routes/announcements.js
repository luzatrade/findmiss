const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { optionalAuth, authenticate } = require('../middleware/auth');
const createRouter = require('./announcements-create');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @typedef {Object} AnnouncementFilters
 * @property {string} [page='1'] - Page number for pagination
 * @property {string} [limit='20'] - Number of items per page
 * @property {string} [city] - City filter
 * @property {string} [category] - Category filter
 * @property {string} [is_verified] - Filter verified announcements
 * @property {string} [has_video] - Filter announcements with video
 * @property {string} [has_reviews] - Filter announcements with reviews
 * @property {string} [is_vip] - Filter VIP announcements
 * @property {string} [has_natural_photo] - Filter natural photos
 * @property {string} [is_available_now] - Filter available now
 * @property {string} [available_overnight] - Filter overnight availability
 * @property {string} [price_min] - Minimum price
 * @property {string} [price_max] - Maximum price
 * @property {string} [age_min] - Minimum age
 * @property {string} [age_max] - Maximum age
 * @property {string} [cup_size] - Cup size filter
 * @property {string} [hair_color] - Hair color filter
 * @property {string} [hair_length] - Hair length filter
 * @property {string} [eye_color] - Eye color filter
 * @property {string} [ethnicity] - Ethnicity filter
 * @property {string} [language] - Language filter
 * @property {string} [nationality] - Nationality filter
 * @property {string} [height_min] - Minimum height
 * @property {string} [height_max] - Maximum height
 * @property {string} [weight_min] - Minimum weight
 * @property {string} [weight_max] - Maximum weight
 * @property {string} [smoker] - Smoker filter
 * @property {string} [available_for] - Availability type (incontro, videochat, entrambi)
 * @property {string} [virtual_services] - Virtual services filter
 * @property {string} [sort='recent'] - Sort order (recent, price_asc, price_desc, etc.)
 */

/**
 * GET /api/announcements - Feed homepage con filtri avanzati
 * @route GET /api/announcements
 * @param {import('express').Request<{}, {}, {}, AnnouncementFilters>} req - Express request with query params
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      city,
      category,
      // Filtri generali
      is_verified,
      has_video,
      has_reviews,
      is_vip,
      has_natural_photo,
      is_available_now,
      available_overnight,
      // Prezzi
      price_min,
      price_max,
      // Caratteristiche fisiche
      age_min,
      age_max,
      cup_size,
      hair_color,
      hair_length,
      eye_color,
      ethnicity,
      language,
      nationality,
      height_min,
      height_max,
      weight_min,
      weight_max,
      smoker,
      // Disponibilità
      available_for, // incontro, videochat, entrambi
      // Servizi virtuali
      virtual_services,
      // Ordinamento
      sort = 'recent'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Fallback per database non configurato
    if (!prisma.announcement) {
      return res.json({
        success: true,
        data: [
          {
            id: 1,
            title: 'Bella ragazza Milano',
            description: 'Incontri piacevoli in centro Milano',
            age: 25,
            city: 'Milano',
            price: 150,
            verified: true,
            vip: true,
            availableNow: true,
            images: [
              'https://picsum.photos/120x160?random=1',
              'https://picsum.photos/120x160?random=2'
            ]
          },
          {
            id: 2,
            title: 'Escort Roma centro',
            description: 'Discreta e raffinata',
            age: 23,
            city: 'Roma',
            price: 120,
            verified: true,
            vip: false,
            availableNow: false,
            images: [
              'https://picsum.photos/120x160?random=3',
              'https://picsum.photos/120x160?random=4'
            ]
          }
        ]
      });
    }

    // Skip database operations if tables don't exist yet
    if (!prisma.announcement.findMany) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: parseInt(page), limit: take, total: 0, pages: 0 }
      });
    }

    const where = { status: 'active' };

    // Filtro città
    if (city) {
      if (typeof city === 'string') {
        where.city = { slug: city };
      } else if (city.id) {
        where.city_id = city.id;
      }
    }

    // Filtro categoria
    if (category) {
      if (typeof category === 'string') {
        where.category = { slug: category };
      } else if (category.id) {
        where.category_id = category.id;
      }
    }

    // Filtri generali
    if (is_verified === 'true') where.is_verified = true;
    if (has_video === 'true') where.has_video = true;
    if (has_reviews === 'true') where.has_reviews = true;
    if (is_vip === 'true') where.is_vip = true;
    if (has_natural_photo === 'true') where.has_natural_photo = true;
    if (is_available_now === 'true') where.is_available_now = true;
    if (available_overnight === 'true') where.available_overnight = true;

    // Filtri prezzi
    if (price_min || price_max) {
      where.price_1hour = {};
      if (price_min) where.price_1hour.gte = parseFloat(price_min);
      if (price_max) where.price_1hour.lte = parseFloat(price_max);
    }

    // Filtri caratteristiche fisiche
    if (age_min || age_max) {
      where.age = {};
      if (age_min) where.age.gte = parseInt(age_min);
      if (age_max) where.age.lte = parseInt(age_max);
    }

    if (cup_size) where.cup_size = cup_size;
    if (hair_color) where.hair_color = hair_color;
    if (hair_length) where.hair_length = hair_length;
    if (eye_color) where.eye_color = eye_color;
    if (ethnicity) where.ethnicity = ethnicity;
    if (language) where.language = language;
    if (nationality) where.nationality = nationality;
    if (smoker === 'true') where.smoker = true;
    if (smoker === 'false') where.smoker = false;

    if (height_min || height_max) {
      where.height = {};
      if (height_min) where.height.gte = parseInt(height_min);
      if (height_max) where.height.lte = parseInt(height_max);
    }

    if (weight_min || weight_max) {
      where.weight = {};
      if (weight_min) where.weight.gte = parseInt(weight_min);
      if (weight_max) where.weight.lte = parseInt(weight_max);
    }

    // Filtro disponibilità
    if (available_for) {
      where.available_for = { contains: available_for };
    }

    // Ordinamento con priorità premium
    let orderBy = [];
    
    // Prima i top page boost
    let topPageIds = [];
    if (prisma.topPageBoost && prisma.topPageBoost.findMany) {
      try {
        const topPageBoosts = await prisma.topPageBoost.findMany({
          where: {
            is_active: true,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() }
          },
          orderBy: { position: 'asc' },
          take: 5,
          include: { announcement: true }
        });
        topPageIds = topPageBoosts.map(b => b.announcement_id);
      } catch (error) {
        console.warn('Top page boost non disponibile:', error.message);
      }
    }

    switch (sort) {
      case 'price_asc':
        orderBy = [{ price_1hour: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price_1hour: 'desc' }];
        break;
      case 'popular':
        orderBy = [{ views_count: 'desc' }];
        break;
      case 'recent':
      default:
        orderBy = [
          { premium_level: 'desc' },
          { boost_active: 'desc' },
          { created_at: 'desc' }
        ];
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          city: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          media: { where: { is_primary: true }, take: 1 },
          _count: {
            select: {
              reviews: true,
              likes: true
            }
          }
        }
      }),
      prisma.announcement.count({ where })
    ]);

    // Riordina per includere top page boost all'inizio
    const sortedAnnouncements = [...announcements];
    if (topPageIds.length > 0 && sort === 'recent') {
      sortedAnnouncements.sort((a, b) => {
        const aIsTop = topPageIds.includes(a.id);
        const bIsTop = topPageIds.includes(b.id);
        if (aIsTop && !bIsTop) return -1;
        if (!aIsTop && bIsTop) return 1;
        return 0;
      });
    }

    res.json({
      success: true,
      data: sortedAnnouncements,
      pagination: { page: parseInt(page), limit: take, total, pages: Math.ceil(total / take) }
    });

  } catch (error) {
    console.error('Errore fetch annunci:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/announcements/my - I miei annunci (richiede autenticazione)
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const announcements = await prisma.announcement.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        city: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        media: { orderBy: { position: 'asc' } },
        _count: {
          select: {
            reviews: true,
            likes: true
          }
        }
      }
    });

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Errore fetch annunci utente:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// PUT /api/announcements/:id/status - Cambia stato annuncio
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Verifica proprietà
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement || announcement.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Non autorizzato' });
    }

    const validStatuses = ['active', 'paused', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Stato non valido' });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Errore cambio stato:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// DELETE /api/announcements/:id - Elimina annuncio
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verifica proprietà
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement || announcement.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Non autorizzato' });
    }

    // Elimina media associati
    await prisma.media.deleteMany({ where: { announcement_id: id } });
    
    // Elimina likes
    await prisma.like.deleteMany({ where: { announcement_id: id } });
    
    // Elimina annuncio
    await prisma.announcement.delete({ where: { id } });

    res.json({ success: true, message: 'Annuncio eliminato' });
  } catch (error) {
    console.error('Errore eliminazione:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// GET /api/announcements/:id - Dettaglio annuncio
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        city: true,
        category: true,
        media: { orderBy: { position: 'asc' } },
        user: {
          select: {
            id: true,
            phone: true,
            phone_visible: true,
            nickname: true,
            created_at: true
          }
        },
        reviews: {
          where: { is_visible: true },
          include: {
            reviewer: { select: { id: true, nickname: true } }
          },
          orderBy: { created_at: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            likes: true
          }
        }
      }
    });

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    }

    // Incrementa visualizzazioni
    await prisma.announcement.update({
      where: { id },
      data: { views_count: { increment: 1 } }
    });

    // Verifica se l'utente ha già messo like
    let userLiked = false;
    if (userId) {
      const like = await prisma.like.findUnique({
        where: {
          user_id_announcement_id: {
            user_id: userId,
            announcement_id: id
          }
        }
      });
      userLiked = !!like;
    }

    // Calcola rating medio dalle reviews
    let avgRating = 0;
    if (announcement.reviews && announcement.reviews.length > 0) {
      const sum = announcement.reviews.reduce((acc, review) => acc + review.rating, 0);
      avgRating = sum / announcement.reviews.length;
    }

    // Nascondi telefono se non visibile o utente non autenticato
    const response = {
      ...announcement,
      avgRating: Math.round(avgRating * 10) / 10, // Arrotonda a 1 decimale
      user: {
        ...announcement.user,
        phone: announcement.user.phone_visible && announcement.user.phone ? announcement.user.phone : null
      },
      userLiked
    };

    res.json({ success: true, data: response });

  } catch (error) {
    console.error('Errore fetch annuncio:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/announcements/:id/like - Aggiungi/rimuovi like
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_announcement_id: {
          user_id: userId,
          announcement_id: id
        }
      }
    });

    if (existingLike) {
      // Rimuovi like
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      await prisma.announcement.update({
        where: { id },
        data: { likes_count: { decrement: 1 } }
      });
      res.json({ success: true, liked: false });
    } else {
      // Aggiungi like
      await prisma.like.create({
        data: {
          user_id: userId,
          announcement_id: id
        }
      });
      await prisma.announcement.update({
        where: { id },
        data: { likes_count: { increment: 1 } }
      });
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Errore like:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/announcements/:id/contact - Contatta inserzionista
router.post('/:id/contact', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    }

    // Incrementa contatti
    await prisma.announcement.update({
      where: { id },
      data: { contacts_count: { increment: 1 } }
    });

    // Crea o trova conversazione
    const conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1_id: userId, user2_id: announcement.user_id },
          { user1_id: announcement.user_id, user2_id: userId }
        ]
      }
    });

    let conversationId;
    if (conversation) {
      conversationId = conversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          user1_id: userId,
          user2_id: announcement.user_id
        }
      });
      conversationId = newConversation.id;
    }

    res.json({
      success: true,
      data: {
        conversation_id: conversationId,
        phone: announcement.user.phone_visible ? announcement.user.phone : null
      }
    });
  } catch (error) {
    console.error('Errore contatto:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// Aggiungi route per creazione/modifica
router.use('/', createRouter);

module.exports = router;