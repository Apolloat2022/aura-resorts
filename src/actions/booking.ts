"use server";

import { db } from "@/db";
import { partners, bookings, resorts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateItinerary } from "@/lib/gemini";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

export async function createBooking(formData: FormData) {
    const partnerId = formData.get("partnerId") as string;
    const resortId = formData.get("resortId") as string;
    const nights = parseInt(formData.get("nights") as string || "5");

    if (!partnerId || !resortId) {
        throw new Error("Missing required fields");
    }

    // 1. Fetch Partner to get markup rate
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1);
    if (!partner) throw new Error("Partner not found");

    // 2. Fetch Resort from database and verify it belongs to the partner
    const [resort] = await db.select().from(resorts).where(
        and(
            eq(resorts.id, resortId),
            eq(resorts.partnerId, partnerId)
        )
    ).limit(1);

    if (!resort) throw new Error("Resort not found or does not belong to this partner");

    const basePrice = resort.basePricePerNight * nights;

    // 3. Calculate final price with markup
    const markupAmount = (basePrice * (partner.markupRate || 10)) / 100;
    const totalPrice = basePrice + markupAmount;

    // 4. Extract kids' ages from formData (if any)
    const kidsAgesString = formData.get("kidsAges") as string | null;
    const kidsAges = kidsAgesString
        ? kidsAgesString.split(",").map(age => parseInt(age.trim())).filter(age => !isNaN(age))
        : [];

    // 5. Generate AI Itinerary with Brand Tone and Kids' Ages
    const itinerary = await generateItinerary(resort, nights, kidsAges, partner.brandTone || undefined, partner.subdomain);

    // 6. Save to database
    const [newBooking] = await db.insert(bookings).values({
        partnerId: partner.id,
        totalPrice: Math.round(totalPrice),
        resortDetails: resort,
        itineraryData: itinerary,
        kidsAges: kidsAges.length > 0 ? kidsAges : null,
        status: "pending",
    }).returning();

    // 6. Create Stripe Checkout Session
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: resort.name,
                        description: `${nights} nights at ${resort.location}`,
                    },
                    unit_amount: Math.round(totalPrice),
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        client_reference_id: newBooking.id,
        customer_email: formData.get("customerEmail") as string | undefined,
        success_url: `${origin}/success/${newBooking.id}`,
        cancel_url: `${origin}/`,
        payment_intent_data: (partner.stripeAccountId && !partner.stripeAccountId.startsWith('acct_1placeholder') && !partner.stripeAccountId.includes('test')) ? {
            application_fee_amount: Math.round(basePrice),
            transfer_data: {
                destination: partner.stripeAccountId,
            },
        } : undefined,
    });

    console.log(`[STRIPE SPLIT] Total: $${totalPrice / 100} | AIRE Keeps (Fee): $${basePrice / 100} | Partner Gets: $${(totalPrice - basePrice) / 100} (${partner.stripeAccountId})`);

    if (session.url) {
        redirect(session.url);
    }

    redirect(`/success/${newBooking.id}`);
}
