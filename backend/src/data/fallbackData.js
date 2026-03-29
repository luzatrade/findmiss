const FALLBACK_CITIES = [
  {
    id: 'city-milano',
    name: 'Milano',
    slug: 'milano',
    region: 'Lombardia',
    country: 'IT',
    latitude: 45.4642,
    longitude: 9.19,
    population: 1396059,
    is_active: true,
    announcements_count: 2
  },
  {
    id: 'city-roma',
    name: 'Roma',
    slug: 'roma',
    region: 'Lazio',
    country: 'IT',
    latitude: 41.9028,
    longitude: 12.4964,
    population: 2873000,
    is_active: true,
    announcements_count: 1
  },
  {
    id: 'city-torino',
    name: 'Torino',
    slug: 'torino',
    region: 'Piemonte',
    country: 'IT',
    latitude: 45.0703,
    longitude: 7.6869,
    population: 848748,
    is_active: true,
    announcements_count: 1
  }
];

const FALLBACK_CATEGORIES = [
  { id: 'cat-miss', name: 'Miss', slug: 'miss', icon: 'sparkles', display_order: 1, is_active: true },
  { id: 'cat-mr', name: 'Mr.', slug: 'mr', icon: 'users', display_order: 2, is_active: true },
  { id: 'cat-tmiss', name: 'T-Miss', slug: 'tmiss', icon: 'sparkles', display_order: 3, is_active: true },
  { id: 'cat-virtual', name: 'Servizi Virtuali', slug: 'virtual', icon: 'video', display_order: 4, is_active: true }
];

const FALLBACK_USERS = [
  {
    id: 'user-demo-1',
    nickname: 'Sofia',
    phone: '+393401112233',
    phone_visible: true,
    created_at: '2026-01-10T10:00:00.000Z',
    last_login: '2026-03-29T18:30:00.000Z',
    avatar_url: 'https://picsum.photos/120/120?random=201',
    is_verified: true
  },
  {
    id: 'user-demo-2',
    nickname: 'Valentina',
    phone: '+393402223344',
    phone_visible: true,
    created_at: '2026-01-12T10:00:00.000Z',
    last_login: '2026-03-29T18:00:00.000Z',
    avatar_url: 'https://picsum.photos/120/120?random=202',
    is_verified: true
  },
  {
    id: 'user-demo-3',
    nickname: 'Alex',
    phone: '+393403334455',
    phone_visible: true,
    created_at: '2026-01-14T10:00:00.000Z',
    last_login: '2026-03-29T17:30:00.000Z',
    avatar_url: 'https://picsum.photos/120/120?random=203',
    is_verified: false
  }
];

const FALLBACK_ANNOUNCEMENTS = [
  {
    id: 'demo-1',
    user_id: 'user-demo-1',
    city_id: 'city-milano',
    category_id: 'cat-miss',
    title: 'Sofia Milano Centro',
    stage_name: 'Sofia Milano Centro',
    description: 'Disponibile in centro con appuntamenti su prenotazione.',
    age: 25,
    price_30min: 100,
    price_1hour: 150,
    price_2hour: 260,
    price_night: 700,
    is_verified: true,
    is_vip: true,
    is_available_now: true,
    premium_level: 'vip',
    status: 'active',
    views_count: 2400,
    likes_count: 120,
    contacts_count: 32,
    reel_views: 1800,
    reel_likes: 95,
    created_at: '2026-03-24T10:00:00.000Z',
    updated_at: '2026-03-29T17:00:00.000Z',
    city: FALLBACK_CITIES[0],
    category: FALLBACK_CATEGORIES[0],
    user: FALLBACK_USERS[0],
    media: [
      {
        id: 'media-demo-1',
        announcement_id: 'demo-1',
        url: 'https://picsum.photos/600/800?random=101',
        thumbnail_url: 'https://picsum.photos/300/400?random=101',
        is_primary: true,
        is_reel: true,
        position: 0
      }
    ],
    reviews: [
      {
        id: 'review-demo-1',
        rating: 5,
        comment: 'Esperienza ottima, profilo verificato.',
        created_at: '2026-03-27T12:00:00.000Z',
        reviewer: { id: 'reviewer-1', nickname: 'UtenteVerificato' },
        is_visible: true
      }
    ]
  },
  {
    id: 'demo-2',
    user_id: 'user-demo-2',
    city_id: 'city-roma',
    category_id: 'cat-miss',
    title: 'Valentina Roma EUR',
    stage_name: 'Valentina Roma EUR',
    description: 'Accogliente, disponibile anche in fascia serale.',
    age: 27,
    price_30min: 90,
    price_1hour: 130,
    price_2hour: 230,
    price_night: 620,
    is_verified: true,
    is_vip: false,
    is_available_now: false,
    premium_level: 'premium',
    status: 'active',
    views_count: 1900,
    likes_count: 98,
    contacts_count: 24,
    reel_views: 1450,
    reel_likes: 80,
    created_at: '2026-03-23T09:30:00.000Z',
    updated_at: '2026-03-29T16:30:00.000Z',
    city: FALLBACK_CITIES[1],
    category: FALLBACK_CATEGORIES[0],
    user: FALLBACK_USERS[1],
    media: [
      {
        id: 'media-demo-2',
        announcement_id: 'demo-2',
        url: 'https://picsum.photos/600/800?random=102',
        thumbnail_url: 'https://picsum.photos/300/400?random=102',
        is_primary: true,
        is_reel: true,
        position: 0
      }
    ],
    reviews: []
  },
  {
    id: 'demo-3',
    user_id: 'user-demo-3',
    city_id: 'city-torino',
    category_id: 'cat-mr',
    title: 'Alex Torino',
    stage_name: 'Alex Torino',
    description: 'Profilo verificabile con disponibilita immediata.',
    age: 29,
    price_30min: 80,
    price_1hour: 110,
    price_2hour: 200,
    price_night: 540,
    is_verified: false,
    is_vip: false,
    is_available_now: true,
    premium_level: 'basic',
    status: 'active',
    views_count: 1200,
    likes_count: 75,
    contacts_count: 14,
    reel_views: 900,
    reel_likes: 51,
    created_at: '2026-03-22T11:15:00.000Z',
    updated_at: '2026-03-29T16:00:00.000Z',
    city: FALLBACK_CITIES[2],
    category: FALLBACK_CATEGORIES[1],
    user: FALLBACK_USERS[2],
    media: [
      {
        id: 'media-demo-3',
        announcement_id: 'demo-3',
        url: 'https://picsum.photos/600/800?random=103',
        thumbnail_url: 'https://picsum.photos/300/400?random=103',
        is_primary: true,
        is_reel: true,
        position: 0
      }
    ],
    reviews: []
  }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSlug(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'object') return value.slug ? String(value.slug).toLowerCase() : null;
  return null;
}

