'use client'

import {useEffect, useRef, useState} from "react";
import { setUserRole, banUser, unbanUser, deleteUser, revokeUserSessions } from "@/lib/actions/auth-actions";
import {createPortal} from "react-dom";

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

type UserActionsDropdownProps = {
    user: User;
    isOpen: boolean;
    onToggle: () => void;
    onRoleChange: (userId: string, newRole: 'admin' | 'user') => void;
    onRevokeAllSessions: (userId: string) => void;
    onBanUser: (user: User) => void;
    onUnbanUser: (userId: string) => void;
    onDeleteUser: (userId: string, userName: string) => void;
    isLastRow?: boolean;
};

export default function UserManagement({ users, session_user_id }: { users: User[], session_user_id: string }) {
    const [userList, setUserList] = useState(users);
    const [loading, setLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [banReason, setBanReason] = useState("");
    const [banDuration, setBanDuration] = useState<number>(7); // days
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);


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

    const handleOpenBanModal = (user: User) => {
        setSelectedUser(user);
        setShowBanModal(true);
        setOpenDropdown(null);
    };

    // Filter out current user from the list
    const filteredUsers = userList
        .filter(user => user.id !== session_user_id)
        .filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="p-2">
                <input
                    type="text"
                    placeholder="Search users by email, name, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Username
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Username Column */}
                                    <td className="px-6 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.username || 'N/A'}</div>
                                    </td>

                                    {/* Name Column */}
                                    <td className="px-6 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.name}</div>
                                    </td>

                                    {/* Contact Column */}
                                    <td className="px-6 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>

                                     {/*User ID Column*/}
                                    <td className="px-6 py-2 whitespace-nowrap">
                                        <div className="text-xs text-gray-900 font-mono mt-1">{user.id}</div>
                                    </td>

                                    {/* Role Column */}
                                    <td className="px-6 py-2 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-6 py-2">
                                        {user.banned ? (
                                            <div className="space-y-1">
                                                    <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800 uppercase">
                                                        Banned
                                                    </span>
                                                {user.banReason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        {user.banReason}
                                                    </div>
                                                )}
                                                {user.banExpires && (
                                                    <div className="text-xs text-gray-500">
                                                        Until: {new Date(user.banExpires).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                        )}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                                        {loading === user.id ? (
                                            <div className="flex items-center justify-end gap-2 text-gray-500">
                                                <span className="text-xs">Loading...</span>
                                            </div>
                                        ) : (
                                            <UserActionsDropdown
                                                user={user}
                                                isOpen={openDropdown === user.id}
                                                onToggle={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                onRoleChange={handleRoleChange}
                                                onRevokeAllSessions={handleRevokeAllSessions}
                                                onBanUser={handleOpenBanModal}
                                                onUnbanUser={handleUnbanUser}
                                                onDeleteUser={handleDeleteUser}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Ban User Popup */}
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

function UserActionsDropdown({
                                 user,
                                 isOpen,
                                 onToggle,
                                 onRoleChange,
                                 onRevokeAllSessions,
                                 onBanUser,
                                 onUnbanUser,
                                 onDeleteUser,
                                 isLastRow = false
                             }: UserActionsDropdownProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
        }
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left">
            <button
                ref={buttonRef}
                onClick={onToggle}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2 text-sm"
            >
                Actions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/*Uses React Portal to render the dropdown outside the table's DOM*/}
            {isOpen && buttonRect && createPortal(
                <>
                    <div className="fixed inset-0 z-10" onClick={onToggle} />
                    <div
                        style={{
                            position: 'fixed',
                            top: `${buttonRect.bottom + 8}px`,
                            left: `${buttonRect.right - 192}px`, // 192px = w-48
                        }}
                        className="w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20"
                    >
                        <div className="py-1">
                            {user.role !== 'admin' ? (
                                <button
                                    onClick={() => onRoleChange(user.id, 'admin')}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-600"
                                >
                                    Make Admin
                                </button>
                            ) : (
                                <button
                                    onClick={() => onRoleChange(user.id, 'user')}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                                >
                                    Remove Admin
                                </button>
                            )}

                            <button
                                onClick={() => onRevokeAllSessions(user.id)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-600"
                            >
                                Revoke Sessions
                            </button>

                            {!user.banned ? (
                                <button
                                    onClick={() => onBanUser(user)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 text-orange-600"
                                >
                                    Ban User
                                </button>
                            ) : (
                                <button
                                    onClick={() => onUnbanUser(user.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-600"
                                >
                                    Unban User
                                </button>
                            )}

                            <div className="border-t border-gray-200 my-1"></div>

                            <button
                                onClick={() => onDeleteUser(user.id, user.name)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
