"use client";

import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
    onFileSelect: (file: File) => void;
    error?: string;
}

export function PhotoUpload({ onFileSelect, error }: PhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);

        try {
            const options = {
                maxSizeMB: 1, // Compress to ensure it's under 5MB easily, usually much smaller
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            // Create preview
            const previewUrl = URL.createObjectURL(compressedFile);
            setPreview(previewUrl);

            onFileSelect(compressedFile);
        } catch (error) {
            console.error("Error compressing image:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearImage = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-text">
                Profile Photo <span className="text-red-500">*</span>
                <span className="block text-xs text-muted-foreground font-normal mt-1">
                    First impressions matter! Upload a clear photo of yourself.
                </span>
            </label>

            <div className="mt-2 flex items-center gap-4">
                {preview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-32 h-32 rounded-xl border-2 border-dashed border-border/60 hover:border-coral flex flex-col items-center justify-center cursor-pointer transition-colors bg-white hover:bg-coral/5",
                            error && "border-red-500 bg-red-50"
                        )}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral"></div>
                        ) : (
                            <>
                                <Camera className={cn("w-8 h-8 mb-2", error ? "text-red-500" : "text-muted-foreground")} />
                                <span className={cn("text-xs font-medium", error ? "text-red-500" : "text-muted-foreground")}>Upload Photo</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
