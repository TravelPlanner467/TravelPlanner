'use client'

import Link from "next/link";
import {useSearchParams} from "next/navigation";

export default function ExperienceDetailsPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    return (
        <main className="flex flex-col p-4 mt-10 gap-8 min-w-fit min-h-fit">
            <div className="flex flex-col w-full text-center items-center">
                <h1 className="text-3xl font-bold mb-2">Experience</h1>
                <p className="text-gray-600">
                    {query ? `Showing results for "${query}"` : 'Enter a search term to find experiences'}
                </p>
            </div>

            TODO: DISPLAY DETAILS ABOUT SELECTED EXPERIENCE

            <div className="mt-8 flex justify-center">
                <Link href="/"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Back to Search (TODO)
                </Link>
            </div>
        </main>
    )
}