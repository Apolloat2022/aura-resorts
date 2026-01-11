"use server";

import { db } from "@/db";
import { resorts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSafePartnerId } from "@/lib/security";

export async function getPartnerResorts() {
    try {
        const partnerId = await getSafePartnerId();

        // Security: MANDATORY partnerId filtering
        return await db
            .select()
            .from(resorts)
            .where(eq(resorts.partnerId, partnerId));

    } catch (error) {
        console.error("[SECURITY] getPartnerResorts failed:", error);
        return [];
    }
}

export async function createResort(formData: FormData) {
    const partnerId = await getSafePartnerId();

    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const basePricePerNight = parseInt(formData.get("basePricePerNight") as string);
    const amenitiesString = formData.get("amenities") as string;
    const amenities = amenitiesString.split(",").map((a) => a.trim()).filter(Boolean);
    const imageUrl = formData.get("imageUrl") as string || null;

    if (!name || !location || isNaN(basePricePerNight)) {
        throw new Error("Missing required fields");
    }

    // Security: partnerId is enforced by getSafePartnerId()
    await db.insert(resorts).values({
        partnerId,
        name,
        location,
        description,
        basePricePerNight: basePricePerNight * 100, // Store in cents
        amenities,
        imageUrl,
    });

    revalidatePath("/dashboard");
}

export async function deleteResort(resortId: string) {
    const partnerId = await getSafePartnerId();

    // Security: MANDATORY partnerId filtering - prevents cross-tenant deletion
    await db
        .delete(resorts)
        .where(
            and(
                eq(resorts.id, resortId),
                eq(resorts.partnerId, partnerId) // Iron Curtain enforcement
            )
        );

    revalidatePath("/dashboard");
}
