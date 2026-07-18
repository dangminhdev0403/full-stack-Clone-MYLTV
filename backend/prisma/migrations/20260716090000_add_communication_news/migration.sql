CREATE TYPE "NewsPublicationStatus" AS ENUM ('draft', 'published', 'hidden');
CREATE TYPE "NewsAudienceType" AS ENUM ('all', 'grade', 'class', 'student');

CREATE TABLE "audit_events" (
  "id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "bounded_context" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "news_items" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "image_url" TEXT,
  "category" TEXT NOT NULL,
  "status" "NewsPublicationStatus" NOT NULL DEFAULT 'draft',
  "is_pinned" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "published_at" TIMESTAMP(3),
  "created_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "news_audiences" (
  "id" TEXT NOT NULL,
  "news_id" TEXT NOT NULL,
  "type" "NewsAudienceType" NOT NULL,
  "value" TEXT,
  CONSTRAINT "news_audiences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "news_audiences_target_check" CHECK (
    ("type" = 'all' AND "value" IS NULL) OR
    ("type" <> 'all' AND "value" IS NOT NULL AND length(btrim("value")) > 0)
  )
);

CREATE INDEX "audit_events_actor_id_created_at_idx" ON "audit_events"("actor_id", "created_at");
CREATE INDEX "audit_events_bounded_context_resource_type_resource_id_idx" ON "audit_events"("bounded_context", "resource_type", "resource_id");
CREATE INDEX "news_items_status_is_pinned_sort_order_published_at_idx" ON "news_items"("status", "is_pinned", "sort_order", "published_at");
CREATE INDEX "news_items_created_by_id_idx" ON "news_items"("created_by_id");
CREATE UNIQUE INDEX "news_audiences_news_id_type_value_key" ON "news_audiences"("news_id", "type", "value");
CREATE INDEX "news_audiences_type_value_idx" ON "news_audiences"("type", "value");

ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "news_audiences" ADD CONSTRAINT "news_audiences_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
