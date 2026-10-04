CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"uploader" text,
	"caption" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"when" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"photo_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wedding_party" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"side" text,
	"blurb" text,
	"photo_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parties" ADD COLUMN "side" text;--> statement-breakpoint
ALTER TABLE "parties" ADD COLUMN "message_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "parties" ADD COLUMN "message_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "hero_photo_ids" uuid[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "day_of_mode" text DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE "story_items" ADD CONSTRAINT "story_items_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_party" ADD CONSTRAINT "wedding_party_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;