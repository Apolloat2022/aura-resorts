"use client";

interface Booking {
    id: string;
    customerEmail: string | null;
    resortDetails: unknown; // jsonb in DB, we'll cast it
    totalPrice: number; // in cents
    status: string;
    createdAt: Date;
}

export const BookingTable = ({ bookings }: { bookings: Booking[] }) => {
    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(cents / 100);
    };

    const getResortName = (details: any) => {
        // details is jsonb, could be any. Safely access name.
        return details?.name || "Unknown Resort";
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/50 backdrop-blur-sm">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="border-b border-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-medium">Guest</th>
                        <th className="px-6 py-4 font-medium">Destination</th>
                        <th className="px-6 py-4 font-medium">Total</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-900/50 transition-colors">
                            <td className="px-6 py-4 text-white font-medium">{booking.customerEmail || "N/A"}</td>
                            <td className="px-6 py-4">{getResortName(booking.resortDetails)}</td>
                            <td className="px-6 py-4 text-white">{formatCurrency(booking.totalPrice)}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${booking.status === "paid"
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-slate-500/10 text-slate-400"
                                    }`}>
                                    {booking.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-xs">
                                {new Date(booking.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
