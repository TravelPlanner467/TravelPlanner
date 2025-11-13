import React, {useEffect, useRef, useState} from "react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {MapPinIcon} from "@heroicons/react/16/solid";

// ============================================================================
// NOMINATIM CONFIGURATION
// ============================================================================
const NOMINATIM_CONFIG = {
    baseUrl: 'https://nominatim.openstreetmap.org/reverse',
    searchUrl: 'https://nominatim.openstreetmap.org/search',
    userAgent: 'YourTravelApp/1.0',
    referer: typeof window !== 'undefined' ? window.location.origin : '',
    minRequestInterval: 1000, // Rate Limit Value (1 second)
} as const;

let lastRequestTime = 0;

// Debounce Address Searches
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Forward geocoding (search address)
const searchAddress = async (query: string): Promise<Array<{lat: number, lng: number, address: string}>> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < NOMINATIM_CONFIG.minRequestInterval) {
        await new Promise(resolve =>
            setTimeout(resolve, NOMINATIM_CONFIG.minRequestInterval - timeSinceLastRequest)
        );
    }
    lastRequestTime = Date.now();

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '5',
        });

        const response = await fetch(
            `${NOMINATIM_CONFIG.searchUrl}?${params.toString()}`,
            {
                headers: {
                    'User-Agent': NOMINATIM_CONFIG.userAgent,
                    'Referer': NOMINATIM_CONFIG.referer,
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        return data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: item.display_name,
        }));
    } catch (error) {
        console.error("Error searching address:", error);
        return [];
    }
};

// Address search component
export function FreeAddressSearch({onLocationSelect, searchQuery, setSearchQuery, onGetMyLocation, isGettingLocation
}: {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onGetMyLocation: () => void;
    isGettingLocation: boolean;
}) {
    const [results, setResults] = useState<Array<{lat: number, lng: number, address: string}>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounce the search query with 500ms delay
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Ref to track if we should search (to avoid searching on programmatic updates)
    const shouldSearchRef = useRef(true);

    // Auto-search effect when debounced query changes
    useEffect(() => {
        const performSearch = async () => {
            // Only search if query has at least 2 characters and shouldSearch is true
            if (debouncedSearchQuery.trim().length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            if (!shouldSearchRef.current) {
                shouldSearchRef.current = true;
                return;
            }

            setIsSearching(true);
            const searchResults = await searchAddress(debouncedSearchQuery);
            setResults(searchResults);
            setShowResults(searchResults.length > 0);
            setIsSearching(false);
        };

        performSearch();
    }, [debouncedSearchQuery]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        shouldSearchRef.current = true;
    };

    const handleSelect = (result: { lat: number; lng: number; address: string }) => {
        shouldSearchRef.current = false; // Prevent search on programmatic update
        onLocationSelect(result);
        setSearchQuery(result.address);
        setShowResults(false);
    };

    const handleManualSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        const searchResults = await searchAddress(searchQuery);
        setResults(searchResults);
        setShowResults(true);
        setIsSearching(false);
    };

    return (
        <div className="relative">
            {/* Search Bar */}
            <div className="relative flex items-center">
                {/* Get Location Button */}
                <button
                    type="button"
                    onClick={onGetMyLocation}
                    disabled={isGettingLocation}
                    className="absolute left-2 z-10 p-2 bg-green-600 hover:bg-green-700 text-white
                        rounded-lg transition-all duration-200 shadow-sm
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                        flex items-center justify-center group"
                    title="Get my location"
                >
                    {isGettingLocation ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <MapPinIcon className="w-5 h-5" />
                    )}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2
                        bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap
                        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Get my location
                    </span>
                </button>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                    placeholder="Search address or use current location..."
                    className="w-full pl-14 pr-14 py-3 rounded-xl border-2 border-gray-300
                        bg-white transition-all duration-200
                        focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                        hover:border-gray-400 shadow-sm"
                />

                {/* Search Button */}
                <button
                    type="button"
                    onClick={handleManualSearch}
                    disabled={isSearching}
                    className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white
                        rounded-lg transition-all duration-200 shadow-sm
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                        flex items-center justify-center group"
                    title="Search address"
                >
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    )}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2
                        bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap
                        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Search
                    </span>
                </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300
                    rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {results.map((result, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(result)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50
                                transition-colors border-b border-gray-200 last:border-b-0
                                flex items-start gap-3"
                        >
                            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{result.address}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}