-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "available_for" TEXT,
ADD COLUMN     "hair_length" TEXT,
ADD COLUMN     "has_natural_photo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_vip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "phone_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price_videochat" DECIMAL(65,30),
ADD COLUMN     "profile_public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reel_likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reel_views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "services" TEXT,
ADD COLUMN     "smoker" BOOLEAN,
ADD COLUMN     "top_page_boost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "top_page_expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "ai_processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata_removed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "announcement_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "message_type" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "read_at" TIMESTAMP(3),
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "metadata" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "followers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "following_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ghost_mode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "phone_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "privacy_mode" TEXT NOT NULL DEFAULT 'standard';

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT NOT NULL,
    "selected_city_id" TEXT,
    "selected_category_id" TEXT,
    "filters" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_blocks" (
    "id" TEXT NOT NULL,
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protected_media" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "type" TEXT NOT NULL,
    "is_protected" BOOLEAN NOT NULL DEFAULT true,
    "view_once" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "max_views" INTEGER NOT NULL DEFAULT 1,
    "screenshot_block" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protected_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewed_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reel_stats" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "contact_count" INTEGER NOT NULL DEFAULT 0,
    "avg_watch_time" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reel_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "daily_exits" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_spots" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "spot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spot_time" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_spots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "top_page_boosts" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "top_page_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "items" TEXT NOT NULL,
    "tax_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_streams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "announcement_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "stream_key" TEXT NOT NULL,
    "stream_url" TEXT,
    "playback_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "price_per_minute" DECIMAL(65,30),
    "viewers_count" INTEGER NOT NULL DEFAULT 0,
    "peak_viewers" INTEGER NOT NULL DEFAULT 0,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "tips_total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_viewers" (
    "id" TEXT NOT NULL,
    "stream_id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "watch_time" INTEGER NOT NULL DEFAULT 0,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "live_viewers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_tips" (
    "id" TEXT NOT NULL,
    "stream_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "message" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_messages" (
    "id" TEXT NOT NULL,
    "stream_id" TEXT NOT NULL,
    "user_id" TEXT,
    "nickname" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_recordings" (
    "id" TEXT NOT NULL,
    "stream_id" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "file_size" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "announcement_id" TEXT,
    "type" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 5,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "replies_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_views" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_id_key" ON "user_sessions"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_blocks_blocker_id_blocked_id_key" ON "user_blocks"("blocker_id", "blocked_id");

-- CreateIndex
CREATE INDEX "protected_media_message_id_idx" ON "protected_media"("message_id");

-- CreateIndex
CREATE INDEX "reviews_announcement_id_idx" ON "reviews"("announcement_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "reel_stats_announcement_id_idx" ON "reel_stats"("announcement_id");

-- CreateIndex
CREATE INDEX "reel_stats_date_idx" ON "reel_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "reel_stats_announcement_id_date_key" ON "reel_stats"("announcement_id", "date");

-- CreateIndex
CREATE INDEX "daily_spots_announcement_id_idx" ON "daily_spots"("announcement_id");

-- CreateIndex
CREATE INDEX "daily_spots_spot_date_idx" ON "daily_spots"("spot_date");

-- CreateIndex
CREATE INDEX "daily_spots_spot_time_idx" ON "daily_spots"("spot_time");

-- CreateIndex
CREATE INDEX "top_page_boosts_announcement_id_idx" ON "top_page_boosts"("announcement_id");

-- CreateIndex
CREATE INDEX "top_page_boosts_start_date_idx" ON "top_page_boosts"("start_date");

-- CreateIndex
CREATE INDEX "top_page_boosts_end_date_idx" ON "top_page_boosts"("end_date");

-- CreateIndex
CREATE INDEX "top_page_boosts_is_active_idx" ON "top_page_boosts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_payment_id_key" ON "invoices"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_user_id_idx" ON "invoices"("user_id");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "live_streams_stream_key_key" ON "live_streams"("stream_key");

-- CreateIndex
CREATE INDEX "live_streams_user_id_idx" ON "live_streams"("user_id");

-- CreateIndex
CREATE INDEX "live_streams_status_idx" ON "live_streams"("status");

-- CreateIndex
CREATE INDEX "live_streams_started_at_idx" ON "live_streams"("started_at");

-- CreateIndex
CREATE INDEX "live_viewers_stream_id_idx" ON "live_viewers"("stream_id");

-- CreateIndex
CREATE INDEX "live_viewers_user_id_idx" ON "live_viewers"("user_id");

-- CreateIndex
CREATE INDEX "live_tips_stream_id_idx" ON "live_tips"("stream_id");

-- CreateIndex
CREATE INDEX "live_tips_user_id_idx" ON "live_tips"("user_id");

-- CreateIndex
CREATE INDEX "live_messages_stream_id_idx" ON "live_messages"("stream_id");

-- CreateIndex
CREATE INDEX "live_messages_created_at_idx" ON "live_messages"("created_at");

-- CreateIndex
CREATE INDEX "live_recordings_stream_id_idx" ON "live_recordings"("stream_id");

-- CreateIndex
CREATE INDEX "stories_user_id_idx" ON "stories"("user_id");

-- CreateIndex
CREATE INDEX "stories_expires_at_idx" ON "stories"("expires_at");

-- CreateIndex
CREATE INDEX "stories_is_active_idx" ON "stories"("is_active");

-- CreateIndex
CREATE INDEX "story_views_story_id_idx" ON "story_views"("story_id");

-- CreateIndex
CREATE UNIQUE INDEX "story_views_story_id_user_id_key" ON "story_views"("story_id", "user_id");

-- CreateIndex
CREATE INDEX "follows_follower_id_idx" ON "follows"("follower_id");

-- CreateIndex
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");

-- CreateIndex
CREATE INDEX "announcements_is_verified_idx" ON "announcements"("is_verified");

-- CreateIndex
CREATE INDEX "announcements_has_video_idx" ON "announcements"("has_video");

-- CreateIndex
CREATE INDEX "announcements_is_available_now_idx" ON "announcements"("is_available_now");

-- CreateIndex
CREATE INDEX "cities_name_idx" ON "cities"("name");

-- CreateIndex
CREATE INDEX "cities_slug_idx" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_payment_type_idx" ON "payments"("payment_type");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_selected_city_id_fkey" FOREIGN KEY ("selected_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protected_media" ADD CONSTRAINT "protected_media_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewed_id_fkey" FOREIGN KEY ("reviewed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reel_stats" ADD CONSTRAINT "reel_stats_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_spots" ADD CONSTRAINT "daily_spots_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_page_boosts" ADD CONSTRAINT "top_page_boosts_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_viewers" ADD CONSTRAINT "live_viewers_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "live_streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_tips" ADD CONSTRAINT "live_tips_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "live_streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_messages" ADD CONSTRAINT "live_messages_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "live_streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_recordings" ADD CONSTRAINT "live_recordings_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "live_streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
