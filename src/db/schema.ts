import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

// A party is the unit of RSVP: a couple, a family, or a single guest with a +1.
export const parties = pgTable("parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  tableNumber: integer("table_number"),
  notes: text("notes"),
  side: text("side"),
  message: text("message"),
  // The guest's choice to show their note on the wishes wall; admin can hide it.
  messagePublic: boolean("message_public").notNull().default(false),
  messageHidden: boolean("message_hidden").notNull().default(false),
  song: text("song"),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  ...timestamps,
});

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    partyId: uuid("party_id")
      .notNull()
      .references(() => parties.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull().default(""),
    lastName: text("last_name").notNull().default(""),
    nickname: text("nickname"),
    isChild: boolean("is_child").notNull().default(false),
    // A "+1, name TBD" slot. The guest who RSVPs types the name in.
    isPlaceholder: boolean("is_placeholder").notNull().default(false),
    // null = no answer yet.
    attending: boolean("attending"),
    meal: text("meal"),
    dietary: text("dietary"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("guests_party_idx").on(t.partyId)],
);

// Single row, id = 1.
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  mealChoiceEnabled: boolean("meal_choice_enabled").notNull().default(false),
  adultMealOptions: text("adult_meal_options").array().notNull().default([]),
  kidMealOptions: text("kid_meal_options").array().notNull().default([]),
  rsvpDeadline: date("rsvp_deadline"),
  notifyEmails: text("notify_emails").array().notNull().default([]),
  // Up to four photos for the photobooth strip on the home page.
  heroPhotoIds: uuid("hero_photo_ids").array().notNull().default([]),
  // "auto" switches to the day-of home page on the wedding date.
  dayOfMode: text("day_of_mode").notNull().default("auto"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const scheduleItems = pgTable("schedule_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  time: text("time").notNull(),
  title: text("title").notNull(),
  details: text("details"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const hotels = pgTable("hotels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  address: text("address"),
  distance: text("distance"),
  blockCode: text("block_code"),
  bookBy: text("book_by"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const registryLinks = pgTable("registry_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  blurb: text("blurb"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Every uploaded image: guests' photobooth strips and photos, plus photos the
// couple adds for the home page, story and wedding party.
export const photos = pgTable("photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // "guest" | "site"
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  uploader: text("uploader"),
  caption: text("caption"),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const storyItems = pgTable("story_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  when: text("when").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  photoId: uuid("photo_id").references(() => photos.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const weddingParty = pgTable("wedding_party", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  side: text("side"),
  blurb: text("blurb"),
  photoId: uuid("photo_id").references(() => photos.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Party = typeof parties.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type ScheduleItem = typeof scheduleItems.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type RegistryLink = typeof registryLinks.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type StoryItem = typeof storyItems.$inferSelect;
export type WeddingPartyMember = typeof weddingParty.$inferSelect;
