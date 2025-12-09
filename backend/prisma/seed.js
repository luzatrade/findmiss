const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Inizio seeding completo...\n');

  // Pulizia database
  console.log('🧹 Pulizia database...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.like.deleteMany();
  await prisma.media.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();
  await prisma.category.deleteMany();
  await prisma.premiumPlan.deleteMany();

  // Categorie - Nuove categorie: Miss, Mr., T-Miss, Servizi Virtuali
  console.log('📂 Creazione categorie...');
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Miss', slug: 'miss', icon: '💋', display_order: 1 } }),
    prisma.category.create({ data: { name: 'Mr.', slug: 'mr', icon: '🤵', display_order: 2 } }),
    prisma.category.create({ data: { name: 'T-Miss', slug: 'tmiss', icon: '✨', display_order: 3 } }),
    prisma.category.create({ data: { name: 'Servizi Virtuali', slug: 'virtual', icon: '📱', display_order: 4 } }),
  ]);

  // Città principali italiane
  console.log('🏙️ Creazione città...');
  const cities = await Promise.all([
    prisma.city.create({ data: { name: 'Milano', slug: 'milano', region: 'Lombardia', latitude: 45.4642, longitude: 9.19, population: 1396000 } }),
    prisma.city.create({ data: { name: 'Roma', slug: 'roma', region: 'Lazio', latitude: 41.9028, longitude: 12.4964, population: 2873000 } }),
    prisma.city.create({ data: { name: 'Napoli', slug: 'napoli', region: 'Campania', latitude: 40.8518, longitude: 14.2681, population: 967000 } }),
    prisma.city.create({ data: { name: 'Torino', slug: 'torino', region: 'Piemonte', latitude: 45.0703, longitude: 7.6869, population: 875000 } }),
    prisma.city.create({ data: { name: 'Firenze', slug: 'firenze', region: 'Toscana', latitude: 43.7696, longitude: 11.2558, population: 382000 } }),
    prisma.city.create({ data: { name: 'Bologna', slug: 'bologna', region: 'Emilia-Romagna', latitude: 44.4949, longitude: 11.3426, population: 392000 } }),
    prisma.city.create({ data: { name: 'Venezia', slug: 'venezia', region: 'Veneto', latitude: 45.4408, longitude: 12.3155, population: 261000 } }),
    prisma.city.create({ data: { name: 'Verona', slug: 'verona', region: 'Veneto', latitude: 45.4384, longitude: 10.9916, population: 259000 } }),
    prisma.city.create({ data: { name: 'Genova', slug: 'genova', region: 'Liguria', latitude: 44.4056, longitude: 8.9463, population: 580000 } }),
    prisma.city.create({ data: { name: 'Palermo', slug: 'palermo', region: 'Sicilia', latitude: 38.1157, longitude: 13.3615, population: 657000 } }),
    prisma.city.create({ data: { name: 'Catania', slug: 'catania', region: 'Sicilia', latitude: 37.5079, longitude: 15.0830, population: 311000 } }),
    prisma.city.create({ data: { name: 'Bari', slug: 'bari', region: 'Puglia', latitude: 41.1171, longitude: 16.8719, population: 320000 } }),
  ]);

  // Password per tutti gli utenti
  const passwordHash = await bcrypt.hash('password123', 10);

  // Utenti
  console.log('👥 Creazione utenti...');
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@findmiss.it', password_hash: passwordHash, nickname: 'Admin', role: 'admin', is_verified: true } }),
    prisma.user.create({ data: { email: 'sofia@test.it', password_hash: passwordHash, nickname: 'Sofia', role: 'advertiser', is_verified: true, phone: '+39 333 1234567' } }),
    prisma.user.create({ data: { email: 'giulia@test.it', password_hash: passwordHash, nickname: 'Giulia', role: 'advertiser', is_verified: true, phone: '+39 333 2345678' } }),
    prisma.user.create({ data: { email: 'valentina@test.it', password_hash: passwordHash, nickname: 'Valentina', role: 'advertiser', is_verified: true, phone: '+39 333 3456789' } }),
    prisma.user.create({ data: { email: 'alessia@test.it', password_hash: passwordHash, nickname: 'Alessia', role: 'advertiser', is_verified: true, phone: '+39 333 4567890' } }),
    prisma.user.create({ data: { email: 'martina@test.it', password_hash: passwordHash, nickname: 'Martina', role: 'advertiser', is_verified: true, phone: '+39 333 5678901' } }),
    prisma.user.create({ data: { email: 'chiara@test.it', password_hash: passwordHash, nickname: 'Chiara', role: 'advertiser', is_verified: true, phone: '+39 333 6789012' } }),
    prisma.user.create({ data: { email: 'laura@test.it', password_hash: passwordHash, nickname: 'Laura', role: 'advertiser', is_verified: true, phone: '+39 333 7890123' } }),
    prisma.user.create({ data: { email: 'elena@test.it', password_hash: passwordHash, nickname: 'Elena', role: 'advertiser', is_verified: true, phone: '+39 333 8901234' } }),
    prisma.user.create({ data: { email: 'francesca@test.it', password_hash: passwordHash, nickname: 'Francesca', role: 'advertiser', is_verified: true, phone: '+39 333 9012345' } }),
    prisma.user.create({ data: { email: 'cliente@test.it', password_hash: passwordHash, nickname: 'Mario', role: 'user', is_verified: true } }),
  ]);

  // Trova le categorie
  const missCategory = categories.find(c => c.slug === 'miss');
  const mrCategory = categories.find(c => c.slug === 'mr');
  const tmissCategory = categories.find(c => c.slug === 'tmiss');
  const virtualCategory = categories.find(c => c.slug === 'virtual');

  // Dati per generare annunci variati
  const nomi = ['Sofia', 'Giulia', 'Valentina', 'Alessia', 'Martina', 'Chiara', 'Laura', 'Elena', 'Francesca', 'Giada', 'Aurora', 'Serena'];
  const nomiMr = ['Marco', 'Luca', 'Alessandro', 'Andrea'];
  const nomiTMiss = ['Jessica', 'Vanessa', 'Bianca', 'Luna'];
  const hairColors = ['nero', 'castano', 'biondo', 'rosso'];
  const eyeColors = ['marrone', 'verde', 'azzurro', 'grigio'];
  const ethnicities = ['italiana', 'est-europa', 'latina', 'orientale'];
  const cupSizes = ['A', 'B', 'C', 'D', 'E'];

  console.log('📝 Creazione annunci...');
  const announcements = [];

  // Crea 16 annunci con diverse categorie
  // 8 Miss, 3 Mr., 3 T-Miss, 2 Virtual
  const announcementConfigs = [
    // Miss (8)
    { cat: missCategory, nome: nomi[0], desc: 'elegante e raffinata' },
    { cat: missCategory, nome: nomi[1], desc: 'solare e simpatica' },
    { cat: missCategory, nome: nomi[2], desc: 'dolce e sensuale' },
    { cat: missCategory, nome: nomi[3], desc: 'passionale e coinvolgente' },
    { cat: missCategory, nome: nomi[4], desc: 'raffinata e discreta' },
    { cat: missCategory, nome: nomi[5], desc: 'seducente e misteriosa' },
    { cat: missCategory, nome: nomi[6], desc: 'esperta e professionale' },
    { cat: missCategory, nome: nomi[7], desc: 'giovane e intraprendente' },
    // Mr. (3)
    { cat: mrCategory, nome: nomiMr[0], desc: 'elegante e affascinante' },
    { cat: mrCategory, nome: nomiMr[1], desc: 'sportivo e carismatico' },
    { cat: mrCategory, nome: nomiMr[2], desc: 'gentleman raffinato' },
    // T-Miss (3)
    { cat: tmissCategory, nome: nomiTMiss[0], desc: 'elegante e femminile' },
    { cat: tmissCategory, nome: nomiTMiss[1], desc: 'sensuale e sofisticata' },
    { cat: tmissCategory, nome: nomiTMiss[2], desc: 'dolce e accogliente' },
    // Virtual (2)
    { cat: virtualCategory, nome: 'CamGirl Sofia', desc: 'show esclusivi online' },
    { cat: virtualCategory, nome: 'OnlyFans Star Luna', desc: 'contenuti premium esclusivi' },
  ];

  for (let i = 0; i < announcementConfigs.length; i++) {
    const config = announcementConfigs[i];
    const userIndex = (i % 9) + 1;
    const cityIndex = i % cities.length;
    
    const announcement = await prisma.announcement.create({
      data: {
        user_id: users[userIndex].id,
        category_id: config.cat.id,
        city_id: cities[cityIndex].id,
        title: `${config.nome} - ${cities[cityIndex].name}`,
        stage_name: config.nome,
        description: `Ciao sono ${config.nome}, ${config.desc} disponibile a ${cities[cityIndex].name}. Contattami per maggiori informazioni. Discrezione garantita.`,
        age: 22 + (i % 10),
        height: 160 + (i % 20),
        weight: 48 + (i % 15),
        hair_color: hairColors[i % hairColors.length],
        eye_color: eyeColors[i % eyeColors.length],
        ethnicity: ethnicities[i % ethnicities.length],
        cup_size: config.cat.slug === 'mr' ? null : cupSizes[i % cupSizes.length],
        price_30min: config.cat.slug === 'virtual' ? null : 70 + (i * 10),
        price_1hour: config.cat.slug === 'virtual' ? 30 : 130 + (i * 15),
        price_2hour: config.cat.slug === 'virtual' ? null : 220 + (i * 20),
        price_night: i % 3 === 0 ? 600 + (i * 50) : null,
        price_videochat: config.cat.slug === 'virtual' ? 2 + (i % 3) : null,
        is_available_now: i % 2 === 0,
        available_overnight: config.cat.slug !== 'virtual' && i % 3 === 0,
        working_hours_start: '10:00',
        working_hours_end: '23:00',
        status: 'active',
        is_verified: i % 3 !== 2,
        is_vip: i < 4,
        has_video: i % 2 === 0 || config.cat.slug === 'virtual',
        premium_level: i < 3 ? 'vip' : (i < 6 ? 'premium' : 'basic'),
        views_count: 500 + Math.floor(Math.random() * 2000),
        likes_count: 20 + Math.floor(Math.random() * 100),
        contacts_count: 10 + Math.floor(Math.random() * 50),
      }
    });
    announcements.push(announcement);
  }

  // URL video di test funzionanti
  const testVideos = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  ];

  console.log('🖼️ Creazione media e reel...');
  const mediaItems = [];
  const allNames = [...nomi, ...nomiMr, ...nomiTMiss, 'CamGirl Sofia', 'OnlyFans Star Luna'];

  for (let i = 0; i < announcements.length; i++) {
    const ann = announcements[i];
    const nome = allNames[i % allNames.length].toLowerCase().replace(/\s+/g, '');
    
    // Immagine principale
    mediaItems.push(
      await prisma.media.create({
        data: {
          announcement_id: ann.id,
          type: 'image',
          url: `https://picsum.photos/seed/${nome}${i}a/400/600`,
          is_primary: true,
          position: 1
        }
      })
    );

    // 2-3 immagini aggiuntive
    for (let j = 1; j <= 2 + (i % 2); j++) {
      mediaItems.push(
        await prisma.media.create({
          data: {
            announcement_id: ann.id,
            type: 'image',
            url: `https://picsum.photos/seed/${nome}${i}${String.fromCharCode(97 + j)}/400/600`,
            position: j + 1
          }
        })
      );
    }

    // Reel video per annunci con has_video = true
    if (ann.has_video) {
      mediaItems.push(
        await prisma.media.create({
          data: {
            announcement_id: ann.id,
            type: 'video',
            url: testVideos[i % testVideos.length],
            thumbnail_url: `https://picsum.photos/seed/${nome}${i}v/400/600`,
            is_reel: true,
            duration: 15 + (i % 30),
            position: 5
          }
        })
      );
    }
  }

  // Piani premium
  console.log('💎 Creazione piani premium...');
  const premiumPlans = await Promise.all([
    prisma.premiumPlan.create({
      data: {
        name: 'Piano Base',
        plan_type: 'weekly',
        duration: 7,
        price: 19.99,
        currency: 'EUR',
        daily_exits: 2,
        features: JSON.stringify(['visibility', 'stats']),
        is_active: true
      }
    }),
    prisma.premiumPlan.create({
      data: {
        name: 'Piano Settimanale',
        plan_type: 'weekly',
        duration: 7,
        price: 39.99,
        currency: 'EUR',
        daily_exits: 4,
        features: JSON.stringify(['boost', 'priority', 'analytics']),
        is_active: true
      }
    }),
    prisma.premiumPlan.create({
      data: {
        name: 'Piano Mensile',
        plan_type: 'monthly',
        duration: 30,
        price: 99.99,
        currency: 'EUR',
        daily_exits: 6,
        features: JSON.stringify(['boost', 'priority', 'analytics', 'top_page']),
        is_active: true
      }
    }),
    prisma.premiumPlan.create({
      data: {
        name: 'Piano VIP',
        plan_type: 'monthly',
        duration: 30,
        price: 199.99,
        currency: 'EUR',
        daily_exits: 10,
        features: JSON.stringify(['boost', 'priority', 'analytics', 'top_page', 'badge_vip', 'support_priority']),
        is_active: true
      }
    }),
  ]);

  // Crea qualche like di test
  console.log('❤️ Creazione likes di test...');
  const clienteUser = users.find(u => u.email === 'cliente@test.it');
  for (let i = 0; i < 5; i++) {
    await prisma.like.create({
      data: {
        user_id: clienteUser.id,
        announcement_id: announcements[i].id
      }
    });
  }

  // Crea una conversazione di test
  console.log('💬 Creazione conversazione di test...');
  const conversation = await prisma.conversation.create({
    data: {
      user1_id: clienteUser.id,
      user2_id: users[1].id // Sofia
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversation_id: conversation.id,
        sender_id: clienteUser.id,
        receiver_id: users[1].id,
        content: 'Ciao, sei disponibile oggi pomeriggio?',
        message_type: 'text'
      },
      {
        conversation_id: conversation.id,
        sender_id: users[1].id,
        receiver_id: clienteUser.id,
        content: 'Ciao! Sì, sono disponibile dalle 15 alle 22. Quando vorresti venire?',
        message_type: 'text'
      },
      {
        conversation_id: conversation.id,
        sender_id: clienteUser.id,
        receiver_id: users[1].id,
        content: 'Perfetto, verso le 17 sarebbe possibile?',
        message_type: 'text'
      }
    ]
  });

  // Sommario finale
  console.log('\n' + '='.repeat(50));
  console.log('✅ SEEDING COMPLETATO CON SUCCESSO!');
  console.log('='.repeat(50));
  console.log('\n📊 Dati creati:');
  console.log(`   📂 ${categories.length} categorie`);
  console.log(`   🏙️  ${cities.length} città`);
  console.log(`   👥 ${users.length} utenti`);
  console.log(`   📝 ${announcements.length} annunci`);
  console.log(`   🖼️  ${mediaItems.length} media (immagini + video reel)`);
  console.log(`   💎 ${premiumPlans.length} piani premium`);
  console.log(`   ❤️  5 likes`);
  console.log(`   💬 1 conversazione con 3 messaggi`);
  
  console.log('\n📧 Account di test:');
  console.log('   👑 Admin:        admin@findmiss.it / password123');
  console.log('   💼 Inserzionista: sofia@test.it / password123');
  console.log('   👤 Cliente:      cliente@test.it / password123');
  console.log('\n🎬 Reel disponibili: ' + announcements.filter(a => a.has_video).length);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
