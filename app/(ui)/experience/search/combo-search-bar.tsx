'use client'

import { useRouter, useSearchParams } from "next/navigation";
import {FormEvent, useEffect, useState} from "react";
import { useLoadScript } from "@react-google-maps/api";
import Script from "next/script";
import {PlacesAutocomplete} from "@/app/(dev)/dev/components/places-autocomplete";
import {KeywordsAutocomplete} from "@/app/(dev)/dev/components/keywords-autocomplete";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function ComboSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');
    const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    // Check if Google Maps is already loaded every 100ms
    useEffect(() => {
        const checkGoogleMaps = () => {
            if (typeof window !== 'undefined' && window.google?.maps) {
                setIsLoaded(true);
                return true;
            }
            return false;
        };

        if (!checkGoogleMaps()) {
            const interval = setInterval(() => {
                if (checkGoogleMaps()) {
                    clearInterval(interval);
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, []);

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

    return (
        <div className="w-full">
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
                strategy="afterInteractive"
            />

            {!isLoaded ? (
                <div className="flex items-center justify-center p-8">
                    <h2 className="text-gray-600">Loading search...</h2>
                </div>
            ) : (
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
                            <PlacesAutocomplete
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
            )}
        </div>
    );
}