import { getPartnerData, createPartner, updatePartnerSettings, getPartnerBookings } from "@/actions/partner";
import { getPartnerResorts, deleteResort } from "@/actions/resort";
import { UserButton } from "@clerk/nextjs";
import CreateResortForm from "@/components/CreateResortForm";
import TestEmailButton from "@/components/TestEmailButton";
import { BookingTable } from "@/components/BookingTable";

export default async function DashboardPage() {
    const partner = await getPartnerData();
    const bookings = partner ? await getPartnerBookings() : [];
    const resorts = partner ? await getPartnerResorts() : [];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    AIRE Partner Dashboard
                </h1>
                <div className="flex items-center gap-6">
                    <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Home</a>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {!partner ? (
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-12 rounded-3xl text-center space-y-8 max-w-xl mx-auto shadow-2xl">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-extrabold">Join the AIRE Network</h2>
                            <p className="text-slate-400">Claim your subdomain and start earning commissions on luxury resort bookings.</p>
                        </div>

                        <form action={createPartner} className="space-y-6">
                            <div className="text-left space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your Exclusive Subdomain</label>
                                <div className="relative">
                                    <input
                                        name="subdomain"
                                        placeholder="e.g. maldives-expert"
                                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                        .aire.com
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 text-lg"
                            >
                                Onboard with Stripe Connect
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Stats, Resorts, and Bookings Area (Left Column - 2/3) */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                                    <h3 className="text-lg font-medium text-slate-400 mb-6 uppercase tracking-wider">Total Revenue</h3>
                                    <p className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        ${(bookings.reduce((acc, b) => acc + (b.status === 'paid' ? b.totalPrice : 0), 0) / 100).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                                    <h3 className="text-lg font-medium text-slate-400 mb-6 uppercase tracking-wider">My Resorts</h3>
                                    <p className="text-5xl font-bold text-white">{resorts.length}</p>
                                </div>
                            </div>

                            {/* Resort Management Section */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-slate-400 uppercase tracking-wider">Manage Resorts</h3>
                                    <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                                        + New Resort
                                    </button>
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {resorts.map((resort) => (
                                            <div key={resort.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center hover:bg-slate-800/80 transition-all">
                                                <div>
                                                    <h4 className="font-bold">{resort.name}</h4>
                                                    <p className="text-xs text-slate-400">{resort.location}</p>
                                                    <p className="text-cyan-400 font-mono mt-1">${(resort.basePricePerNight / 100)}/night</p>
                                                </div>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteResort(resort.id);
                                                }}>
                                                    <button type="submit" className="text-rose-500 hover:text-rose-400 transition-colors bg-rose-500/10 p-2 rounded-lg">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Resort Form */}
                                    <CreateResortForm partnerId={partner.id} />
                                </div>
                            </div>

                            {/* Recent Bookings Section */}
                            <div>
                                <h3 className="text-lg font-medium text-slate-400 mb-6 uppercase tracking-wider">Recent Bookings (Last 10)</h3>
                                <BookingTable bookings={bookings.slice(0, 10)} />
                            </div>
                        </div>

                        {/* Sidebar Settings (Right Column - 1/3) */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
                                <h3 className="text-lg font-medium text-slate-400 uppercase tracking-wider">Storefront</h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            {(() => {
                                                const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                                                const urlObj = new URL(url);
                                                const isVercel = urlObj.hostname.endsWith(".vercel.app");

                                                let storefrontUrlStr;
                                                let fullUrl;

                                                if (isVercel) {
                                                    storefrontUrlStr = `${urlObj.host}/tenants/${partner.subdomain}`;
                                                    fullUrl = `${urlObj.protocol}//${storefrontUrlStr}`;
                                                } else {
                                                    storefrontUrlStr = `${partner.subdomain}.${urlObj.host}`;
                                                    fullUrl = `${urlObj.protocol}//${storefrontUrlStr}`;
                                                }

                                                return (
                                                    <>
                                                        <code className="text-cyan-400 text-sm font-mono">{storefrontUrlStr}</code>
                                                        <a
                                                            href={fullUrl}
                                                            target="_blank"
                                                            className="text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
                                                        >
                                                            Open
                                                        </a>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
                                <h3 className="text-lg font-medium text-slate-400 uppercase tracking-wider">Configuration</h3>

                                <form action={updatePartnerSettings} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Current Markup Rate (%)</label>
                                        <input
                                            name="markupRate"
                                            type="number"
                                            defaultValue={partner.markupRate}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Brand Tone / Voice</label>
                                        <textarea
                                            name="brandTone"
                                            defaultValue={partner.brandTone || "luxurious, warm, and personalized"}
                                            rows={2}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                                            placeholder="e.g., Adventure-focused, family-first, ultra-luxury..."
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
                                        Save Changes
                                    </button>
                                </form>

                                <div className="pt-6 border-t border-slate-800 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400 flex justify-between">
                                            Payout Status
                                            <span className="text-green-500 flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                Active
                                            </span>
                                        </label>
                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-500 font-mono">
                                            {partner.stripeAccountId}
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-800 space-y-2">
                                        <label className="text-sm text-slate-400">Email Testing</label>
                                        <TestEmailButton />
                                    </div>
                                    <button className="w-full border border-slate-700 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-all text-sm">
                                        Stripe Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
