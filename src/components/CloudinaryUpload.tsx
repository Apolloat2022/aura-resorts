"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

interface CloudinaryUploadProps {
    partnerId: string;
    onUploadSuccess: (url: string) => void;
    currentImageUrl?: string;
}

export default function CloudinaryUpload({ partnerId, onUploadSuccess, currentImageUrl }: CloudinaryUploadProps) {
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImageUrl || null);
    const [loadError, setLoadError] = useState(false);

    return (
        <div className="space-y-4">
            {!loadError ? (
                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    options={{
                        tags: ["aire_resort", partnerId],
                        sources: ["local", "url"],
                        multiple: false,
                    }}
                    onSuccess={(result: any) => {
                        if (result?.info?.secure_url) {
                            const url = result.info.secure_url;
                            setUploadedUrl(url);
                            onUploadSuccess(url);
                        }
                    }}
                    onError={(err) => {
                        console.error("Cloudinary Widget Error:", err);
                        setLoadError(true);
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open()}
                            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-3 text-left transition-all flex items-center justify-between group"
                        >
                            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                                {uploadedUrl ? "Change Image" : "Upload Resort Image"}
                            </span>
                            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </button>
                    )}
                </CldUploadWidget>
            ) : (
                <div className="space-y-2">
                    <label className="text-xs text-rose-400">Upload Widget Failed - Enter URL Manually</label>
                    <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none text-sm"
                        onChange={(e) => {
                            setUploadedUrl(e.target.value);
                            onUploadSuccess(e.target.value);
                        }}
                    />
                </div>
            )}

            {uploadedUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                    <img
                        src={uploadedUrl}
                        alt="Uploaded preview"
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-xs text-white font-medium truncate">{uploadedUrl}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
