'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Navigate to results
        router.push(`/experience/search?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div className="relative w-full max-w-[900px] min-w-[500px]">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    className="w-full p-4 pl-12 rounded-lg border border-gray-300 shadow-sm focus:ring-2"
                    type="text"
                    placeholder="Search for experiences..."
                    value={query}
                    onChange={handleChange}
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform
                -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2
                    bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    disabled={!query.trim()}
                >
                    Search
                </button>
            </form>
        </div>
    );
}