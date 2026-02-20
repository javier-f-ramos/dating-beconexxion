"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import {
    registrationSchema,
    RegistrationFormData,
    interestsList,
    personalityTraits,
    bodyTypes,
    hairColors
} from "@/lib/validations/registration";
import { PhotoUpload } from "./PhotoUpload";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2 } from "lucide-react";

export function RegistrationForm() {
    const searchParams = useSearchParams();
    const gender = searchParams.get("gender") as "male" | "female" | null;
    const router = useRouter();
    const [photo, setPhoto] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);

    // Basic gender validation redirect if missing
    if (!gender || (gender !== 'male' && gender !== 'female')) {
        // Ideally redirect back or show generic
        // For now, default or render error
    }

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            interests: [],
            personality_traits: [],
            height: "",
            body_type: "",
            hair_color: "",
            consent_accurate: false,
            consent_terms: false,
            consent_photo: false,
        }
    });

    const { register, handleSubmit, formState: { errors }, setValue, watch } = form;

    const watchedInterests = watch("interests");
    const watchedTraits = watch("personality_traits");

    const onSubmit = async (data: RegistrationFormData) => {
        if (!photo) {
            form.setError("root", { message: "Photo is required" });
            return;
        }

        startTransition(async () => {
            try {
                // 1. Upload Photo to Supabase Storage
                const fileExt = photo.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('photos')
                    .upload(filePath, photo);

                if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('photos')
                    .getPublicUrl(filePath);

                // 2. Insert Data into Supabase DB
                console.log("Submitting data:", { ...data, gender, photo_url: publicUrl });

                const { error: insertError } = await supabase
                    .from('registrations')
                    .insert({
                        full_name: data.full_name,
                        email: data.email,
                        phone: data.phone,
                        age: data.age,
                        gender: gender,
                        city: data.city,
                        occupation: data.occupation,
                        interests: data.interests,
                        personality_traits: data.personality_traits,
                        height: data.height,
                        body_type: data.body_type,
                        hair_color: data.hair_color,
                        looking_for: data.looking_for,
                        additional_notes: data.additional_notes,
                        photo_url: publicUrl,
                        status: 'approved'
                    });

                if (insertError) {
                    console.error("Insert error details:", insertError);
                    throw new Error(`Registration failed: ${insertError.message}`);
                }

                setIsSuccess(true);
            } catch (error: any) {
                console.error("Submission error:", error);
                form.setError("root", { message: error.message || "Something went wrong. Please try again." });
            }
        });
    };

    const toggleInterest = (interest: string) => {
        const current = watchedInterests;
        if (current.includes(interest)) {
            setValue("interests", current.filter(i => i !== interest), { shouldValidate: true });
        } else {
            if (current.length < 5) {
                setValue("interests", [...current, interest], { shouldValidate: true });
            }
        }
    };

    const toggleTrait = (trait: string) => {
        const current = watchedTraits;
        if (current.includes(trait)) {
            setValue("personality_traits", current.filter(t => t !== trait), { shouldValidate: true });
        } else {
            if (current.length < 3) {
                setValue("personality_traits", [...current, trait], { shouldValidate: true });
            }
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-card shadow-sm border border-border">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-text mb-2">Registration Complete!</h2>
                <p className="text-muted-foreground max-w-md">
                    Thank you for registering. You will receive a confirmation email shortly with more details about the event.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-8 px-6 py-2 bg-coral text-white rounded-button hover:bg-coral-hover transition-colors"
                >
                    Return Home
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 md:p-10 rounded-card shadow-sm border border-border">
            <div className="mb-8 border-b border-border/50 pb-4">
                <h1 className="text-3xl font-bold text-text">
                    {gender === 'female' ? 'Woman' : 'Man'} Registration
                </h1>
                <p className="text-muted-foreground mt-1">
                    Please fill out all fields honestly to help us find your best match.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Details */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-coral/10 text-coral flex items-center justify-center text-xs">1</span>
                        Personal Details
                    </h2>

                    <PhotoUpload
                        onFileSelect={(file) => { setPhoto(file); form.clearErrors("root"); }}
                        error={!photo && form.formState.isSubmitted ? "Photo is required" : undefined}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                            <input {...register("full_name")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all" placeholder="Jane Doe" />
                            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Age <span className="text-red-500">*</span></label>
                            <input type="number" {...register("age", { valueAsNumber: true })} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all" placeholder="25" />
                            {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                            <input type="email" {...register("email")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all" placeholder="jane@example.com" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                            <input type="tel" {...register("phone")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all" placeholder="+1 234 567 890" />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">City <span className="text-red-500">*</span></label>
                            <input {...register("city")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all" placeholder="New York" />
                            {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Occupation</label>
                            <input {...register("occupation")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all" placeholder="Software Engineer" />
                        </div>
                    </div>
                </section>

                {/* Physical Attributes */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-xs">2</span>
                        Physical Attributes
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Height (e.g. 175cm) <span className="text-red-500">*</span></label>
                            <input {...register("height")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all" placeholder="175cm" />
                            {errors.height && <p className="text-xs text-red-500">{errors.height.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Body Type <span className="text-red-500">*</span></label>
                            <select {...register("body_type")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all bg-white">
                                <option value="">Select body type</option>
                                {bodyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {errors.body_type && <p className="text-xs text-red-500">{errors.body_type.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Hair Color <span className="text-red-500">*</span></label>
                            <select {...register("hair_color")} className="w-full p-2.5 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all bg-white">
                                <option value="">Select hair color</option>
                                {hairColors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.hair_color && <p className="text-xs text-red-500">{errors.hair_color.message}</p>}
                        </div>
                    </div>
                </section>

                {/* Interests & Personality */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs">3</span>
                        About You
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Interests (Max 5) <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {interestsList.map(interest => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleInterest(interest)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm border transition-all",
                                        watchedInterests.includes(interest)
                                            ? "bg-teal text-white border-teal"
                                            : "bg-background border-border hover:border-teal/50 text-text"
                                    )}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                        {errors.interests && <p className="text-xs text-red-500">{errors.interests.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Personality Traits (Select exactly 3) <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {personalityTraits.map(trait => (
                                <button
                                    key={trait}
                                    type="button"
                                    onClick={() => toggleTrait(trait)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm border transition-all",
                                        watchedTraits.includes(trait)
                                            ? "bg-coral text-white border-coral"
                                            : "bg-background border-border hover:border-coral/50 text-text"
                                    )}
                                >
                                    {trait}
                                </button>
                            ))}
                        </div>
                        {errors.personality_traits && <p className="text-xs text-red-500">{errors.personality_traits.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">What are you looking for? <span className="text-red-500">*</span></label>
                        <textarea
                            {...register("looking_for")}
                            className="w-full p-3 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all min-h-[100px]"
                            placeholder="I am looking for someone who..."
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{watch("looking_for")?.length || 0}/200</span>
                            {errors.looking_for && <span className="text-red-500">{errors.looking_for.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Additional Notes</label>
                        <textarea
                            {...register("additional_notes")}
                            className="w-full p-3 rounded-button border border-border focus:border-coral focus:ring-1 focus:ring-coral outline-none transition-all min-h-[80px]"
                            placeholder="Any allergies, special requirements, etc."
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {watch("additional_notes")?.length || 0}/300
                        </div>
                    </div>
                </section>

                {/* Consent */}
                <section className="space-y-4 pt-4 border-t border-border/50">
                    <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" {...register("consent_accurate")} className="mt-1 w-4 h-4 text-coral rounded border-border focus:ring-coral" />
                            <span className="text-sm text-text">I confirm that all information provided above is accurate.</span>
                        </label>
                        {errors.consent_accurate && <p className="text-xs text-red-500 ml-7">{errors.consent_accurate.message}</p>}

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" {...register("consent_terms")} className="mt-1 w-4 h-4 text-coral rounded border-border focus:ring-coral" />
                            <span className="text-sm text-text">I agree to the terms and conditions of the event.</span>
                        </label>
                        {errors.consent_terms && <p className="text-xs text-red-500 ml-7">{errors.consent_terms.message}</p>}

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" {...register("consent_photo")} className="mt-1 w-4 h-4 text-coral rounded border-border focus:ring-coral" />
                            <span className="text-sm text-text">I consent to my photo and profile being shared with other event participants.</span>
                        </label>
                        {errors.consent_photo && <p className="text-xs text-red-500 ml-7">{errors.consent_photo.message}</p>}
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 bg-gradient-to-r from-coral to-coral-hover text-white font-bold rounded-button shadow-lg shadow-coral/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    Complete Registration
                </button>

                {form.formState.errors.root && (
                    <p className="text-center text-red-500">{form.formState.errors.root.message}</p>
                )}

            </form>
        </div>
    );
}
