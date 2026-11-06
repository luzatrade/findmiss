/**
 * Campi annuncio usati dai filtri pubblici, sincronizzati dal profilo inserzionista.
 * @param {object|null|undefined} profile
 * @returns {object} patch per announcement.create / updateMany
 */
function announcementPatchFromSearchProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return {};
  }

  const p = profile;
  const patch = {};

  const str = (v) => (v === undefined || v === null || v === '' ? undefined : v);
  if (str(p.hair_color) !== undefined) patch.hair_color = p.hair_color;
  if (str(p.eye_color) !== undefined) patch.eye_color = p.eye_color;
  if (str(p.cup_size) !== undefined) patch.cup_size = p.cup_size;
  if (str(p.ethnicity) !== undefined) patch.ethnicity = p.ethnicity;
  if (str(p.nationality) !== undefined) patch.nationality = p.nationality;
  if (str(p.language) !== undefined) patch.language = p.language;

  if (p.height != null && p.height !== '') {
    const n = parseInt(p.height, 10);
    if (!Number.isNaN(n)) patch.height = n;
  }
  if (p.weight != null && p.weight !== '') {
    const n = parseInt(p.weight, 10);
    if (!Number.isNaN(n)) patch.weight = n;
  }

  if (p.smoker !== undefined) patch.smoker = Boolean(p.smoker);
  if (p.is_available_now !== undefined) patch.is_available_now = Boolean(p.is_available_now);
  if (p.available_overnight !== undefined) patch.available_overnight = Boolean(p.available_overnight);

  if (p.available_for != null) {
    patch.available_for = Array.isArray(p.available_for)
      ? JSON.stringify(p.available_for)
      : String(p.available_for);
  }

  if (p.services != null) {
    patch.services =
      typeof p.services === 'object' ? JSON.stringify(p.services) : String(p.services);
  }

  return patch;
}

async function syncAnnouncementsWithUserProfile(prisma, userId, profile) {
  const patch = announcementPatchFromSearchProfile(profile);
  if (Object.keys(patch).length === 0) {
    return { count: 0 };
  }
  return prisma.announcement.updateMany({
    where: { user_id: userId },
    data: patch,
  });
}

async function mergeCreateDataWithUserProfile(prisma, userId, data) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { advertiser_search_profile: true },
  });
  if (!user?.advertiser_search_profile) {
    return data;
  }
  const profilePatch = announcementPatchFromSearchProfile(user.advertiser_search_profile);
  // Il profilo inserzionista ha priorità sui campi "filtro ricerca" (non su titolo, prezzi, ecc.)
  return { ...profilePatch, ...data };
}

module.exports = {
  announcementPatchFromSearchProfile,
  syncAnnouncementsWithUserProfile,
  mergeCreateDataWithUserProfile,
};
