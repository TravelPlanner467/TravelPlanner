'use client'

import { useState } from "react";
import {signUp} from "@/lib/actions/auth-actions";
import Link from "next/link";

export default function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signUp(email, password, name, username);
            if (result?.ok === false) {
                setError(result.message ?? "An error occurred during signup");
            }
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "An error occurred during signup"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full text-center gap-2.5 items-center">
            <form className="flex flex-col gap-6 w-80 bg-white shadow-md p-8 rounded" onSubmit={handleSubmit}>
                {/*Name*/}
                <div className="flex flex-col gap-3">
                    <label htmlFor="name" className="font-medium text-left">Name</label>
                    <input
                        id="name"
                        type="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="First & Last Name"
                        required
                        disabled={loading}
                    />
                </div>

                {/*Email*/}
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
                        disabled={loading}
                    />
                </div>

                {/*Username*/}
                <div className="flex flex-col gap-3">
                    <label htmlFor="username" className="font-medium text-left">Username</label>
                    <input
                        id="username"
                        type="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Choose a username"
                        required
                        disabled={loading}
                    />
                </div>

                {/*Password*/}
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
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="py-2 mt-2 bg-blue-600 text-white font-bold rounded
                               hover:bg-blue-700 transition-colors"
                >
                    {loading ? "Signing up..." : "Create Account"}
                </button>

                {/*Error Display*/}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="text-sm text-gray-500 mt-2">
                    Already have an account?{" "}
                    <Link href="/account/login" className="text-blue-600 underline font-medium">
                        Log in
                    </Link>
                </div>
            </form>
        </div>
    );
}
