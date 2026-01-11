import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../db";
import { partners, resorts } from "../db/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding resorts...");

    // Find partner1
    const [partner] = await db.select().from(partners).where(eq(partners.subdomain, "partner1")).limit(1);

    if (!partner) {
        console.error("Partner 'partner1' not found. Please run the main seed script first.");
        return;
    }

    console.log(`Found partner: ${partner.subdomain} (${partner.id})`);

    // Insert resorts
    await db.insert(resorts).values([
        {
            partnerId: partner.id,
            name: "Azure Palms All-Inclusive",
            location: "Cancun, Mexico",
            description: "A luxury oasis with crystal clear waters and white sandy beaches.",
            basePricePerNight: 45000, // $450.00
            amenities: ["Private Beach", "3 Infinity Pools", "Kids Aqua Park", "7 Specialty Restaurants"],
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
        },
        {
            partnerId: partner.id,
            name: "Emerald Bay Resort",
            location: "Seychelles",
            description: "A secluded paradise with private villas and breathtaking ocean views.",
            basePricePerNight: 120000, // $1200.00
            amenities: ["Private Beach", "Infinity Pool", "Butler Service", "Eco-friendly Spa"],
            imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
        }
    ]);

    console.log("Resorts seeded successfully!");
}

seed().catch(console.error);
