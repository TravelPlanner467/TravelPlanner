'use client'

import {useRouter} from "next/navigation";

export function EditProfileButton() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push("/account/edit")}
            className="items-center px-3 py-2 border border-gray-300
            text-sm leading-4 font-medium rounded-md"
        >
            Edit Profile
        </button>
    )
}

export function MyExperiencesButton() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push("/account/experiences")}
            className="items-center px-3 py-2 border border-gray-300
            text-sm leading-4 font-medium rounded-md"
        >
            My Experiences
        </button>
    )
}

