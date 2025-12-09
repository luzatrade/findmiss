const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniziando seed completo...');

  // Pulisci database - solo tabelle esistenti
  console.log('🧹 Pulizia database...');
  
  // Prova a eliminare in ordine (ignora errori per tabelle non esistenti)
  const deleteOperations = [
    () => prisma.$executeRawUnsafe('DELETE FROM "live_messages"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "live_tips"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "live_viewers"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "live_recordings"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "live_streams"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "story_views"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "stories"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "follows"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "protected_media"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "messages"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "conversations"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "reel_stats"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "top_page_boosts"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "daily_spots"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "reviews"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "likes"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "invoices"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "payments"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "media"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "announcements"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "user_sessions"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "user_blocks"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "refresh_tokens"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "users"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "categories"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "cities"').catch(() => {}),
    () => prisma.$executeRawUnsafe('DELETE FROM "premium_plans"').catch(() => {}),
  ];

  for (const op of deleteOperations) {
    await op();
  }

  console.log('✅ Database pulito');

  // ============================================
  // CATEGORIE
  // ============================================
  console.log('📂 Creazione categorie...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Donna', slug: 'donna', icon: '👩', display_order: 1 }
    }),
    prisma.category.create({
      data: { name: 'Trans', slug: 'trans', icon: '🏳️‍⚧️', display_order: 2 }
    }),
    prisma.category.create({
      data: { name: 'Uomo', slug: 'uomo', icon: '👨', display_order: 3 }
    }),
    prisma.category.create({
      data: { name: 'Coppia', slug: 'coppia', icon: '💑', display_order: 4 }
    }),
    prisma.category.create({
      data: { name: 'Videochat', slug: 'videochat', icon: '📹', display_order: 5 }
    })
  ]);
  console.log(`✅ ${categories.length} categorie create`);

  // ============================================
  // CITTÀ
  // ============================================
  console.log('🏙️ Creazione città...');
  const citiesData = [
    { name: 'Milano', slug: 'milano', region: 'Lombardia', population: 1396059 },
    { name: 'Roma', slug: 'roma', region: 'Lazio', population: 2872800 },
    { name: 'Napoli', slug: 'napoli', region: 'Campania', population: 959470 },
    { name: 'Torino', slug: 'torino', region: 'Piemonte', population: 870952 },
    { name: 'Palermo', slug: 'palermo', region: 'Sicilia', population: 657561 },
    { name: 'Genova', slug: 'genova', region: 'Liguria', population: 580097 },
    { name: 'Bologna', slug: 'bologna', region: 'Emilia-Romagna', population: 392203 },
    { name: 'Firenze', slug: 'firenze', region: 'Toscana', population: 378839 },
    { name: 'Bari', slug: 'bari', region: 'Puglia', population: 323370 },
    { name: 'Catania', slug: 'catania', region: 'Sicilia', population: 311584 },
    { name: 'Venezia', slug: 'venezia', region: 'Veneto', population: 261905 },
    { name: 'Verona', slug: 'verona', region: 'Veneto', population: 258765 }
  ];

  const cities = await Promise.all(
    citiesData.map(city => prisma.city.create({ data: city }))
  );
  console.log(`✅ ${cities.length} città create`);

  // ============================================
  // PIANI PREMIUM
  // ============================================
  console.log('💎 Creazione piani premium...');
  await Promise.all([
    prisma.premiumPlan.create({
      data: {
        name: 'Settimanale',
        plan_type: 'weekly',
        duration: 7,
        price: 19.99,
        daily_exits: 2,
        features: JSON.stringify(['2 uscite/giorno', 'Badge Premium', 'Statistiche'])
      }
    }),
    prisma.premiumPlan.create({
      data: {
        name: 'Mensile',
        plan_type: 'monthly',
        duration: 30,
        price: 59.99,
        daily_exits: 4,
        features: JSON.stringify(['4 uscite/giorno', 'Badge VIP', 'Statistiche avanzate'])
      }
    })
  ]);
  console.log('✅ Piani premium creati');

  // ============================================
  // UTENTI
  // ============================================
  console.log('👥 Creazione utenti...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@findmiss.com',
      password_hash: passwordHash,
      nickname: 'Admin',
      role: 'admin',
      is_verified: true
    }
  });

  const advertisers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sofia@example.com',
        password_hash: passwordHash,
        nickname: 'Sofia',
        role: 'advertiser',
        is_verified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'giulia@example.com',
        password_hash: passwordHash,
        nickname: 'Giulia',
        role: 'advertiser',
        is_verified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'valentina@example.com',
        password_hash: passwordHash,
        nickname: 'Valentina',
        role: 'advertiser',
        is_verified: true
      }
    })
  ]);

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password_hash: passwordHash,
      nickname: 'TestUser',
      role: 'user'
    }
  });

  console.log(`✅ ${advertisers.length + 2} utenti creati`);

  // ============================================
  // ANNUNCI
  // ============================================
  console.log('📢 Creazione annunci...');
  const announcementsData = [
    {
      user_id: advertisers[0].id,
      category_id: categories[0].id,
      city_id: cities[0].id,
      title: 'Sofia - Milano Centro',
      stage_name: 'Sofia',
      description: 'Ciao, sono Sofia! Donna elegante e raffinata.',
      age: 28,
      height: 170,
      weight: 55,
      hair_color: 'Castano',
      eye_color: 'Verde',
      price_1hour: 200,
      is_verified: true,
      is_vip: true,
      has_video: true,
      status: 'active',
      premium_level: 'vip',
      views_count: 1520,
      likes_count: 234,
      reel_views: 8500,
      reel_likes: 450
    },
    {
      user_id: advertisers[1].id,
      category_id: categories[0].id,
      city_id: cities[1].id,
      title: 'Giulia - Roma EUR',
      stage_name: 'Giulia',
      description: 'Ragazza dolce e sensuale.',
      age: 25,
      height: 165,
      weight: 52,
      hair_color: 'Biondo',
      eye_color: 'Azzurro',
      price_1hour: 150,
      is_verified: true,
      has_video: true,
      status: 'active',
      premium_level: 'premium',
      views_count: 890,
      likes_count: 156,
      reel_views: 5200,
      reel_likes: 280
    },
    {
      user_id: advertisers[2].id,
      category_id: categories[0].id,
      city_id: cities[0].id,
      title: 'Valentina - Milano Navigli',
      stage_name: 'Valentina',
      description: 'Top escort, esperienza unica garantita.',
      age: 30,
      height: 175,
      weight: 58,
      hair_color: 'Nero',
      eye_color: 'Marrone',
      price_1hour: 300,
      is_verified: true,
      is_vip: true,
      has_video: true,
      status: 'active',
      premium_level: 'vip',
      views_count: 2340,
      likes_count: 567,
      reel_views: 15600,
      reel_likes: 890
    }
  ];

  const announcements = await Promise.all(
    announcementsData.map(data => prisma.announcement.create({ data }))
  );

  // Aggiungi media
  const mediaData = [
    { announcement_id: announcements[0].id, type: 'image', url: 'https://picsum.photos/seed/sofia1/600/800', is_primary: true, is_reel: false },
    { announcement_id: announcements[0].id, type: 'video', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnail_url: 'https://picsum.photos/seed/sofia2/600/800', is_reel: true },
    { announcement_id: announcements[1].id, type: 'image', url: 'https://picsum.photos/seed/giulia1/600/800', is_primary: true, is_reel: false },
    { announcement_id: announcements[1].id, type: 'video', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnail_url: 'https://picsum.photos/seed/giulia2/600/800', is_reel: true },
    { announcement_id: announcements[2].id, type: 'image', url: 'https://picsum.photos/seed/valentina1/600/800', is_primary: true, is_reel: false },
    { announcement_id: announcements[2].id, type: 'video', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnail_url: 'https://picsum.photos/seed/valentina2/600/800', is_reel: true }
  ];

  await Promise.all(
    mediaData.map(data => prisma.media.create({ data }))
  );

  console.log(`✅ ${announcements.length} annunci creati con media`);

  console.log('\n🎉 Seed completato con successo!');
  console.log('\n📋 Credenziali di test:');
  console.log('   Admin: admin@findmiss.com / password123');
  console.log('   Inserzionista: sofia@example.com / password123');
  console.log('   Utente: user@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
