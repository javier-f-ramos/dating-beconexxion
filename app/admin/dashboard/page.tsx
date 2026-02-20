"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Sparkles, LogOut, Loader2 } from "lucide-react";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { MatchingSystem } from "@/components/admin/MatchingSystem";
import { supabase } from "@/lib/supabase";

const MAX_PARTICIPANTS = 30;

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"registrations" | "matches">("registrations");
    const [counts, setCounts] = useState({ women: 0, men: 0 });
    const [countsLoading, setCountsLoading] = useState(true);

    // Auth check
    useEffect(() => {
        const isAdmin = sessionStorage.getItem("isAdmin");
        if (!isAdmin) {
            router.push("/admin");
        }
    }, [router]);

    // Fetch real counts
    useEffect(() => {
        const fetchCounts = async () => {
            const [{ count: womenCount }, { count: menCount }] = await Promise.all([
                supabase.from("registrations").select("*", { count: "exact", head: true }).eq("gender", "female"),
                supabase.from("registrations").select("*", { count: "exact", head: true }).eq("gender", "male"),
            ]);
            setCounts({ women: womenCount || 0, men: menCount || 0 });
            setCountsLoading(false);
        };

        fetchCounts();

        const channel = supabase
            .channel("dashboard-counts")
            .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, fetchCounts)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("isAdmin");
        router.push("/admin");
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-xl font-bold text-text">Speed Dating Admin</h1>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        {countsLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <span className={counts.women >= MAX_PARTICIPANTS ? "text-red-500 font-bold" : "text-coral"}>
                                    Women: {counts.women}/{MAX_PARTICIPANTS}
                                    {counts.women >= MAX_PARTICIPANTS && " FULL"}
                                </span>
                                <span className="text-border">|</span>
                                <span className={counts.men >= MAX_PARTICIPANTS ? "text-red-500 font-bold" : "text-teal"}>
                                    Men: {counts.men}/{MAX_PARTICIPANTS}
                                    {counts.men >= MAX_PARTICIPANTS && " FULL"}
                                </span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-white p-1 rounded-lg border border-border w-fit mb-8">
                    <button
                        onClick={() => setActiveTab("registrations")}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === "registrations" ? "bg-gray-100 text-text shadow-sm" : "text-muted-foreground hover:bg-gray-50"}
            `}
                    >
                        <Users className="w-4 h-4" />
                        Registrations
                    </button>
                    <button
                        onClick={() => setActiveTab("matches")}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === "matches" ? "bg-gray-100 text-text shadow-sm" : "text-muted-foreground hover:bg-gray-50"}
            `}
                    >
                        <Sparkles className="w-4 h-4" />
                        Matching System
                    </button>
                </div>

                {activeTab === "registrations" ? (
                    <div className="bg-white rounded-card shadow-sm border border-border p-6 md:p-8">
                        <RegistrationsTable />
                    </div>
                ) : (
                    <div className="bg-white rounded-card shadow-sm border border-border p-6 md:p-8">
                        <MatchingSystem />
                    </div>
                )}
            </main>
        </div>
    );
}
