"use client";

import { motion } from "framer-motion";

interface Day {
    day: number;
    title: string;
    activities: string[];
    dining: {
        breakfast: string;
        lunch: string;
        dinner: string;
    };
}

export default function ItineraryDisplay({ itinerary }: { itinerary: Day[] }) {
    return (
        <div className="space-y-8 max-w-4xl mx-auto py-12">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Your AI-Curated Experience
            </h2>

            <div className="grid gap-6">
                {itinerary.map((day, idx) => (
                    <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 shadow-xl overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/10 blur-[100px] group-hover:bg-cyan-500/20 transition-all" />

                        <div className="flex flex-col md:flex-row gap-6 relative">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                                    {day.day}
                                </div>
                            </div>

                            <div className="flex-grow space-y-4">
                                <h3 className="text-2xl font-semibold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                    {day.title}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Activities</p>
                                        <ul className="space-y-1">
                                            {day.activities.map((act, i) => (
                                                <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                                                    {act}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Dining</p>
                                        <div className="grid grid-cols-1 gap-1 text-sm">
                                            <p className="text-slate-400">🍳 <span className="text-slate-300">{day.dining.breakfast}</span></p>
                                            <p className="text-slate-400">🥗 <span className="text-slate-300">{day.dining.lunch}</span></p>
                                            <p className="text-slate-400">🍷 <span className="text-slate-300">{day.dining.dinner}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
