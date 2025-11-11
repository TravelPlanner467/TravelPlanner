'use client';

import { Session } from "@/lib/types";

export default function ProfileDisplayCard({ session }: { session: Session }) {
    const user = session.user;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Name - spans both columns */}
                    <div className="col-span-2">
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>

                    {/* Email */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <p className="text-sm text-gray-900">{user.email}</p>
                    </div>

                    {/* Role */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Role</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {user.role}
                        </span>
                    </div>

                    {/* User ID */}
                    <div className="col-span-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">User ID</p>
                        <p className="text-xs text-gray-600 font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                            {user.id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
