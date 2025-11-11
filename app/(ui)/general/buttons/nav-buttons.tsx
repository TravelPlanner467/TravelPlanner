'use client'

import {NavButtonProps} from "@/lib/types";
import Link from "next/link";
import {useRouter} from "next/navigation";

export function NavButton({link, text, width, height}: NavButtonProps) {
    return (
        <Link href={link}
              className={`w-${width} h-${height} flex justify-center items-center
                  border border-blue-800 shadow-sm rounded-lg
                  hover:shadow-lg hover:scale-[1.01]`}
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
                className={`w-24 h-10 flex justify-center items-center
                border border-blue-800 shadow-sm rounded-lg
                hover:shadow-lg hover:scale-[1.01]`}
        >
            {text}
        </button>
    )
}