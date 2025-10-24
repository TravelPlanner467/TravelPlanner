'use client'

import { useState } from "react";
import {signUp} from "@/lib/actions/auth-actions";

export default function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signUp(email, password, displayName);
            if (result?.ok === false) setError(result.message);

        } catch (error) {
            setError(
                `Authentication error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full text-center gap-2.5 items-center">
            <form className="flex flex-col gap-6 w-80 bg-white shadow-md p-8 rounded" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3">
                    <label htmlFor="displayname" className="font-medium text-left">Display Name</label>
                    <input
                        id="displayName"
                        type="displayName"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Choose a Display Name"
                        required
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <label htmlFor="email" className="font-medium text-left">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <label htmlFor="password" className="font-medium text-left">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Select a password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mt-2 transition-colors"
                >
                    {loading ? "Signing up..." : "Create Account"}
                </button>
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                <div className="text-sm text-gray-500 mt-2">
                    Already have an account? <a href="/account/login" className="text-blue-600 hover:underline">Log in now</a>
                </div>
            </form>
        </div>
    );
}
