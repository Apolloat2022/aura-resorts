"use client";

import { useState } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { createResort } from "@/actions/resort";

interface CreateResortFormProps {
    partnerId: string;
}

export default function CreateResortForm({ partnerId }: CreateResortFormProps) {
    const [imageUrl, setImageUrl] = useState<string>("");

    return (
        <div className="mt-12 pt-8 border-t border-slate-800">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Create New Listing</h4>
            <form action={async (formData: FormData) => {
                // Add the imageUrl to the form data
                if (imageUrl) {
                    formData.set("imageUrl", imageUrl);
                }
                await createResort(formData);
            }} className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Resort Name</label>
                    <input name="name" placeholder="e.g. Azure Palms" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none" required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Location</label>
                    <input name="location" placeholder="e.g. Cancun, Mexico" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none" required />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                    <textarea name="description" placeholder="A luxury oasis..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none h-24 resize-none" required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Base Price ($/Night)</label>
                    <input name="basePricePerNight" type="number" placeholder="450" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none" required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Amenities (Comma Sep)</label>
                    <input name="amenities" placeholder="Pool, Beach, Spa" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none" required />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Resort Image</label>
                    <CloudinaryUpload
                        partnerId={partnerId}
                        onUploadSuccess={(url) => setImageUrl(url)}
                        currentImageUrl={imageUrl}
                    />
                    <input type="hidden" name="imageUrl" value={imageUrl} />
                </div>
                <button type="submit" className="col-span-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transform transition-all active:scale-95">
                    Create Resort Listing
                </button>
            </form>
        </div>
    );
}
