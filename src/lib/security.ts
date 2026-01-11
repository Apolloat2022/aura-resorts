"use server";

import { db } from "@/db";
import { partners } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

/**
 * Security utility: Get current partner ID from authenticated user
 * This ensures all queries are scoped to the correct tenant
 * @throws Error if user is not authenticated or partner not found
 */
export async function getSafePartnerId(): Promise<string> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("[SECURITY] Unauthorized: No user ID");
    }

    const [partner] = await db
        .select()
        .from(partners)
        .where(eq(partners.userId, userId))
        .limit(1);

    if (!partner) {
        throw new Error("[SECURITY] Partner not found for user");
    }

    console.log(`[SECURITY] Validated partnerId: ${partner.id} for userId: ${userId}`);
    return partner.id;
}
