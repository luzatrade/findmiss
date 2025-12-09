const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = 3001;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Middleware
app.use(cors());
app.use(express.json());

// =============================================
// AUTH
// =============================================

// Registrazione
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role = 'user', phone } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email e password sono obbligatorie' });
    }

    const normalizedRole = role === 'advertiser' ? 'advertiser' : 'user';

    if (normalizedRole === 'advertiser' && !phone) {
      return res.status(400).json({ success: false, error: 'Il telefono è obbligatorio per gli inserzionisti' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email già registrata' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        role: normalizedRole,
        phone: phone || null,
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Errore /api/auth/register:', error);
    res.status(500).json({ success: false, error: 'Errore nella registrazione' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email e password sono obbligatorie' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenziali non valide' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Credenziali non valide' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Errore /api/auth/login:', error);
    res.status(500).json({ success: false, error: 'Errore nel login' });
  }
});

// Middleware auth semplice
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token mancante' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token non valido' });
  }
}

function slugifyCity(name) {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

// Creazione nuovo annuncio (solo inserzionisti)
app.post('/api/announcements', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'advertiser') {
      return res.status(403).json({ success: false, error: 'Solo gli inserzionisti possono creare annunci' });
    }

    const { title, age, city, price, phone, description, services } = req.body || {};

    if (!title || !city || !price || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Titolo, città, prezzo e telefono sono obbligatori',
      });
    }

    // Trova o crea la città
    const citySlug = slugifyCity(city);
    let cityRecord = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!cityRecord) {
      cityRecord = await prisma.city.create({
        data: {
          name: city,
          slug: citySlug,
          country: 'IT',
        },
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        user_id: req.user.id,
        city_id: cityRecord.id,
        title,
        description: description || null,
        age: age ? Number(age) : null,
        price_1hour: Number(price),
        services: Array.isArray(services) ? JSON.stringify(services) : services || null,
        status: 'active',
        is_verified: false,
        is_vip: false,
        phone_visible: true,
        profile_public: true,
      },
      include: {
        media: {
          where: { type: 'image' },
          orderBy: { position: 'asc' },
        },
        city: true,
      },
    });

    const data = mapAnnouncementDetail(announcement);

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Errore POST /api/announcements:', error);
    res.status(500).json({ success: false, error: 'Errore nella creazione dell\'annuncio' });
  }
});

// Helpers per mappare i dati Prisma in un formato semplice per il frontend
function mapAnnouncementSummary(announcement) {
  const coverMedia = (announcement.media || []).find((m) => m.is_primary) || announcement.media?.[0];

  return {
    id: announcement.id,
    title: announcement.title,
    description: announcement.description || null,
    age: announcement.age || null,
    city: announcement.city?.name || null,
    price: announcement.price_1hour ? Number(announcement.price_1hour) : null,
    verified: announcement.is_verified,
    vip: announcement.is_vip,
    availableNow: announcement.is_available_now,
    image: coverMedia ? coverMedia.thumbnail_url || coverMedia.url : null,
  };
}

function mapAnnouncementDetail(announcement) {
  const base = mapAnnouncementSummary(announcement);

  return {
    ...base,
    images: (announcement.media || []).map((m) => m.url),
    features: {
      height: announcement.height ? `${announcement.height} cm` : null,
      weight: announcement.weight ? `${announcement.weight} kg` : null,
      hairColor: announcement.hair_color || null,
      eyeColor: announcement.eye_color || null,
      cupSize: announcement.cup_size || null,
    },
    services: announcement.services ? JSON.parse(announcement.services) : [],
    availability: announcement.working_hours_start && announcement.working_hours_end
      ? `${announcement.working_hours_start} - ${announcement.working_hours_end}`
      : null,
    languages: announcement.language ? [announcement.language] : [],
  };
}

// Endpoint per ottenere tutti gli annunci (feed)
app.get('/api/announcements', async (req, res) => {
  try {
    console.log('Richiesta ricevuta su /api/announcements');

    const { city, minPrice, maxPrice, minAge, maxAge } = req.query;

    const where = {
      status: 'active',
      profile_public: true,
    };

    if (city) {
      where.city = { name: { equals: city, mode: 'insensitive' } };
    }

    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = Number(minAge);
      if (maxAge) where.age.lte = Number(maxAge);
    }

    if (minPrice || maxPrice) {
      where.price_1hour = {};
      if (minPrice) where.price_1hour.gte = Number(minPrice);
      if (maxPrice) where.price_1hour.lte = Number(maxPrice);
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        media: {
          where: { type: 'image' },
          orderBy: { position: 'asc' },
        },
        city: true,
      },
      orderBy: { created_at: 'desc' },
      take: 60,
    });

    const data = announcements.map(mapAnnouncementSummary);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Errore /api/announcements:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero degli annunci',
    });
  }
});

// Endpoint per ottenere un singolo annuncio (dettaglio)
app.get('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Richiesta annuncio con ID: ${id}`);

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        media: {
          where: { type: 'image' },
          orderBy: { position: 'asc' },
        },
        city: true,
      },
    });

    if (!announcement) {
      console.log('Annuncio non trovato');
      return res.status(404).json({
        success: false,
        error: 'Annuncio non trovato',
      });
    }

    const data = mapAnnouncementDetail(announcement);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Errore /api/announcements/:id:', error);
    res.status(500).json({
      success: false,
      error: "Errore nel recupero dell'annuncio",
    });
  }
});

// Avvia il server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server API in esecuzione su http://localhost:${port}`);
  console.log(`Endpoint disponibile: http://localhost:${port}/api/announcements`);
});

// Gestione errori non catturati
process.on('uncaughtException', (err) => {
  console.error('Errore non gestito:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise non gestita:', reason);
});