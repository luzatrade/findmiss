/** Annunci visibili subito; imposta ANNOUNCEMENTS_REQUIRE_APPROVAL=true per moderazione prima. */
function defaultAnnouncementStatus() {
  if (process.env.ANNOUNCEMENTS_REQUIRE_APPROVAL === 'true') {
    return 'pending';
  }
  if (process.env.ANNOUNCEMENTS_AUTO_APPROVE === 'false') {
    return 'pending';
  }
  return 'active';
}

module.exports = { defaultAnnouncementStatus };
