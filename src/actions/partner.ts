"use server";

import { db } from "@/db";
import { partners, bookings } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSafePartnerId } from "@/lib/security";

export async function createPartner(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const subdomain = formData.get("subdomain") as string;
    if (!subdomain) throw new Error("Subdomain is required");

    // Check if subdomain exists
    const existing = await db.select().from(partners).where(eq(partners.subdomain, subdomain)).limit(1);
    if (existing.length > 0) throw new Error("Subdomain already taken");

    // 1. Create a Stripe Express Account
    const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    // 2. Save Partner to DB
    await db.insert(partners).values({
        userId,
        subdomain: subdomain.toLowerCase(),
        stripeAccountId: account.id,
        markupRate: 10,
    });

    // 3. Create Account Link for onboarding
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${appUrl}/dashboard`,
        return_url: `${appUrl}/dashboard`,
        type: "account_onboarding",
    });

    redirect(accountLink.url);
}

export async function getPartnerData() {
    const { userId } = await auth();
    if (!userId) return null;

    const [partner] = await db.select().from(partners).where(eq(partners.userId, userId)).limit(1);
    return partner || null;
}

export async function updatePartnerSettings(formData: FormData) {
    const partnerId = await getSafePartnerId();

    const markupRate = parseInt(formData.get("markupRate") as string);
    const brandTone = formData.get("brandTone") as string;
    const logoUrl = formData.get("logoUrl") as string;

    if (isNaN(markupRate)) throw new Error("Invalid markup rate");

    // Security: MANDATORY partnerId filtering
    await db
        .update(partners)
        .set({
            markupRate,
            brandTone: brandTone || "luxurious, warm, and personalized",
            logoUrl: logoUrl || null
        })
        .where(eq(partners.id, partnerId));
}

export async function getPartnerBookings() {
    try {
        const partnerId = await getSafePartnerId();

        // Security: MANDATORY partnerId filtering - prevents cross-tenant data access
        return await db
            .select()
            .from(bookings)
            .where(eq(bookings.partnerId, partnerId))
            .orderBy(bookings.createdAt);

    } catch (error) {
        console.error("[SECURITY] getPartnerBookings failed:", error);
        return [];
    }
}
