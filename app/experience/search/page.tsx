'use client'

import {Suspense, useEffect, useState} from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Experience {
    id: string | number;
    title: string;
    description: string;
    location: string;
    keywords?: string[];
    imageUrl?: string;
}

function SearchResultContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function searchExperiences() {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // TODO: FETCH DATA AND RETURN RESULTS
                // TODO: USE TEMPORARY JSON FILE UNTIL EXPERIENCES DATA IS READY


            } catch (err) {
                setError('Failed to perform search. Please try again later.');
                console.error('Error searching experiences:', err);
            } finally {
                setLoading(false);
            }
        }
        searchExperiences();
    }, [query]);


    return (
        <main className="flex flex-col p-4 mt-10 gap-8 min-w-fit min-h-fit">
            <div className="flex flex-col w-full text-center items-center">
                <h1 className="text-3xl font-bold mb-2">Search Results</h1>
                <p className="text-gray-600">
                    {query ? `Showing results for "${query}"` : 'Enter a search term to find experiences'}
                </p>
            </div>

            TODO: DISPLAY LIST OF SEARCH RESULTS HERE

            <div className="mt-8 flex justify-center">
                <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResultContent />
        </Suspense>
    );
}