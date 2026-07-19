const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function clearUploadsFolder() {
  for (const sub of ['images', 'videos']) {
    const dir = path.join(UPLOADS_DIR, sub);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      continue;
    }

    for (const entry of fs.readdirSync(dir)) {
      if (entry === '.gitkeep') continue;
      fs.rmSync(path.join(dir, entry), { force: true, recursive: true });
    }
  }
}

async function resetAllContent(client = prisma) {
  const admins = await client.user.findMany({
    where: { role: 'admin' },
    select: { id: true, email: true, nickname: true },
  });

  if (admins.length === 0) {
    throw new Error('Nessun admin trovato. Interrotto per sicurezza.');
  }

  const counts = {};

  await client.$transaction(async (tx) => {
    counts.protectedMedia = (await tx.protectedMedia.deleteMany()).count;
    counts.messages = (await tx.message.deleteMany()).count;
    counts.conversations = (await tx.conversation.deleteMany()).count;
    counts.storyViews = (await tx.storyView.deleteMany()).count;
    counts.stories = (await tx.story.deleteMany()).count;
    counts.liveRecordings = (await tx.liveRecording.deleteMany()).count;
    counts.liveMessages = (await tx.liveMessage.deleteMany()).count;
    counts.liveTips = (await tx.liveTip.deleteMany()).count;
    counts.liveViewers = (await tx.liveViewer.deleteMany()).count;
    counts.liveStreams = (await tx.liveStream.deleteMany()).count;
    counts.invoices = (await tx.invoice.deleteMany()).count;
    counts.payments = (await tx.payment.deleteMany()).count;
    counts.notifications = (await tx.notification.deleteMany()).count;
    counts.follows = (await tx.follow.deleteMany()).count;
    counts.userBlocks = (await tx.userBlock.deleteMany()).count;
    counts.userSessions = (await tx.userSession.deleteMany()).count;
    counts.media = (await tx.media.deleteMany()).count;
    counts.likes = (await tx.like.deleteMany()).count;
    counts.reviews = (await tx.review.deleteMany()).count;
    counts.reelStats = (await tx.reelStat.deleteMany()).count;
    counts.dailySpots = (await tx.dailySpot.deleteMany()).count;
    counts.topPageBoosts = (await tx.topPageBoost.deleteMany()).count;
    counts.announcements = (await tx.announcement.deleteMany()).count;

    counts.refreshTokens = (
      await tx.refreshToken.deleteMany({
        where: { user: { role: { not: 'admin' } } },
      })
    ).count;

    counts.users = (
      await tx.user.deleteMany({
        where: { role: { not: 'admin' } },
      })
    ).count;
  });

  clearUploadsFolder();

  return { admins, counts };
}

module.exports = { resetAllContent, clearUploadsFolder };
