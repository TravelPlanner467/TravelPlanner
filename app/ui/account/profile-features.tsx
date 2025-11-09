'use client';

import { signOut } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import { Session } from  "@/lib/types";

export default function ProfileFeatures({ session }: { session: Session }) {
    const router = useRouter();
    const user = session.user;

    const handleSignOut = async () => {
        await signOut();
        router.push("/account/login");
    };

    return (
    <div className="flex flex-col gap-4">

        <div className="text-md text-left">
            <p className="">Display Name: {user.name}</p>
            <p className="">Email: {user.email}</p>
            <p className="">userID: {user.id}</p>
        </div>

        <button
            onClick={handleSignOut}
            className="items-center px-3 py-2 text-md font-medium
            border-2 border-red-700 shadow-md rounded-md
            hover:bg-red-50 transition-colors
            focus:outline-none focus:bg-red-50"
        >
            Sign Out
        </button>
    </div>
  )
}