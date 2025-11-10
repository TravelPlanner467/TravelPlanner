'use client'

import { useState } from "react";
import {signInEmail, signInUsername} from "@/lib/actions/auth-actions";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function LoginForm() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [loginType, setLoginType] = useState<'email' | 'username'>('username');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // use auth-actions.ts to login
        try {
            const result = loginType === 'username'
                ? await signInUsername(identifier, password)
                : await signInEmail(identifier, password);

            if (result?.ok === false) {
                setError(result.message || "Login failed");
            } else if (result?.ok === true && result.redirect) {
                router.push(result.redirect);   // Redirect to URL set in auth-actions.ts
                router.refresh();               // Force refresh navbar
            }

        } catch (error) {
            setError(
                error instanceof Error ? error.message : "An error occurred during login"
            );
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="flex flex-col text-center gap-2.5 items-center">
            <form className="flex flex-col w-80 gap-6 p-8
                  bg-white border border-gray-400 shadow-md rounded"
                  onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-3">
                    {/* Toggle Between Email and Username */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setLoginType('username')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                                loginType === 'username'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Username
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType('email')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                                loginType === 'email'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Email
                        </button>
                    </div>

                    {/*Username or Email input*/}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="identifier" className="font-medium text-sm">
                            {loginType === 'email' ? 'email' : 'username'}
                        </label>
                        <input
                            id="identifier"
                            type={loginType === 'email' ? 'email' : 'text'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={loginType === 'email' ? 'email@example.com' : 'Enter your username'}
                            required
                            disabled={loading}
                            autoComplete={loginType === 'email' ? 'email' : 'username'}
                        />
                    </div>
                </div>

                {/*Password*/}
                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="font-medium text-sm">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                        autoComplete="current-password"
                    />
                </div>

                {/*Error Display*/}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/*Submit Button*/}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-md transition-colors"
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>

                {/*Forgot Password?*/}
                <div className="text-sm text-gray-500 mt-2">
                    <Link href="#"
                          className="text-blue-600 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/*Go to signup*/}
                <div className="text-sm text-gray-600 text-center">
                    Don't have an account?{" "}
                    <Link href="/app/account/signup" className="text-blue-600 hover:underline font-medium">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );
}
