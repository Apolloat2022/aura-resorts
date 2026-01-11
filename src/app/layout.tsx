import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIRE | Global All-Inclusive Resort Marketplace",
  description: "Experience luxury at scale with AIRE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
          suppressHydrationWarning
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16 max-w-7xl mx-auto w-full">
            <SignedOut>
              <div className="flex gap-4 items-center">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium hover:text-cyan-400 transition-colors">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-medium text-sm h-10 px-6 cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex gap-4 items-center">
                <a href="/dashboard" className="text-sm font-medium hover:text-cyan-400 transition-colors">Dashboard</a>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
