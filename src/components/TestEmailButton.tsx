"use client";

import { sendTestEmail } from "@/actions/test-email";
import { useState } from "react";

export default function TestEmailButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleTestEmail = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const result = await sendTestEmail();

            if (result.success) {
                setMessage({ type: "success", text: result.message });
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Failed to send test email" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handleTestEmail}
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Test Email
                    </>
                )}
            </button>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
