'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type NameIdMap = Record<string, number>;

export default function SearchBar() {
    const [data, setData] = useState<NameIdMap>({});
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length === 0) {
            setSuggestions([]);
            return;
        }

        const matches = Object.keys(data).filter(name =>
            name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(matches.slice(0, 10));
    };

    const handleSelect = (name: string) => {
        const experienceID = data[name];
        if (experienceID) {
            // Navigate to market page with the selected item ID
            router.push(`/experience?id=${experienceID}`);
        }
    };

    return (
        <div className="flex justify-center  max-w-[900px] min-w-[500px]  my-12">
            {/*SEARCH BAR*/}
            <input
                className="w-full rounded-md border-gray-300 focus:ring-1 focus:ring-gray-800"
                type="text"
                placeholder="Search For Experience..."
                value={query}
                onChange={handleChange}
            />
            {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1
                            bg-white border border-gray-300 rounded-lg shadow-lg
                            z-10 max-h-48 overflow-y-auto"
                >
                    {suggestions.map(name => (
                        <li
                            key={name}
                            onClick={() => handleSelect(name)}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}