'use client'

import { useState } from "react";
import {signIn} from "@/lib/actions/auth-actions";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn(email, password);
            if (!result.user) {
                setError("Invalid email or password");
            }

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
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mt-2 transition-colors"
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                <div className="text-sm text-gray-500 mt-2">
                    <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                    Don't have an account? <a href="/account/signup" className="text-blue-600 hover:underline">Sign up</a>
                </div>
            </form>
        </div>
    );
}
