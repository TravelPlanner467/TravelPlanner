'use client'

import { useState } from 'react';
import Link from 'next/link';
import { UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth-actions";
import {Session} from "@/lib/types";


export function ProfileDropdown({ session }: { session: Session }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push("/account/login");
    };

    return (
        <div className="relative h-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex h-full items-center gap-2 px-4 py-2
                           text-gray-700 font-medium text-sm
                           hover:bg-gray-100 transition-all duration-200"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Account menu"
            >
                <UserCircleIcon
                    className="size-6 group-hover:scale-[1.2] transition-transform"
                    aria-hidden="true"
                />
                <p className="hidden md:block">Account</p>
                <ChevronDownIcon
                    className={`hidden md:block w-5 h-5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    <div
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl
                                   border border-gray-400 py-2 z-50"
                        role="menu"
                        aria-orientation="vertical"
                    >
                        {/*View Profile*/}
                        <Link
                            href="/account/profile"
                            onClick={() => setIsOpen(false)}
                            className="block w-full px-5 py-4 text-sm text-gray-600 border-b border-gray-200
                            hover:bg-gray-50 transition-colors
                            focus:outline-none focus:bg-gray-50"
                            role="menuitem"
                        >
                            <div className="font-medium text-gray-900 mb-1">Profile</div>
                            <div className="text-xs truncate">{session.user.email}</div>
                        </Link>

                        {/*Edit Profile*/}
                        <Link
                            href="/account/edit"
                            onClick={() => setIsOpen(false)}
                            className="block w-full px-5 py-3.5 text-base text-gray-700 font-medium
                                       hover:bg-gray-50 hover:text-blue-600
                                       transition-colors
                                       focus:outline-none focus:bg-gray-50"
                            role="menuitem"
                        >
                            Edit Profile
                        </Link>

                        {/*Sign Out Button*/}
                        <button
                            onClick={handleSignOut}
                            className="block w-full px-5 py-3.5 text-left text-base text-red-600 font-medium
                                       hover:bg-red-50 transition-colors
                                       focus:outline-none focus:bg-red-50 rounded-b-xl"
                            role="menuitem"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
