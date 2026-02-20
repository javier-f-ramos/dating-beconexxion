"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123") {
            // In a real app, set a cookie or token
            // For MVP, just redirect and maybe store in localStorage or context (insecure but fits requirements)
            if (typeof window !== "undefined") {
                sessionStorage.setItem("isAdmin", "true");
            }
            router.push("/admin/dashboard");
        } else {
            setError("Invalid password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-card shadow-lg border border-border">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center text-coral mb-3">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-text">Admin Access</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-3 rounded-button border border-border focus:ring-1 focus:ring-coral focus:border-coral outline-none"
                            placeholder="Enter admin password"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 bg-text text-white font-semibold rounded-button hover:bg-black transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
