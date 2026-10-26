ALTER TABLE "wedding_party" ADD COLUMN "guest_id" uuid;--> statement-breakpoint
ALTER TABLE "wedding_party" ADD CONSTRAINT "wedding_party_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_party" ADD CONSTRAINT "wedding_party_guest_id_unique" UNIQUE("guest_id");