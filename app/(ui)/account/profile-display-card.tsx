'use client';

import { Session } from "@/lib/types";
import {CheckBadgeIcon, ExclamationCircleIcon} from "@heroicons/react/16/solid";

export default function ProfileDisplayCard({ session }: { session: Session }) {
    const user = session.user;

    return (
        <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="flex-1 space-y-4">
                    {/* Name and Role */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
                            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize whitespace-nowrap">
                            {user.role}
                        </span>
                    </div>

                    {/* Email with Verification Status */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm text-gray-900 truncate">{user.email}</p>
                            {user.emailVerified && (
                                <CheckBadgeIcon
                                    className="w-5 h-5 text-green-500 flex-shrink-0"
                                    title="Email verified"
                                />
                            )}
                        </div>
                    </div>

                    {/* Verification Status Banner */}
                    {!user.emailVerified && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
                            <ExclamationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-amber-900">
                                    Email not verified
                                </p>
                                <p className="text-xs text-amber-700">
                                    Check your inbox for a verification link
                                </p>
                            </div>
                        </div>
                    )}

                    {/* User ID */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">User ID</p>
                        <p className="text-xs text-gray-600 font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-200 break-all">
                            {user.id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
