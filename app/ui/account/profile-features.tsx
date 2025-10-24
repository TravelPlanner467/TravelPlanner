'use client';

import { signOut } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import { Session } from  "@/lib/types";
import {EditProfileButton, MyExperiencesButton} from "@/app/ui/account/buttons/profile-buttons";
import {router} from "next/client";


export default function ProfileFeatures({ session }: { session: Session | null }) {
    const router = useRouter();
    // @ts-ignore
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

        <EditProfileButton/>
        <MyExperiencesButton/>

        <button
            onClick={handleSignOut}
            className=" items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md"
        >
            Sign Out
        </button>

    </div>
  )
}