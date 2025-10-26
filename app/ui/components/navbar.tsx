'use client'

import Link from 'next/link';
import {BookOpenIcon, UserCircleIcon, FlagIcon} from "@heroicons/react/24/outline";
import {auth} from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <div className="flex flex-row w-full h-[55px] bg-gray-50 ">
      <Link
        className="flex h-auto justify-center items-center bg-gray-500"
        href="/"
      >
          <p className="w-40 text-center text-xl text-white">
              Travel Planner
          </p>
      </Link>

      <div className="flex grow flex-row justify-end md:flex-row">
          {session && (
              <Link
                  key="My Experiences"
                  href="/account/experiences"
                  className="flex  items-center justify-center gap-2  p-3 text-sm font-medium hover:bg-gray-300 md:flex-none md:justify-start md:p-2 md:px-3"
              >
                  <FlagIcon className="w-6" />
                  <p className="hidden md:block">My Experiences</p>
              </Link>
          )}

          {session && (
              <Link
                  key="Trip Planner"
                  href="/trips"
                  className="flex  items-center justify-center gap-2  p-3 text-sm font-medium hover:bg-gray-300 md:flex-none md:justify-start md:p-2 md:px-3"
              >
                  <BookOpenIcon className="w-6" />
                  <p className="hidden md:block">Trip Planner</p>
              </Link>
          )}

          {session && (
              <Link
                  key="profile"
                  href="/account/profile"
                  className="flex  items-center justify-center gap-2  p-3 text-sm font-medium hover:bg-gray-300 md:flex-none md:justify-start md:p-2 md:px-3"
              >
                  <UserCircleIcon className="w-6" />
                  <p className="hidden md:block">User Profile</p>
              </Link>
          )}
          {!session && (
              <Link
                  key="Login"
                  href="/account/login"
                  className="flex  items-center justify-center gap-2  p-3 text-sm font-medium hover:bg-gray-300 md:flex-none md:justify-start md:p-2 md:px-3"
              >
                  <UserCircleIcon className="w-6" />
                  <p className="hidden md:block">Login</p>
              </Link>
          )}


      </div>
    </div>
  );
}
