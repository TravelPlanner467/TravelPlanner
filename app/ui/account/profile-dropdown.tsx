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
                   hover:bg-gray-100 transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Account menu"
            >
                <UserCircleIcon
                    className="w-5 h-5 group-hover:scale-[1.2] transition-transform"
                    aria-hidden="true"
                />
                <p className="hidden md:block">Account</p>
                <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    <div
                        className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg
                       border border-gray-200 py-2 z-20"
                        role="menu"
                        aria-orientation="vertical"
                    >
                        {/*View Profile*/}
                        <Link
                            href="/account/profile"
                            onClick={() => setIsOpen(false)}
                            className="block w-full p-3 text-xs text-gray-600 border-b-2 border-gray-300
                            hover:bg-gray-100 transition-colors
                            focus:outline-none focus:bg-gray-100"
                            role="menuitem"
                        >
                            {session.user.email}
                        </Link>

                        {/*Edit Profile*/}
                        <Link
                            href="/account/edit"
                            onClick={() => setIsOpen(false)}
                            className="block w-full p-3 text-sm text-gray-700
                                       hover:bg-gray-100 transition-colors
                                       focus:outline-none focus:bg-gray-100"
                            role="menuitem"
                        >
                            Edit Profile
                        </Link>

                        {/*Sign Out Button*/}
                        <button
                            onClick={handleSignOut}
                            className="block w-full px-3 py-2 text-left text-sm text-red-600
                                       hover:bg-red-50 transition-colors
                                       focus:outline-none focus:bg-red-50"
                            role="menuitem"
                        >
                            Sign Out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
