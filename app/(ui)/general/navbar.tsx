'use client'

import Link from 'next/link';
import {BookOpenIcon, UserCircleIcon, FlagIcon, PuzzlePieceIcon} from "@heroicons/react/24/outline";
import {auth} from "@/lib/auth";
import {ProfileDropdown} from "@/app/(ui)/account/profile-dropdown";

type Session = typeof auth.$Infer.Session;

export default function Navbar({ session }: { session: Session | null }) {
    const navLinks = [
        {
            href: "/admin",
            icon: PuzzlePieceIcon,
            label: "Admin Panel",
            showWhen: session?.user.role === 'admin'
        },
        {
            href: "/account/experiences",
            icon: FlagIcon,
            label: "My Experiences",
            showWhen: !!session
        },
        {
            href: "/trips",
            icon: BookOpenIcon,
            label: "Trip Planner",
            showWhen: !!session
        },
        {
            href: "/account/login",
            icon: UserCircleIcon,
            label: "Login",
            showWhen: !session
        }
    ];

    return (
        <nav className="w-full h-16 border-b border-gray-400 shadow-sm select-none sticky top-0 z-50">
            <div className="flex h-full items-center justify-between mx-auto px-1 sm:px-2 md:pl-4 md:pr-1">
                {/* Site Name / Home Button */}
                <div className="flex-shrink-0">
                    <Link
                        href="/"
                        draggable={false}
                        className="relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg

                                   bg-gradient-to-r from-blue-700 to-blue-600
                                   hover:shadow-lg transform hover:scale-110
                                   transition-all duration-200 ease-in-out
                                   overflow-hidden
                                   before:absolute before:inset-0
                                   before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)]
                                   before:bg-[length:250%_250%]
                                   before:bg-[position:200%_0]
                                   before:opacity-0
                                   before:transition-[background-position,opacity]
                                   before:duration-[600ms]
                                   hover:before:opacity-100
                                   hover:before:bg-[position:-100%_0]"
                    >
                        <h1 className="text-lg font-bold text-white tracking-wider relative z-50">
                            Travel Planner
                        </h1>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center h-full">
                    {/* Links from navLinks */}
                    {navLinks.map((link) =>
                            link.showWhen && (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    draggable={false}
                                    className="group flex h-full items-center flex-shrink-0
                                                gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2
                                               text-gray-700 font-medium text-sm
                                               hover:bg-gray-100 transition-all duration-200"
                                >
                                    <link.icon className="w-5 h-5 group-hover:scale-[1.2] transition-transform" />
                                    <span className="hidden md:block">{link.label}</span>
                                </Link>
                            )
                    )}

                    {/* ACCOUNT/PROFILE DROPDOWN MENU */}
                    {session && (
                        <div className="h-full">
                            <ProfileDropdown session={session} />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
