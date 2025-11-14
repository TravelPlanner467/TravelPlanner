'use client'

import { useRouter, useSearchParams } from "next/navigation";
import {FormEvent, useEffect, useState} from "react";
import { useLoadScript } from "@react-google-maps/api";
import Script from "next/script";
import {GooglePlacesAutocomplete} from "@/app/(ui)/general/google-places-autocomplete";
import {KeywordsAutocomplete} from "@/app/(ui)/experience/components/keywords-autocomplete";
import {useGoogleMaps} from "@/app/(ui)/general/google-maps-provider";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function ComboSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');
    const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

    const { isLoaded, loadError } = useGoogleMaps();

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Format URL search parameters
        const params = new URLSearchParams();
        if (keywords.trim()) {
            params.set('keywords', keywords.trim());
        }
        if (location) {
            params.set('latitude', location.latitude.toString());
            params.set('longitude', location.longitude.toString());
        }

        router.push(`/experience/search?${params.toString()}`);
    };

    if (loadError) {
        return (
            <div className="w-full p-8 bg-red-50 rounded-xl border border-red-200">
                <h2 className="text-red-600 font-semibold">Error loading search</h2>
                <p className="text-red-500 text-sm mt-1">{loadError.message}</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center p-8">
                <h2 className="text-gray-600">Loading search...</h2>
            </div>
        );
    }

    return (
        <form onSubmit={handleSearch} className="w-full">
            <div className="flex flex-col md:flex-row items-stretch gap-3 p-3
            bg-white rounded-xl shadow-md border border-gray-400
            hover:shadow-lg duration-200"
            >
                {/* Keywords */}
                <div className="flex-1 min-w-0">
                    <KeywordsAutocomplete
                        keywords={keywords}
                        setKeywords={setKeywords}
                    />
                </div>

                <div className="h-px md:h-auto md:w-px bg-gray-300 my-3 md:my-0" />

                {/* Location */}
                <div className="flex-1 min-w-0">
                    <GooglePlacesAutocomplete
                        onLocationSelect={setLocation}
                        primaryTypes={['(regions)']}
                        apiKey={apiKey}
                    />
                </div>

                {/*Submit Button*/}
                <button
                    type="submit"
                    className="px-3 py-2.5 flex-shrink-0
                               bg-blue-600 text-white font-semibold rounded-lg
                               hover:bg-blue-700 transition-colors duration-200"
                >
                    Search
                </button>
            </div>
        </form>
    );
}