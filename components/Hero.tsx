"use client";

import { RegistrationCounter } from "./RegistrationCounter";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_PARTICIPANTS = 30;

export function Hero() {
    const [counts, setCounts] = useState({ women: 0, men: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            const [{ count: womenCount }, { count: menCount }] = await Promise.all([
                supabase.from("registrations").select("*", { count: "exact", head: true }).eq("gender", "female"),
                supabase.from("registrations").select("*", { count: "exact", head: true }).eq("gender", "male"),
            ]);
            setCounts({ women: womenCount || 0, men: menCount || 0 });
        };

        fetchCounts();

        const channel = supabase
            .channel("hero-counts")
            .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, fetchCounts)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const isWomenFull = counts.women >= MAX_PARTICIPANTS;
    const isMenFull = counts.men >= MAX_PARTICIPANTS;

    return (
        <div className="relative overflow-hidden bg-background">
            {/* Decorative blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-coral/10 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-teal/10 rounded-full blur-3xl opacity-60" />

            <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
                <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wide text-coral uppercase bg-coral/10 rounded-full">
                    Upcoming Event
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text mb-6">
                    Find Your Match <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral to-teal">
                        Speed Dating Event
                    </span>
                </h1>

                <p className="max-w-xl text-lg text-muted-foreground mb-8">
                    Meet new people in a fun, safe, and efficient way.
                    <br className="hidden md:block" />
                    Join us for an evening of connection.
                </p>

                {/* Event Details */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-10 text-sm font-medium text-text/80 bg-white/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-coral"></span>
                        <span>Saturday, February 24th</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal"></span>
                        <span>7:00 PM - 10:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span>Greek el Puerto, Estepona</span>
                    </div>
                </div>

                <div className="w-full max-w-sm mb-12">
                    <RegistrationCounter />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link
                        href="/register?gender=female"
                        className={`
              group flex items-center justify-center gap-2 px-8 py-4 rounded-button font-semibold text-white transition-all
              ${isWomenFull ? 'bg-gray-300 cursor-not-allowed pointer-events-none' : 'bg-coral hover:bg-coral-hover shadow-lg shadow-coral/25 hover:shadow-xl hover:-translate-y-0.5'}
            `}
                        aria-disabled={isWomenFull}
                        onClick={(e) => isWomenFull && e.preventDefault()}
                    >
                        {isWomenFull ? "Women — Full" : "Register as Woman"}
                        {!isWomenFull && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    </Link>

                    <Link
                        href="/register?gender=male"
                        className={`
              group flex items-center justify-center gap-2 px-8 py-4 rounded-button font-semibold text-white transition-all
              ${isMenFull ? 'bg-gray-300 cursor-not-allowed pointer-events-none' : 'bg-teal hover:bg-teal-hover shadow-lg shadow-teal/25 hover:shadow-xl hover:-translate-y-0.5'}
            `}
                        aria-disabled={isMenFull}
                        onClick={(e) => isMenFull && e.preventDefault()}
                    >
                        {isMenFull ? "Men — Full" : "Register as Man"}
                        {!isMenFull && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    </Link>
                </div>

                <p className="mt-6 text-xs text-muted-foreground">
                    Limited spots available. Registration closes when full.
                </p>

                <div className="mt-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-coral to-teal bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
                        DON&apos;T MISS OUT ON FINDING LOVE!
                    </h2>
                </div>
            </div>
        </div>
    );
}
