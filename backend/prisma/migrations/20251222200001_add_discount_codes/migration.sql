-- CreateTable
CREATE TABLE IF NOT EXISTS "discount_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_percent" INTEGER,
    "discount_amount" DECIMAL(65,30),
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "applies_to" TEXT NOT NULL DEFAULT 'all',
    "min_amount" DECIMAL(65,30),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "discount_codes_code_key" ON "discount_codes"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "discount_codes_code_idx" ON "discount_codes"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "discount_codes_is_active_idx" ON "discount_codes"("is_active");

