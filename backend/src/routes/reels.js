const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reels - Feed reel con algoritmo ranking avanzato
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, city, category } = req.query;
    const userId = req.user?.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      status: 'active',
      has_video: true,
      media: { some: { is_reel: true } }
    };

    // Filtri città e categoria
    if (city) {
      if (typeof city === 'string') {
        where.city = { slug: city };
      } else if (city.id) {
        where.city_id = city.id;
      }
    }
    if (category) {
      if (typeof category === 'string') {
        where.category = { slug: category };
      } else if (category.id) {
        where.category_id = category.id;
      }
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        city: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        media: { where: { is_reel: true }, take: 1 },
        user: { select: { id: true, nickname: true } },
        reel_stats: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    // Algoritmo ranking completo
    const reelsWithScore = announcements.map(ann => {
      // Premium boost
      let premiumBoost = 1.0;
      if (ann.premium_level === 'vip') premiumBoost = 1.5;
      else if (ann.premium_level === 'premium') premiumBoost = 1.2;

      // Engagement score
      const viewsWeight = 0.1;
      const likesWeight = 2.0;
      const contactsWeight = 5.0;
      const reelViewsWeight = 0.15;
      const reelLikesWeight = 2.5;
      
      const engagementScore = 
        (ann.views_count * viewsWeight) +
        (ann.likes_count * likesWeight) +
        (ann.contacts_count * contactsWeight) +
        (ann.reel_views * reelViewsWeight) +
        (ann.reel_likes * reelLikesWeight);

      // City match score (se città selezionata)
      let cityMatchScore = 1.0;
      if (city && ann.city_id) {
        if (typeof city === 'string' && ann.city.slug === city) {
          cityMatchScore = 1.3;
        } else if (city.id === ann.city_id) {
          cityMatchScore = 1.3;
        }
      }

      // Category match score
      let categoryMatchScore = 1.0;
      if (category && ann.category_id) {
        if (typeof category === 'string' && ann.category.slug === category) {
          categoryMatchScore = 1.2;
        } else if (category.id === ann.category_id) {
          categoryMatchScore = 1.2;
        }
      }

      // Recency score (più recente = score più alto)
      const recencyDays = (Date.now() - new Date(ann.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - (recencyDays * 1.5));

      // Verified boost
      const verifiedBoost = ann.is_verified ? 1.1 : 1.0;

      // Calcolo score finale
      const relevanceScore = engagementScore * premiumBoost * cityMatchScore * categoryMatchScore * verifiedBoost;
      const totalScore = relevanceScore + recencyScore;

      return {
        id: ann.id,
        stage_name: ann.stage_name,
        title: ann.title,
        age: ann.age,
        city: ann.city,
        category: ann.category,
        is_verified: ann.is_verified,
        premium_level: ann.premium_level,
        views_count: ann.views_count,
        likes_count: ann.likes_count,
        reel_views: ann.reel_views,
        reel_likes: ann.reel_likes,
        video: ann.media[0] || null,
        user: ann.user,
        score: totalScore,
        // Dettagli score per debug
        _score_details: {
          relevance_score: relevanceScore,
          premium_boost: premiumBoost,
          engagement_score: engagementScore,
          city_match_score: cityMatchScore,
          category_match_score: categoryMatchScore,
          recency_score: recencyScore,
          verified_boost: verifiedBoost
        }
      };
    });

    // Ordina per score
    reelsWithScore.sort((a, b) => b.score - a.score);

    // Paginazione
    const paginated = reelsWithScore.slice(skip, skip + take);
    const total = reelsWithScore.length;

    res.json({
      success: true,
      data: paginated,
      pagination: { page: parseInt(page), limit: take, total, pages: Math.ceil(total / take) }
    });

  } catch (error) {
    console.error('Errore fetch reels:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/reels/:id/like - Like reel
router.post('/:id/like', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Incrementa like annuncio
    await prisma.announcement.update({
      where: { id },
      data: { 
        likes_count: { increment: 1 },
        reel_likes: { increment: 1 }
      }
    });

    // Salva stat reel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.reelStat.upsert({
      where: {
        announcement_id_date: {
          announcement_id: id,
          date: today
        }
      },
      update: {
        like_count: { increment: 1 }
      },
      create: {
        announcement_id: id,
        date: today,
        like_count: 1,
        view_count: 0
      }
    });

    res.json({ success: true, message: 'Like aggiunto' });
  } catch (error) {
    console.error('Errore like reel:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

// POST /api/reels/:id/view - Registra visualizzazione reel
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { watch_time } = req.body; // secondi

    // Incrementa views
    await prisma.announcement.update({
      where: { id },
      data: { 
        views_count: { increment: 1 },
        reel_views: { increment: 1 }
      }
    });

    // Salva stat reel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stat = await prisma.reelStat.upsert({
      where: {
        announcement_id_date: {
          announcement_id: id,
          date: today
        }
      },
      update: {
        view_count: { increment: 1 },
        avg_watch_time: watch_time ? {
          set: watch_time
        } : undefined
      },
      create: {
        announcement_id: id,
        date: today,
        view_count: 1,
        like_count: 0,
        avg_watch_time: watch_time || 0
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Errore view reel:', error);
    res.status(500).json({ success: false, error: 'Errore server' });
  }
});

module.exports = router;