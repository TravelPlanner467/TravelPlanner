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
        <nav className="w-full h-16 border-b border-gray-600 shadow-sm">
            <div className="flex h-full items-center justify-between mx-auto pl-4 pr-1">
                {/* Site Name / Home Button */}
                <div className="perspective-1000">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg
                                   bg-blue-600 shadow-xl
                                   hover:bg-blue-900 hover:shadow-lg hover:scale-[1.1]
                                   transition-all duration-300"
                    >
                        <h1 className="text-xl font-bold text-white">
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
                                    className="group flex h-full items-center gap-2 px-4 py-2
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
                        <ProfileDropdown session={session} />
                    )}
                </div>
            </div>
        </nav>
    );
}
