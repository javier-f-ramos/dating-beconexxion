"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Sparkles, LogOut } from "lucide-react";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { MatchingSystem } from "@/components/admin/MatchingSystem";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"registrations" | "matches">("registrations");

    // Basic auth check
    useEffect(() => {
        const isAdmin = sessionStorage.getItem("isAdmin");
        if (!isAdmin) {
            // Allow development access for now if needed, or enforce.
            // router.push("/admin");
        }
    }, [router]);

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
                        <span className="text-coral">Women: 12/30</span>
                        <span className="text-border">|</span>
                        <span className="text-teal">Men: 15/30</span>
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
