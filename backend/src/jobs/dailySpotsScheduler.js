const { PrismaClient } = require('@prisma/client');
const Queue = require('bull');
const Redis = require('ioredis');

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const dailySpotsQueue = new Queue('daily-spots', { redis });

// Job: Distribuisci uscite giornaliere
dailySpotsQueue.process('distribute-spots', async (job) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Recupera annunci con uscite disponibili
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'active',
        daily_exits: { gt: 0 },
        OR: [
          { plan_end_date: null },
          { plan_end_date: { gte: today } }
        ]
      },
      include: {
        daily_spots: {
          where: {
            spot_date: {
              gte: today,
              lt: tomorrow
            }
          }
        }
      }
    });

    for (const ann of announcements) {
      const usedToday = ann.daily_spots.length;
      const remaining = ann.daily_exits - usedToday;

      if (remaining <= 0) continue;

      // Distribuisci uscite durante il giorno
      const hours = [9, 11, 14, 16, 18, 20, 22]; // Orari distribuiti
      const spotsToCreate = Math.min(remaining, hours.length);

      for (let i = 0; i < spotsToCreate; i++) {
        const spotTime = new Date(today);
        spotTime.setHours(hours[i], 0, 0, 0);

        // Verifica se già esiste spot a quest'ora
        const existing = await prisma.dailySpot.findFirst({
          where: {
            announcement_id: ann.id,
            spot_date: today,
            spot_time: spotTime
          }
        });

        if (!existing) {
          await prisma.dailySpot.create({
            data: {
              announcement_id: ann.id,
              spot_date: today,
              spot_time: spotTime,
              position: i + 1,
              is_active: true
            }
          });
        }
      }
    }

    console.log(`Distribuite uscite giornaliere per ${announcements.length} annunci`);
  } catch (error) {
    console.error('Errore distribuzione uscite:', error);
    throw error;
  }
});

// Job: Reset giornaliero
dailySpotsQueue.process('reset-daily', async (job) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Reset daily_exits_used
    await prisma.announcement.updateMany({
      where: {
        daily_exits: { gt: 0 }
      },
      data: {
        daily_exits_used: 0
      }
    });

    // Elimina DailySpot scaduti (più di 1 giorno fa)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.dailySpot.deleteMany({
      where: {
        spot_date: { lt: yesterday }
      }
    });

    // Disattiva piani scaduti
    await prisma.announcement.updateMany({
      where: {
        plan_end_date: { lt: today },
        premium_level: { not: 'basic' }
      },
      data: {
        premium_level: 'basic',
        plan_type: null,
        daily_exits: 0,
        boost_active: false
      }
    });

    // Disattiva Top Page Boost scaduti
    await prisma.topPageBoost.updateMany({
      where: {
        end_date: { lt: today },
        is_active: true
      },
      data: {
        is_active: false
      }
    });

    console.log('Reset giornaliero completato');
  } catch (error) {
    console.error('Errore reset giornaliero:', error);
    throw error;
  }
});

// Scheduler: Esegui ogni ora
setInterval(() => {
  dailySpotsQueue.add('distribute-spots', {}, { repeat: { cron: '0 * * * *' } });
}, 1000 * 60 * 60);

// Scheduler: Reset a mezzanotte
setInterval(() => {
  dailySpotsQueue.add('reset-daily', {}, { repeat: { cron: '0 0 * * *' } });
}, 1000 * 60 * 60 * 24);

module.exports = dailySpotsQueue;





