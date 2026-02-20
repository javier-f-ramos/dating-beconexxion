"use client";

import { useState } from "react";
import { Download, Sparkles, Loader2 } from "lucide-react";
import { Registration, Match } from "@/types";
import { supabase } from "@/lib/supabase";

// Helper to calculate score
function calculateMatchScore(woman: Registration, man: Registration): Match {
    let score = 0;

    // 1. Age Compatibility (Max 30)
    const ageDiff = Math.abs(woman.age - man.age);
    if (ageDiff <= 3) score += 30;
    else if (ageDiff <= 5) score += 20;
    else if (ageDiff <= 8) score += 10;

    // 2. Shared Interests (Max 40, 8 per interest)
    const sharedInterests = woman.interests.filter(i => man.interests.includes(i));
    score += Math.min(sharedInterests.length * 8, 40);

    // 3. Shared Traits (Max 30, 10 per trait)
    const sharedTraits = woman.personality_traits.filter(t => man.personality_traits.includes(t));
    score += Math.min(sharedTraits.length * 10, 30);

    // Cap at 100
    score = Math.min(score, 100);

    return {
        woman_id: woman.id,
        man_id: man.id,
        score,
        shared_interests: sharedInterests,
        shared_traits: sharedTraits,
        age_gap: ageDiff
    };
}

function exportToCSV(matches: (Match & { woman: Registration; man: Registration })[]) {
    const headers = ["Score", "Woman Name", "Woman Age", "Woman City", "Man Name", "Man Age", "Man City", "Shared Interests", "Shared Traits", "Age Gap"];
    const rows = matches.map(m => [
        `${m.score}%`,
        m.woman.full_name,
        m.woman.age,
        m.woman.city,
        m.man.full_name,
        m.man.age,
        m.man.city,
        m.shared_interests.join(" | "),
        m.shared_traits.join(" | "),
        m.age_gap,
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `speed-dating-matches-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export function MatchingSystem() {
    const [matches, setMatches] = useState<(Match & { woman: Registration, man: Registration })[]>([]);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateMatches = async () => {
        setGenerating(true);
        setError(null);

        try {
            // Fetch all approved registrations from Supabase
            const { data, error: fetchError } = await supabase
                .from("registrations")
                .select("*")
                .eq("status", "approved");

            if (fetchError) throw new Error(fetchError.message);

            const registrations: Registration[] = data || [];
            const women = registrations.filter(r => r.gender === "female");
            const men = registrations.filter(r => r.gender === "male");

            if (women.length === 0 || men.length === 0) {
                setError("Need at least one woman and one man registered to generate matches.");
                return;
            }

            // Calculate all possible matches
            const allMatches: (Match & { woman: Registration; man: Registration })[] = [];
            women.forEach(woman => {
                men.forEach(man => {
                    const match = calculateMatchScore(woman, man);
                    allMatches.push({ ...match, woman, man });
                });
            });

            // Sort by score descending
            allMatches.sort((a, b) => b.score - a.score);
            setMatches(allMatches);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to generate matches. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col items-center justify-center py-10 border-b border-border/50 mb-8">
                <h2 className="text-2xl font-bold text-text mb-4">Match Generation</h2>
                <p className="text-muted-foreground mb-8 text-center max-w-lg">
                    Our algorithm analyzes age compatibility, shared interests, and personality traits to find the best potential connections.
                </p>

                <button
                    onClick={generateMatches}
                    disabled={generating}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-button font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {generating
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Sparkles className="w-5 h-5" />
                    }
                    {generating ? "Calculating Compatibility..." : "Generate Matches"}
                </button>

                {error && (
                    <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-lg">{error}</p>
                )}
            </div>

            {matches.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-text">Top Matches Found ({matches.length})</h3>
                        <button
                            onClick={() => exportToCSV(matches)}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-button text-sm font-medium hover:bg-gray-50 text-text transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {matches.map((match, i) => (
                            <div key={i} className="bg-white rounded-card p-6 border border-border shadow-sm flex flex-col md:flex-row items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    {match.woman.photo_url ? (
                                        <img src={match.woman.photo_url} className="w-16 h-16 rounded-full object-cover border-2 border-coral/20" alt={match.woman.full_name} />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center text-coral font-bold text-xl border-2 border-coral/20">
                                            {match.woman.full_name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-text">{match.woman.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{match.woman.age} • {match.woman.city}</p>
                                        {match.shared_interests.length > 0 && (
                                            <p className="text-xs text-coral mt-0.5">♥ {match.shared_interests.slice(0, 2).join(", ")}{match.shared_interests.length > 2 ? ` +${match.shared_interests.length - 2}` : ""}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center px-8 border-x border-border/50 w-full md:w-auto">
                                    <div className={`text-3xl font-bold ${match.score >= 80 ? 'text-green-500' : match.score >= 60 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                        {match.score}%
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Match Score</span>
                                    {match.age_gap <= 3 && (
                                        <span className="text-xs text-teal mt-1">Age match ✓</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 flex-1 flex-row-reverse md:flex-row">
                                    <div className="text-right md:text-left">
                                        <p className="font-bold text-text">{match.man.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{match.man.age} • {match.man.city}</p>
                                        {match.shared_traits.length > 0 && (
                                            <p className="text-xs text-teal mt-0.5">★ {match.shared_traits.slice(0, 2).join(", ")}{match.shared_traits.length > 2 ? ` +${match.shared_traits.length - 2}` : ""}</p>
                                        )}
                                    </div>
                                    {match.man.photo_url ? (
                                        <img src={match.man.photo_url} className="w-16 h-16 rounded-full object-cover border-2 border-teal/20" alt={match.man.full_name} />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold text-xl border-2 border-teal/20">
                                            {match.man.full_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
