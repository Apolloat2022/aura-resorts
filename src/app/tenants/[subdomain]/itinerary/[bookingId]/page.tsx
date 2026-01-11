import { db } from "@/db";
import { bookings, partners, resorts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface ItineraryPageProps {
    params: {
        subdomain: string;
        bookingId: string;
    };
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
    const { subdomain, bookingId } = params;

    // 1. Fetch Booking with Resort and Partner details
    const [booking] = await db
        .select({
            id: bookings.id,
            totalPrice: bookings.totalPrice,
            resortDetails: bookings.resortDetails,
            itineraryData: bookings.itineraryData,
            status: bookings.status,
            customerName: bookings.customerName,
        })
        .from(bookings)
        .innerJoin(partners, eq(bookings.partnerId, partners.id))
        .where(eq(bookings.id, bookingId))
        .limit(1);

    if (!booking) {
        notFound();
    }

    // Verify subdomain matches (optional extra security, though ID is UUID)
    // if (booking.partnerName !== subdomain) {
    //     notFound();
    // }


    const resort = booking.resortDetails as any;
    const itinerary = booking.itineraryData as any[];

    if (!itinerary) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Itinerary Pending</h1>
                    <p className="text-slate-400">Your AI Concierge is currently crafting your bespoke experience.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
            {/* Hero Header */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />
                <img
                    src={resort.imageUrl || "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=80"}
                    alt={resort.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 max-w-4xl mx-auto">
                    <div className="inline-block bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 px-4 py-1.5 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
                        Curated by {subdomain}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">
                        {resort.name}
                    </h1>
                    <p className="text-lg text-slate-300 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {resort.location}
                    </p>
                </div>
            </div>

            <main className="max-w-3xl mx-auto p-8 -mt-10 relative z-30">
                {/* Introduction Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-12 shadow-2xl">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
                        Your Personal AI Itinerary
                    </h2>
                    <p className="text-slate-400 leading-relaxed">
                        Welcome, <strong>{booking.customerName || "Guest"}</strong>. We have crafted a bespoke 5-day journey for you at {resort.name}.
                        Every detail has been personalized to ensure an unforgettable experience tailored just for you.
                    </p>
                </div>

                {/* Itinerary Timeline */}
                <div className="space-y-12 relative before:absolute before:left-4 md:before:left-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-800 before:-translate-x-1/2">
                    {itinerary.map((day: any, index: number) => (
                        <div key={day.day} className="relative flex flex-col md:flex-row items-center gap-8">

                            {/* Day Marker */}
                            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-950 border-4 border-cyan-500 rounded-full z-10 flex items-center justify-center">
                                <span className="w-2 h-2 bg-white rounded-full" />
                            </div>

                            {/* Content Card */}
                            <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right text-left' : 'md:pl-12 md:ml-auto text-left'}`}>
                                <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all p-6 rounded-2xl group">
                                    <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-2">Day {day.day}</h3>
                                    <h4 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{day.title}</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Highlights</h5>
                                            <ul className={`space-y-1 text-slate-300 text-sm ${index % 2 === 0 ? 'md:items-end' : ''} flex flex-col`}>
                                                {day.activities.map((activity: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-cyan-500 rounded-full md:hidden" />
                                                        {activity}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="pt-4 border-t border-slate-800/50">
                                            <h5 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Dining</h5>
                                            <div className="grid grid-cols-1 gap-1 text-xs text-slate-400">
                                                <div className="flex justify-between md:justify-end gap-2">
                                                    <span className="text-slate-600">Morning:</span> {day.dining.breakfast}
                                                </div>
                                                <div className="flex justify-between md:justify-end gap-2">
                                                    <span className="text-slate-600">Midday:</span> {day.dining.lunch}
                                                </div>
                                                <div className="flex justify-between md:justify-end gap-2">
                                                    <span className="text-slate-600">Evening:</span> <span className="text-amber-400/90">{day.dining.dinner}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-20 text-center border-t border-slate-800 pt-12 pb-8">
                    <p className="text-slate-500 text-sm">
                        Curated exclusively for you by <strong>{subdomain}</strong> via AIRE using Gemini 2.0 Flash.
                    </p>
                    <div className="mt-8">
                        <a href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold uppercase tracking-widest">
                            <span className="text-lg">←</span> Back to Home
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
