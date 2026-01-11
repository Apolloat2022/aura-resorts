import { db } from "@/db";
import { bookings, partners } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/emails/BookingConfirmation";



export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    // Initialize Resend client lazily to handle missing env vars during build
    const resend = new Resend(process.env.RESEND_API_KEY || "re_missing_key");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const bookingId = session.client_reference_id;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const customerName = session.customer_details?.name || "Valued Guest";

        if (bookingId) {
            // Update booking status and customer info
            await db.update(bookings)
                .set({
                    status: "paid",
                    customerEmail,
                    customerName,
                })
                .where(eq(bookings.id, bookingId));

            console.log(`Booking ${bookingId} marked as PAID`);

            // Fetch booking details for email
            const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

            if (booking && customerEmail) {
                const resortDetails = booking.resortDetails as any;
                const itineraryData = booking.itineraryData as any;

                // Fetch partner info
                const [partner] = await db.select().from(partners).where(eq(partners.id, booking.partnerId)).limit(1);

                // Send confirmation email
                try {
                    await resend.emails.send({
                        from: "AIRE Resorts <bookings@resend.dev>",
                        to: customerEmail,
                        subject: `Your AI-Generated Itinerary for ${resortDetails.name}`,
                        react: BookingConfirmationEmail({
                            customerName,
                            resortName: resortDetails.name,
                            resortImage: resortDetails.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
                            itinerary: itineraryData,
                            partnerName: partner?.subdomain || "AIRE",
                            bookingId: booking.id,
                            subdomain: partner?.subdomain || "AIRE",
                        }),
                    });

                    console.log(`Confirmation email sent to ${customerEmail}`);
                } catch (emailError) {
                    console.error("Email sending failed:", emailError);
                    // Don't fail the webhook if email fails
                }
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}
