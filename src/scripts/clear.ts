import "dotenv/config";
import { db } from "../db";
import { partners, bookings, resorts } from "../db/schema";
import { sql } from "drizzle-orm";

async function clear() {
    console.log("Cleaning database...");
    await db.delete(resorts);
    await db.delete(bookings);
    await db.delete(partners);
    console.log("Database cleaned.");
    process.exit(0);
}

clear().catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
});
