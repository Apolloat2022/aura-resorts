import { pgTable, uuid, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  subdomain: text("subdomain").notNull().unique(),
  markupRate: integer("markup_rate").default(10).notNull(),
  stripeAccountId: text("stripe_account_id"),
  brandTone: text("brand_tone").default("luxurious, warm, and personalized"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id").references(() => partners.id).notNull(),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  totalPrice: integer("total_price").notNull(),
  resortDetails: jsonb("resort_details").notNull(),
  itineraryData: jsonb("itinerary_data"),
  kidsAges: jsonb("kids_ages").$type<number[]>(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resorts = pgTable("resorts", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  basePricePerNight: integer("base_price_per_night").notNull(),
  amenities: text("amenities").array().notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
