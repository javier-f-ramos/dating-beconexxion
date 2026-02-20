"use client";

import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { Registration, Match } from "@/types";

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

export function MatchingSystem() {
    const [matches, setMatches] = useState<(Match & { woman: Registration, man: Registration })[]>([]);
    const [generating, setGenerating] = useState(false);

    // Mock data again (ideally passed as props or fetched in a real app context)
    const generateMatches = () => {
        setGenerating(true);

        // Simulate processing
        setTimeout(() => {
            // Mock users for generation
            const women: Registration[] = [
                {
                    id: "1", full_name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 555-0101", age: 28, gender: "female",
                    interests: ["Art & Culture", "Photography", "Travel & Adventure"],
                    personality_traits: ["Creative", "Outgoing", "Compassionate"],
                    status: "approved", created_at: "", looking_for: "", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", city: "NY",
                    occupation: "Designer"
                },
            ];
            const men: Registration[] = [
                {
                    id: "2", full_name: "Michael Chen", email: "michael@example.com", phone: "+1 555-0102", age: 30, gender: "male",
                    interests: ["Technology", "Gaming", "Photography"], // Shares Photography
                    personality_traits: ["Intellectual", "Calm", "Reliable"],
                    status: "approved", created_at: "", looking_for: "", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", city: "NY",
                    occupation: "Dev"
                }
            ];

            const allMatches: (Match & { woman: Registration, man: Registration })[] = [];

            women.forEach(woman => {
                men.forEach(man => {
                    const match = calculateMatchScore(woman, man);
                    allMatches.push({
                        ...match,
                        woman,
                        man
                    });
                });
            });

            // Sort by score
            allMatches.sort((a, b) => b.score - a.score);

            setMatches(allMatches);
            setGenerating(false);
        }, 1500);
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
                    <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                    {generating ? "Calculating Compatibility..." : "Generate Matches"}
                </button>
            </div>

            {matches.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-text">Top Matches Found ({matches.length})</h3>
                        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-button text-sm font-medium hover:bg-gray-50 text-text">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {matches.map((match, i) => (
                            <div key={i} className="bg-white rounded-card p-6 border border-border shadow-sm flex flex-col md:flex-row items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <img src={match.woman.photo_url} className="w-16 h-16 rounded-full object-cover border-2 border-coral/20" alt="Woman" />
                                    <div>
                                        <p className="font-bold text-text">{match.woman.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{match.woman.age} • {match.woman.city}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center px-8 border-x border-border/50 w-full md:w-auto">
                                    <div className={`text-3xl font-bold ${match.score >= 80 ? 'text-green-500' : match.score >= 60 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                        {match.score}%
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Match Score</span>
                                </div>

                                <div className="flex items-center gap-4 flex-1 flex-row-reverse md:flex-row">
                                    <div className="text-right md:text-left">
                                        <p className="font-bold text-text">{match.man.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{match.man.age} • {match.man.city}</p>
                                    </div>
                                    <img src={match.man.photo_url} className="w-16 h-16 rounded-full object-cover border-2 border-teal/20" alt="Man" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
