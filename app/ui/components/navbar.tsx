'use client'

import Link from 'next/link';
import {BookOpenIcon, UserCircleIcon, PlusCircleIcon} from "@heroicons/react/24/outline";
import {auth} from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <div className="flex flex-row w-full h-[55px] bg-gray-50 ">
      <Link
        className="flex h-auto items-center bg-gray-500"
        href="/public"
      >
        <div className="w-40 pr-2 text-right text-white text-xl">
          <p>Travel Planner</p>
        </div>
      </Link>

      <div className="flex grow flex-row justify-end md:flex-row">
          {session && (
              <Link
                  key="New Experience"
                  href="/experience/create"
                  className="flex  items-center justify-center gap-2  p-3 text-sm font-medium hover:bg-gray-300 md:flex-none md:justify-start md:p-2 md:px-3"
              >
                  <PlusCircleIcon className="w-6" />
                  <p className="hidden md:block">New Experience</p>
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
