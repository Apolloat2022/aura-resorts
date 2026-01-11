import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import ItineraryDisplay from "@/components/ItineraryDisplay";
import Link from "next/link";

export default async function SuccessPage({ params }: { params: Promise<{ subdomain: string, bookingId: string }> }) {
    const { subdomain, bookingId } = await params;

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

    if (!booking) {
        return <div>Booking not found</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8 space-y-12">
            <div className="max-w-4xl mx-auto text-center space-y-4 pt-12">
                <div className={`w-20 h-20 ${booking.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse`}>
                    {booking.status === 'paid' ? (
                        <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight">
                    {booking.status === 'paid' ? 'Booking Confirmed!' : 'Awaiting Confirmation...'}
                </h1>
                <p className="text-xl text-slate-400">Total: <span className="text-white font-bold">${booking.totalPrice / 100}</span></p>
                {booking.status !== 'paid' && (
                    <p className="text-amber-400 font-medium tracking-wide">Your payment is processing. Your itinerary will be officially confirmed shortly.</p>
                )}
            </div>

            <ItineraryDisplay itinerary={booking.itineraryData as any[]} />

            <div className="text-center pb-12">
                <Link
                    href={`/`}
                    className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Storefront
                </Link>
            </div>
        </div>
    );
}
