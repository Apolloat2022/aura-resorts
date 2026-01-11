"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950 z-10" />
        <img
          src="/hero.png"
          alt="Luxury Resort"
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[90vh] text-center px-4 max-w-5xl mx-auto space-y-12">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
            AIRE <span className="text-cyan-400">RESORTS</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            The world's first AI-curated multi-tenant resort marketplace.
            Empowering partners to scale luxury travel with Stripe Connect & Gemini AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Link
            href="/dashboard"
            className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-full overflow-hidden hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10">Start Your Partnership</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

          <a
            href={(() => {
              const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
              const cleanUrl = url.replace(/\/$/, "");
              // Replace host with subdomain host
              const urlObj = new URL(cleanUrl);
              urlObj.host = `partner1.${urlObj.host}`;
              return urlObj.toString();
            })()}
            target="_blank"
            className="px-8 py-4 border-2 border-white/30 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/10 transition-all"
          >
            View Demo Storefront
          </a>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 w-full">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-cyan-400/50 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Instant Scale</h3>
            <p className="text-slate-400 text-sm">Deploy a custom storefront in seconds with our multi-tenant subdomain engine.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-blue-400/50 transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">AI-Curated</h3>
            <p className="text-slate-400 text-sm">Gemini 2.0 generates personalized 5-day itineraries for every luxury booking.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-emerald-400/50 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Direct Payouts</h3>
            <p className="text-slate-400 text-sm">Automatic fee splitting and instant partner payouts via Stripe Connect.</p>
          </div>
        </div>
      </div>


    </div>
  );
}