function getFallbackAnnouncements(options = {}) {
  const citySlug = normalizeSlug(options.city);
  const categorySlug = normalizeSlug(options.category);

  let items = FALLBACK_ANNOUNCEMENTS.filter((item) => item.status === 'active');
  if (citySlug) {
    items = items.filter((item) => item.city?.slug === citySlug);
  }
  if (categorySlug) {
    items = items.filter((item) => item.category?.slug === categorySlug);
  }
  return clone(items);
}

function getFallbackAnnouncementById(id) {
  const match = FALLBACK_ANNOUNCEMENTS.find((item) => item.id === String(id));
  return match ? clone(match) : null;
}

function getFallbackCities(options = {}) {
  const search = options.search ? String(options.search).trim().toLowerCase() : '';
  const limit = Number.parseInt(options.limit, 10);
  const take = Number.isFinite(limit) && limit > 0 ? limit : 20;

  let items = FALLBACK_CITIES.filter((city) => city.is_active);
  if (search) {
    items = items.filter((city) => city.name.toLowerCase().includes(search));
  }
  return clone(items.slice(0, take));
}

function getFallbackCityBySlug(slug) {
  const normalized = normalizeSlug(slug);
  const city = FALLBACK_CITIES.find((item) => item.slug === normalized);
  if (!city) return null;
  const announcementsCount = FALLBACK_ANNOUNCEMENTS.filter(
    (announcement) => announcement.city?.slug === city.slug && announcement.status === 'active'
  ).length;
  return { ...clone(city), announcements_count: announcementsCount };
}

function getFallbackCategories() {
  return clone(FALLBACK_CATEGORIES);
}

function getFallbackReels(options = {}) {
  const page = Number.parseInt(options.page, 10);
  const limit = Number.parseInt(options.limit, 10);
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const take = Number.isFinite(limit) && limit > 0 ? limit : 20;
  const skip = (currentPage - 1) * take;

  const source = getFallbackAnnouncements({ city: options.city, category: options.category });
  const ranked = source
    .map((item) => ({
      id: item.id,
      stage_name: item.stage_name,
      title: item.title,
      age: item.age,
      city: item.city,
      category: item.category,
      is_verified: item.is_verified,
      premium_level: item.premium_level,
      views_count: item.views_count,
      likes_count: item.likes_count,
      reel_views: item.reel_views,
      reel_likes: item.reel_likes,
      video: item.media?.[0] || null,
      user: { id: item.user?.id, nickname: item.user?.nickname },
      score: item.reel_views + item.reel_likes * 10
    }))
    .sort((a, b) => b.score - a.score);

  return {
    data: ranked.slice(skip, skip + take),
    total: ranked.length,
    page: currentPage,
    limit: take
  };
}

function getFallbackStories() {
  return [
    {
      user: {
        id: FALLBACK_USERS[0].id,
        nickname: FALLBACK_USERS[0].nickname,
        avatar_url: FALLBACK_USERS[0].avatar_url,
        is_verified: FALLBACK_USERS[0].is_verified
      },
      stories: [
        {
          id: 'story-demo-1',
          user_id: FALLBACK_USERS[0].id,
          announcement_id: 'demo-1',
          type: 'image',
          media_url: 'https://picsum.photos/400/700?random=s1',
          thumbnail_url: 'https://picsum.photos/200/350?random=s1',
          duration: 5,
          is_active: true,
          created_at: '2026-03-29T17:10:00.000Z',
          expires_at: '2026-03-30T17:10:00.000Z',
          views_count: 12,
          announcement: {
            id: 'demo-1',
            stage_name: 'Sofia Milano Centro',
            city: { name: 'Milano' }
          }
        }
      ]
    }
  ];
}

module.exports = {
  getFallbackAnnouncements,
  getFallbackAnnouncementById,
  getFallbackCities,
  getFallbackCityBySlug,
  getFallbackCategories,
  getFallbackReels,
  getFallbackStories
};
