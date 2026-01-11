import "dotenv/config";
import { db } from "../db";
import { partners } from "../db/schema";

async function seed() {
    console.log("Seeding partners...");

    // Truncate first to avoid conflicts
    // Note: Drizzle delete without where deletes all

    const [partner] = await db.insert(partners).values({
        userId: "user_2test_clerk_id", // Mock Clerk ID
        subdomain: "partner1",
        markupRate: 20, // 20% markup for testing
        stripeAccountId: "acct_1placeholder",
        logoUrl: "https://images.unsplash.com/photo-1599305090748-36656ca88d4d?auto=format&fit=crop&w=200&q=80",
    }).returning();

    console.log("Seeded partner:", partner);
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
