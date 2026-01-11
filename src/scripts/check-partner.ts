import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function check() {
    console.log("Checking for partner1...");

    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        const result = await sql`
            SELECT * FROM partners WHERE subdomain = 'partner1'
        `;

        console.log("Result:", result);
    } catch (err) {
        console.error("Query failed:", err);
    }
}

check();
