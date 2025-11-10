// app/account/settings/account-settings.tsx
'use client'

import { useState } from "react";
import { updateUsername, changeEmail, changePassword, updateName } from "@/lib/actions/auth-actions";

type User = {
    id: string;
    name: string;
    email: string;
    username?: string;
};

export default function AccountSettings({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Profile states
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username || '');
    const [email, setEmail] = useState(user.email);

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await updateName(name);
            setMessage({
                type: result.ok ? 'success' : 'error',
                text: result.message
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to update name'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await updateUsername(username);
            setMessage({
                type: result.ok ? 'success' : 'error',
                text: result.message
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to update username'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await changeEmail(email);
            setMessage({
                type: result.ok ? 'success' : 'error',
                text: result.message
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to update email'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            setLoading(false);
            return;
        }

        try {
            const result = await changePassword(currentPassword, newPassword);
            setMessage({
                type: result.ok ? 'success' : 'error',
                text: result.message
            });

            if (result.ok) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to change password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-4xl">
            {/* Navigation Tabs */}
            <div className="flex justify-center gap-4 mb-8 border-b border-gray-900 ">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'profile'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'security'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Security
                </button>
            </div>

            {/* Error/Message Display */}
            {message && (
                <div className={`mb-6 p-3 rounded-lg ${
                    message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="flex flex-col w-full items-center gap-6">
                    {/* Display Name */}
                    <form onSubmit={handleUpdateName}
                          className="p-6 rounded-lg border border-gray-400 shadow-md"
                    >
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || name === user.name}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>

                    {/* Username */}
                    <form onSubmit={handleUpdateUsername}
                          className="p-6 rounded-lg border border-gray-400 shadow-md"
                    >
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || username === user.username}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>

                    {/* Email */}
                    <form onSubmit={handleUpdateEmail}
                          className="p-6 rounded-lg border border-gray-400 shadow-md"
                    >
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || email === user.email}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="flex flex-col w-full items-center gap-6">
                    {/* Change Password */}
                    <form onSubmit={handleChangePassword}
                          className="p-6 rounded-lg border border-gray-400 shadow-md"
                    >
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
