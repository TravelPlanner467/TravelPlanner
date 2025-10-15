'use client'

import {Suspense, useEffect, useState} from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {SearchResults} from "@/app/ui/search/search-results";

export interface Experience {
    id: string;
    title: string;
    create_date: string;
    experience_date: string;
    description: string;
    userID: string;
    address: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    keywords: string[];
    photos: string[];
}

function SearchResultContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    // const [results, setResults] = useState<Experience[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     async function searchExperiences() {
    //         if (!query) {
    //             setResults([]);
    //             setLoading(false);
    //             return;
    //         }
    //
    //         try {
    //             setLoading(true);
    //
    //             // TODO: FETCH DATA AND RETURN RESULTS
    //             // TODO: USE TEMPORARY JSON FILE UNTIL EXPERIENCES DATA IS READY
    //
    //
    //         } catch (err) {
    //             setError('Failed to perform search. Please try again later.');
    //             console.error('Error searching experiences:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     searchExperiences();
    // }, [query]);


    return (
        <main className="flex flex-col min-w-fit min-h-fit">
            <SearchResults query={query} />
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