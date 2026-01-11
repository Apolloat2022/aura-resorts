"use server";

import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/emails/BookingConfirmation";
import { getSafePartnerId } from "@/lib/security";
import { db } from "@/db";
import { partners, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

const resendApiKey = process.env.RESEND_API_KEY || "re_mock_key_123";
const resend = new Resend(resendApiKey);

// Rate limiting map (in-memory, resets on server restart)
const emailTestLimits = new Map<string, number>();

export async function sendTestEmail() {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.log("[MOCK] Test email simulated (RESEND_API_KEY missing)");
            return { success: true, message: "Test email simulated (API key missing)" };
        }

        const partnerId = await getSafePartnerId();
        const { userId } = await auth();

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Rate limiting: 1 email per 60 seconds per partner
        const now = Date.now();
        const lastSent = emailTestLimits.get(partnerId) || 0;
        const timeSinceLastEmail = now - lastSent;

        if (timeSinceLastEmail < 60000) {
            const waitTime = Math.ceil((60000 - timeSinceLastEmail) / 1000);
            throw new Error(`Please wait ${waitTime} seconds before sending another test email`);
        }

        // Get partner info
        const [partner] = await db
            .select()
            .from(partners)
            .where(eq(partners.id, partnerId))
            .limit(1);

        if (!partner) {
            throw new Error("Partner not found");
        }

        // Get partner's latest booking or create sample data
        const [latestBooking] = await db
            .select()
            .from(bookings)
            .where(eq(bookings.partnerId, partnerId))
            .orderBy(bookings.createdAt)
            .limit(1);

        const sampleItinerary = latestBooking?.itineraryData || [
            {
                day: 1,
                title: "Welcome to Paradise",
                activities: ["Check-in and resort orientation", "Sunset beach walk", "Welcome cocktail reception"],
                dining: { breakfast: "Continental Breakfast", lunch: "Poolside Grill", dinner: "Beachfront Seafood" }
            },
            {
                day: 2,
                title: "Ocean Adventures",
                activities: ["Snorkeling excursion", "Beach volleyball", "Sunset cruise"],
                dining: { breakfast: "Buffet Breakfast", lunch: "Beach BBQ", dinner: "Italian Restaurant" }
            },
            {
                day: 3,
                title: "Family Fun Day",
                activities: ["Kids' Club activities", "Family pool games", "Evening magic show"],
                dining: { breakfast: "American Breakfast", lunch: "Taco Bar", dinner: "Steakhouse" }
            },
            {
                day: 4,
                title: "Relaxation & Spa",
                activities: ["Couples spa treatment", "Yoga on the beach", "Wine tasting"],
                dining: { breakfast: "Healthy Options", lunch: "Sushi Bar", dinner: "French Cuisine" }
            },
            {
                day: 5,
                title: "Farewell Paradise",
                activities: ["Final beach morning", "Souvenir shopping", "Departure preparation"],
                dining: { breakfast: "Farewell Brunch", lunch: "Light Snacks", dinner: "Departure" }
            }
        ];

        const resortDetails = latestBooking?.resortDetails as any || {
            name: "Sample Luxury Resort",
            location: "Paradise Island",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
        };

        // Get partner's email from Clerk (you'll need to fetch this from Clerk API or use a test email)
        const testEmail = process.env.TEST_EMAIL || "test@example.com";

        // Send test email
        await resend.emails.send({
            from: "AIRE Resorts <bookings@resend.dev>",
            to: testEmail,
            subject: `[TEST] Your AI-Generated Itinerary for ${resortDetails.name}`,
            react: BookingConfirmationEmail({
                customerName: "Test Customer",
                resortName: resortDetails.name,
                resortImage: resortDetails.imageUrl,
                itinerary: sampleItinerary as any,
                partnerName: partner.subdomain,
                bookingId: latestBooking?.id || "mock-id-123",
                subdomain: partner.subdomain,
            }),
        });

        // Update rate limit
        emailTestLimits.set(partnerId, now);

        return { success: true, message: `Test email sent to ${testEmail}` };

    } catch (error: any) {
        console.error("[EMAIL TEST] Error:", error);
        return { success: false, message: error.message || "Failed to send test email" };
    }
}
