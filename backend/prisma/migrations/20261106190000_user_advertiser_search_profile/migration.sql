-- Profilo filtri ricerca (inserzionista): un solo blocco per utente, sincronizzato sugli annunci
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "advertiser_search_profile" JSONB;
