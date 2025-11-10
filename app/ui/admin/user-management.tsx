'use client'

import { useState } from "react";
import { setUserRole, banUser, unbanUser, deleteUser, revokeUserSessions } from "@/lib/actions/auth-actions";

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    banned?: boolean;
    banReason?: string | null;
    banExpires?: Date | null;
    username?: string | null;
};

export default function UserManagement({ users, session_user_id }: { users: User[], session_user_id: string }) {
    const [userList, setUserList] = useState(users);
    const [loading, setLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [banReason, setBanReason] = useState("");
    const [banDuration, setBanDuration] = useState<number>(7); // days

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
        setLoading(userId);
        try {
            await setUserRole(userId, newRole);
            setUserList(prev =>
                prev.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update user role');
        } finally {
            setLoading(null);
        }
    };

    const handleBanUser = async () => {
        if (!selectedUser) return;

        setLoading(selectedUser.id);
        try {
            await banUser(selectedUser.id, banReason, banDuration);
            setUserList(prev =>
                prev.map(user =>
                    user.id === selectedUser.id
                        ? {
                            ...user,
                            banned: true,
                            banReason,
                            banExpires: new Date(Date.now() + banDuration * 24 * 60 * 60 * 1000)
                        }
                        : user
                )
            );
            setShowBanModal(false);
            setBanReason("");
            setSelectedUser(null);
        } catch (error) {
            console.error('Failed to ban user:', error);
            alert('Failed to ban user');
        } finally {
            setLoading(null);
        }
    };

    const handleUnbanUser = async (userId: string) => {
        setLoading(userId);
        try {
            await unbanUser(userId);
            setUserList(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, banned: false, banReason: null, banExpires: null }
                        : user
                )
            );
        } catch (error) {
            console.error('Failed to unban user:', error);
            alert('Failed to unban user');
        } finally {
            setLoading(null);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        setLoading(userId);
        try {
            await deleteUser(userId);
            setUserList(prev => prev.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        } finally {
            setLoading(null);
        }
    };

    const handleRevokeAllSessions = async (userId: string) => {
        if (!confirm('Revoke all active sessions for this user? They will need to log in again.')) {
            return;
        }

        setLoading(userId);
        try {
            await revokeUserSessions(userId);
            alert('All sessions revoked successfully');
        } catch (error) {
            console.error('Failed to revoke sessions:', error);
            alert('Failed to revoke sessions');
        } finally {
            setLoading(null);
        }
    };

    // Filter out current user from the list
    const filteredUsers = userList
        .filter(user => user.id !== session_user_id) // Exclude current user
        .filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="space-y-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="flex flex-col gap-3 p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {/*Show User Info & Ban Status*/}
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{user.name}</p>
                                    {user.banned && (
                                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                            BANNED
                                        </span>
                                    )}
                                </div>
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-600">{user.id}</p>
                                {user.banned && user.banReason && (
                                    <p className="text-xs text-red-600 mt-1">Reason: {user.banReason}</p>
                                )}
                                {user.banned && user.banExpires && (
                                    <p className="text-xs text-gray-500">
                                        Expires: {new Date(user.banExpires).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-700'
                            }`}>
                                {user.role}
                            </span>
                        </div>

                        {loading === user.id ? (
                            <div className="flex justify-end">
                                <span className="px-4 py-2 text-gray-500">Loading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {/* Role Management */}
                                {user.role !== 'admin' ? (
                                    <button
                                        onClick={() => handleRoleChange(user.id, 'admin')}
                                        className="w-36 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        Make Admin
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleRoleChange(user.id, 'user')}
                                        className="w-36 px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        Remove Admin
                                    </button>
                                )}

                                {/* Revoke Sessions */}
                                <button
                                    onClick={() => handleRevokeAllSessions(user.id)}
                                    className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition-colors"
                                >
                                    Revoke
                                </button>

                                {/* Ban/Unban */}
                                {!user.banned ? (
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowBanModal(true);
                                        }}
                                        className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
                                    >
                                        Ban
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUnbanUser(user.id)}
                                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                    >
                                        Unban
                                    </button>
                                )}



                                {/* Delete User */}
                                <button
                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Ban User Modal */}
            {showBanModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Ban User: {selectedUser.name}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Ban Reason
                                </label>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows={3}
                                    placeholder="Enter reason for ban..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Ban Duration (days)
                                </label>
                                <input
                                    type="number"
                                    value={banDuration}
                                    onChange={(e) => setBanDuration(Number(e.target.value))}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setShowBanModal(false);
                                        setSelectedUser(null);
                                        setBanReason("");
                                    }}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBanUser}
                                    disabled={!banReason.trim()}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Ban User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
