"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RegistrationCounterProps {
    className?: string;
}

export function RegistrationCounter({ className }: RegistrationCounterProps) {
    const [counts, setCounts] = useState({ women: 0, men: 0 });
    const [loading, setLoading] = useState(true);

    const MAX_PARTICIPANTS = 100;

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch women count
                const { count: womenCount, error: womenError } = await supabase
                    .from("registrations")
                    .select("*", { count: "exact", head: true })
                    .eq("gender", "female");

                // Fetch men count
                const { count: menCount, error: menError } = await supabase
                    .from("registrations")
                    .select("*", { count: "exact", head: true })
                    .eq("gender", "male");

                if (womenError) console.error("Error fetching women count:", womenError);
                if (menError) console.error("Error fetching men count:", menError);

                setCounts({
                    women: womenCount || 0,
                    men: menCount || 0,
                });
            } catch (error) {
                console.error("Error fetching counts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();

        // Real-time subscription
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'registrations',
                },
                () => {
                    fetchCounts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className={cn("flex flex-col items-center space-y-4 p-6 bg-white rounded-card shadow-sm border border-border/50", className)}>
            <div className="flex items-center space-x-2 text-text/80">
                <Users className="w-5 h-5" />
                <span className="font-medium">Live Registration Status</span>
            </div>

            <div className="flex items-center justify-center w-full space-x-8">
                {/* Women Counter */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="text-4xl font-bold text-coral">
                            {loading ? "-" : counts.women}
                        </div>
                        <div className="text-xs text-muted-foreground absolute -top-3 -right-4 font-mono">
                            /{MAX_PARTICIPANTS}
                        </div>
                    </div>
                    <span className="text-sm font-medium text-text mt-1">Women</span>
                    {counts.women >= MAX_PARTICIPANTS && (
                        <span className="px-2 py-0.5 mt-2 text-[10px] font-bold text-white bg-red-500 rounded-full">
                            FULL
                        </span>
                    )}
                </div>

                <div className="h-10 w-px bg-border"></div>

                {/* Men Counter */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="text-4xl font-bold text-teal">
                            {loading ? "-" : counts.men}
                        </div>
                        <div className="text-xs text-muted-foreground absolute -top-3 -right-4 font-mono">
                            /{MAX_PARTICIPANTS}
                        </div>
                    </div>
                    <span className="text-sm font-medium text-text mt-1">Men</span>
                    {counts.men >= MAX_PARTICIPANTS && (
                        <span className="px-2 py-0.5 mt-2 text-[10px] font-bold text-white bg-red-500 rounded-full">
                            FULL
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
