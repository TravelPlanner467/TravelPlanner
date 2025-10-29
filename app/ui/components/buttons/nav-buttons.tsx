'use client'

import {ReturnButtonProps} from "@/lib/types";
import Link from "next/link";
import {useRouter} from "next/navigation";

export function NavButton({link, text}: ReturnButtonProps) {
    return (
        <Link href={link}
              className="bg-white rounded-lg px-3 text-sm border border-gray-200
                    transition-all hover:shadow-lg hover:scale-[1.01]"
        >
            {text}
        </Link>
    )
}

export function GoBackButton({ text }: { text: string }) {
    const router = useRouter();

    function handleClick() {
        router.back()
    }

    return (
        <button onClick={handleClick}
                className="w-[200px] px-6 py-2
                            text-center
                            border border-blue-800 shadow-sm rounded-lg
                            hover:shadow-lg hover:scale-[1.01]"
        >
            Return to {text}
        </button>
    )
}