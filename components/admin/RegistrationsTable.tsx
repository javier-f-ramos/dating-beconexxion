"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Eye, Trash2, X, Loader2 } from "lucide-react";
import { Registration } from "@/types";
import { supabase } from "@/lib/supabase";

export function RegistrationsTable() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "female" | "male">("all");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<Registration | null>(null);

    const fetchRegistrations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching registrations:", error);
        } else {
            setRegistrations(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this registration?")) return;

        // Optimistic update
        setRegistrations(prev => prev.filter(r => r.id !== id));
        if (selectedUser?.id === id) setSelectedUser(null);

        const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete. Please try again.");
            fetchRegistrations(); // Revert
        }
    };

    const filteredData = registrations.filter(user => {
        const matchesFilter = filter === "all" || user.gender === filter;
        const matchesSearch = user.full_name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-text text-white' : 'bg-gray-100 hover:bg-gray-200 text-text'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("female")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'female' ? 'bg-coral text-white' : 'bg-coral/10 hover:bg-coral/20 text-coral'}`}
                    >
                        Women
                    </button>
                    <button
                        onClick={() => setFilter("male")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'male' ? 'bg-teal text-white' : 'bg-teal/10 hover:bg-teal/20 text-teal'}`}
                    >
                        Men
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-button border border-border focus:ring-1 focus:ring-text outline-none text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">Age</th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">City</th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">Registered</th>
                            <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading registrations...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">No registrations found.</td>
                            </tr>
                        ) : (
                            filteredData.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={user.photo_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                                            <div>
                                                <p className="font-medium text-text">{user.full_name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${user.gender === 'female' ? 'bg-coral/10 text-coral' : 'bg-teal/10 text-teal'}`}>
                                                    {user.gender === 'female' ? 'Woman' : 'Man'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-text">{user.age}</td>
                                    <td className="px-4 py-3 text-text">{user.city}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span>{user.email}</span>
                                            <span className="text-xs">{user.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-muted-foreground hover:text-text" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-full text-muted-foreground hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-border p-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-text">Participant Details</h2>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6 mb-8">
                                <img
                                    src={selectedUser.photo_url}
                                    alt={selectedUser.full_name}
                                    className="w-32 h-32 md:w-48 md:h-48 rounded-xl object-cover bg-gray-100 shadow-sm"
                                />
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h3 className="text-2xl font-bold text-text flex items-center gap-2">
                                            {selectedUser.full_name}
                                            <span className={`text-sm px-3 py-1 rounded-full font-medium ${selectedUser.gender === 'female' ? 'bg-coral/10 text-coral' : 'bg-teal/10 text-teal'}`}>
                                                {selectedUser.gender === 'female' ? 'Woman' : 'Man'}
                                            </span>
                                        </h3>
                                        <p className="text-muted-foreground">{selectedUser.age} years old • {selectedUser.city}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-muted-foreground text-xs">Email</span>
                                            <span className="font-medium">{selectedUser.email}</span>
                                        </div>
                                        <div>
                                            <span className="block text-muted-foreground text-xs">Phone</span>
                                            <span className="font-medium">{selectedUser.phone}</span>
                                        </div>
                                        <div>
                                            <span className="block text-muted-foreground text-xs">Occupation</span>
                                            <span className="font-medium">{selectedUser.occupation || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-muted-foreground text-xs">Registered</span>
                                            <span>{format(new Date(selectedUser.created_at), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-text mb-2">Interests</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.interests?.map(i => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-text">{i}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-text mb-2">Personality Traits</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.personality_traits?.map(t => (
                                            <span key={t} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-text border border-gray-200">{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-text mb-1">Looking For</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-border/50">
                                        {selectedUser.looking_for}
                                    </p>
                                </div>

                                {selectedUser.additional_notes && (
                                    <div>
                                        <h4 className="font-semibold text-text mb-1">Additional Notes</h4>
                                        <p className="text-sm text-gray-600">
                                            {selectedUser.additional_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2">
                            <button className="px-4 py-2 bg-white border border-border rounded-button text-sm font-medium hover:bg-gray-50 text-text" onClick={() => setSelectedUser(null)}>
                                Close
                            </button>
                            <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-button text-sm font-medium hover:bg-red-100" onClick={() => handleDelete(selectedUser.id)}>
                                Delete Registration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
