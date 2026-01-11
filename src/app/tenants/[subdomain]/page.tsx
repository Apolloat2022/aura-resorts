import { db } from "@/db";
import { partners, resorts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createBooking } from "@/actions/booking";

export default async function TenantPage({ params }: { params: Promise<{ subdomain: string }> }) {
    const { subdomain } = await params;

    // Fetch partner details
    const [partner] = await db.select().from(partners).where(eq(partners.subdomain, subdomain)).limit(1);

    if (!partner) {
        return <div>Partner not found</div>;
    }

    // Fetch resorts for this partner
    const partnerResorts = await db.select().from(resorts).where(eq(resorts.partnerId, partner.id));

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8 flex flex-col items-center">
            <header className="w-full max-w-6xl flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent uppercase tracking-wider">
                    {subdomain} Resorts
                </h1>
                <div className="px-4 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-medium text-slate-400">
                    Partner ID: {partner.id.substring(0, 8)}...
                </div>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {partnerResorts.length > 0 ? (
                    partnerResorts.map((resort) => (
                        <div key={resort.id} className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all group flex flex-col h-full shadow-2xl">
                            <div className="relative h-48 bg-slate-800">
                                {resort.imageUrl ? (
                                    <img src={resort.imageUrl} alt={resort.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                        <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                        {resort.location}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{resort.name}</h3>
                                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                                        {resort.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {resort.amenities.slice(0, 3).map((amenity) => (
                                        <span key={amenity} className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] text-slate-400 border border-slate-700/50">
                                            {amenity}
                                        </span>
                                    ))}
                                    {resort.amenities.length > 3 && (
                                        <span className="text-[10px] text-slate-500 font-medium">+{resort.amenities.length - 3} more</span>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-auto">
                                    <div>
                                        <p className="text-2xl font-black text-cyan-400 leading-none">${resort.basePricePerNight / 100}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">per night</p>
                                    </div>
                                    <form action={createBooking} className="flex flex-col gap-3">
                                        <input type="hidden" name="partnerId" value={partner.id} />
                                        <input type="hidden" name="resortId" value={resort.id} />
                                        <input type="hidden" name="nights" value="5" />

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">Your Email</label>
                                            <input
                                                type="email"
                                                name="customerEmail"
                                                placeholder="you@email.com"
                                                required
                                                className="bg-slate-950/50 border border-slate-800 text-[10px] px-3 py-1.5 rounded-lg focus:border-cyan-500 outline-none text-slate-300 placeholder:text-slate-700 font-mono"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">Traveling with kids? (Ages)</label>
                                            <input
                                                type="text"
                                                name="kidsAges"
                                                placeholder="e.g. 5, 8"
                                                className="bg-slate-950/50 border border-slate-800 text-[10px] px-3 py-1.5 rounded-lg focus:border-cyan-500 outline-none text-slate-300 placeholder:text-slate-700 font-mono"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="bg-white text-slate-900 px-6 py-2.5 rounded-full text-xs font-black uppercase hover:bg-cyan-400 transition-colors shadow-lg shadow-white/5 active:scale-95 transform whitespace-nowrap"
                                        >
                                            Book Now
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold">No Resorts Available</h2>
                        <p className="text-slate-400 max-w-md mx-auto">This partner hasn't listed any resorts yet. Please check back later or visit our main directory.</p>
                        <a href="/" className="inline-block text-cyan-400 text-sm font-bold hover:underline">Return to AIRE Home</a>
                    </div>
                )}
            </div>
        </div>
    );
}
