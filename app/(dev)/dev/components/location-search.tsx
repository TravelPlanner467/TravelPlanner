'use client'
import React, {useEffect, useRef, useState} from "react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {MapPinIcon} from "@heroicons/react/16/solid";
import {
    isValidLatitude,
    isValidLongitude,
    reverseGeocode,
    roundCoordinate,
    Location,
    NOMINATIM_CONFIG
} from "@/lib/utils/nomatim-utils";

interface LocationSearchProps {
    onLocationSelect: (location: Location) => void;
    location: Location;
    onMapClick?: (lat: number, lng: number) => void;
}

// ============================================================================
// UTILITIES
// ============================================================================
let lastRequestTime = 0;

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
const searchAddress = async (query: string): Promise<Array<Location>> => {
    // Calculate time since last request to comply with Nominatim rate limiting
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
            limit: '8',
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

// =====================================================================================================================
// MAIN COMPONENT
// =====================================================================================================================
export function LocationSearch({onLocationSelect, location, onMapClick}: LocationSearchProps) {
    const [searchQuery, setSearchQuery] = useState(location.address || '');
    const [results, setResults] = useState<Location[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 1000);
    // Tracks last searched query to prevent duplicate searches when user clicks on a suggestion
    const lastSearchedQueryRef = useRef<string>('');
    // Tracks if user is clicked in the search container
    const searchContainerRef = useRef<HTMLDivElement>(null);
    // Track previous location to detect coordinate changes
    const prevLocationRef = useRef<Location>(location);

    // Sync search query with location when it changes via the map
    useEffect(() => {
        const newAddress = location.address || '';

        if (newAddress !== searchQuery) {
            setSearchQuery(newAddress);
            lastSearchedQueryRef.current = newAddress;
        }
    }, [location.address, searchQuery]);

    // Handle reverse geocoding when coordinates change but address is empty
    useEffect(() => {
        const performReverseGeocode = async () => {
            const prev = prevLocationRef.current;
            const curr = location;

            // Validate that coordinates are valid numbers before proceeding
            if (typeof curr.lat !== 'number' || typeof curr.lng !== 'number' ||
                isNaN(curr.lat) || isNaN(curr.lng)) {
                return;
            }

            // Check if coordinates are within valid ranges
            if (!isValidLatitude(curr.lat) || !isValidLongitude(curr.lng)) {
                return;
            }

            // Check if coordinates changed
            const coordsChanged = prev.lat !== curr.lat || prev.lng !== curr.lng;

            // Check if address is empty, null, or whitespace
            const addressEmpty = !curr.address || curr.address.trim() === '';

            // Reverse geocode if coordinates changed AND address is empty
            if (coordsChanged && addressEmpty) {
                const address = await reverseGeocode(curr.lat, curr.lng);

                // Update refs BEFORE calling onLocationSelect to prevent loops
                lastSearchedQueryRef.current = address;
                prevLocationRef.current = { ...curr, address };

                setSearchQuery(address);

                const newLocation = {
                    lat: curr.lat,
                    lng: curr.lng,
                    address,
                };

                onLocationSelect(newLocation);
            } else {
                prevLocationRef.current = curr;
            }
        };

        performReverseGeocode();
    }, [location.lat, location.lng, location.address, onLocationSelect]);

    // Close suggestions dropdown when clicking outside it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setIsInputFocused(false);
            }
        };

        // Add event listener when dropdown is shown
        if (showResults) {document.addEventListener('mousedown', handleClickOutside);}

        // Cleanup event listener when dropdown is hidden
        return () => {document.removeEventListener('mousedown', handleClickOutside);};
    }, [showResults]);

    // Auto-search effect when debounced query changes
    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
                setResults([]);
                setShowResults(false);
                lastSearchedQueryRef.current = '';
                return;
            }

            // Skip search if current query is the same as the previous one
            if (debouncedSearchQuery === lastSearchedQueryRef.current) {
                return;
            }

            lastSearchedQueryRef.current = debouncedSearchQuery;
            setIsSearching(true);

            const searchResults = await searchAddress(debouncedSearchQuery);
            setResults(searchResults);

            // Only show results if input is currently focused
            if (isInputFocused && searchResults.length > 0) {
                setShowResults(true);
            }

            setIsSearching(false);
        };

        performSearch();
    }, [debouncedSearchQuery, isInputFocused]);

    // Reverse Geocoding on Map Click
    useEffect(() => {
        if (onMapClick) {
            // Reverse Geocode handler
            const handleMapClickWithGeocode = async (lat: number, lng: number) => {
                const address = await reverseGeocode(lat, lng);
                onLocationSelect({lat, lng, address});
            };

            // Store it so parent can call it
            (window as any).__handleMapClick = handleMapClickWithGeocode;
        }
    }, [onMapClick, onLocationSelect]);

    // Handle "Get My Location" button
    const handleGetMyLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsGettingLocation(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const coords = {
                lat: roundCoordinate(position.coords.latitude),
                lng: roundCoordinate(position.coords.longitude),
            };

            const address = await reverseGeocode(coords.lat, coords.lng);

            const newLocation = {
                ...coords,
                address,
            };

            lastSearchedQueryRef.current = address;
            setSearchQuery(address);
            onLocationSelect(newLocation);
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location. Please check your browser permissions.');
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);
        if (results.length > 0 && searchQuery.trim().length >= 2) {
            setShowResults(true);
        }
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    const handleSelect = (result: Location) => {
        lastSearchedQueryRef.current = result.address;
        setSearchQuery(result.address);
        setShowResults(false);
        setIsInputFocused(false);
        onLocationSelect(result);
    };

    const handleManualSearch = async () => {
        if (!searchQuery.trim()) return;

        lastSearchedQueryRef.current = searchQuery;
        setIsSearching(true);
        const searchResults = await searchAddress(searchQuery);
        setResults(searchResults);

        if (isInputFocused) {
            setShowResults(searchResults.length > 0);
        }

        setIsSearching(false);
    };


    // Handle coordinate input changes
    const handleCoordinateChange = async (value: string, type: 'lat' | 'lng') => {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) return;

        if (type === 'lat' && isValidLatitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            const address = await reverseGeocode(rounded, location.lng);
            const newLocation = { lat: rounded, lng: location.lng, address };

            lastSearchedQueryRef.current = address;
            setSearchQuery(address);
            setShowResults(false);
            setIsInputFocused(false);
            onLocationSelect(newLocation);

        } else if (type === 'lng' && isValidLongitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            const address = await reverseGeocode(location.lat, rounded);
            const newLocation = { lat: location.lat, lng: rounded, address };

            lastSearchedQueryRef.current = address;
            setSearchQuery(address);
            setShowResults(false);
            setIsInputFocused(false);
            onLocationSelect(newLocation);
        }
    };

    return (
        <div className="relative flex flex-col h-full p-4 gap-4">
            {/*=============Search Section==============*/}
            <div className="relative flex flex-col gap-4 items-center justify-center
                            sm:flex-row"
            >
                {/* Search Bar */}
                <div className="relative flex w-1/2 items-center
                                sm:flex-1 sm:min-w-48"
                     ref={searchContainerRef}
                >
                    {/* Get My Location */}
                    <button
                        type="button"
                        onClick={handleGetMyLocation}
                        disabled={isGettingLocation}
                        className="group absolute left-2 z-10 p-2 rounded-lg text-white shadow-sm
                                bg-green-600 hover:bg-green-700
                                disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title="Get my location"
                    >
                        {isGettingLocation ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <MapPinIcon className="w-5 h-5" />
                        )}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2
                                         bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap
                                         opacity-0 transition-opacity
                                         group-hover:opacity-100 pointer-events-none">
                            Get my location
                        </span>
                    </button>

                    {/* Search input */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                        placeholder="Search address or use current location..."
                        className="w-full py-3 pl-14 pr-14 rounded-xl border-2 border-gray-300 bg-white shadow-sm
                                   hover:border-gray-400 transition
                                   focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    />

                    {/* Search Button */}
                    <button
                        type="button"
                        onClick={handleManualSearch}
                        disabled={isSearching}
                        className="group absolute right-2 p-2 rounded-lg text-white shadow-sm
                                   bg-blue-600 hover:bg-blue-700
                                   disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title="Search address"
                    >
                        {isSearching ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        )}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2
                                         bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap
                                         opacity-0 transition-opacity
                                         group-hover:opacity-100 pointer-events-none"
                        >
                          Search
                        </span>
                    </button>

                    {/*=============Search Results Dropdown==============*/}
                    {showResults && results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-60
                                        bg-white border-2 border-gray-300 rounded-xl shadow-lg
                                        overflow-y-auto"
                        >
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(result);
                                    }}
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

                {/*============= Coordinates Input ==============*/}
                <div className="flex gap-2">
                    <div className="relative flex gap-2 justify-center items-center">
                        <label htmlFor="latitude"
                               className="flex text-lg font-semibold text-gray-700">
                            Lat: <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="latitude"
                            type="number"
                            value={location.lat}
                            onChange={(e) => handleCoordinateChange(e.target.value, 'lat')}
                            step="0.0000001"
                            min="-90"
                            max="90"
                            required
                            className="w-32 px-4 py-3 rounded-xl border-2 border-gray-300
                                      bg-white transition-all duration-200 [appearance:textfield]
                                      focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                      hover:border-gray-400 shadow-sm"
                            placeholder="-90 to 90"
                        />
                    </div>

                    <div className="flex gap-2 justify-center items-center">
                        <label htmlFor="longitude"
                               className="flex text-lg font-semibold text-gray-700">
                            Lng: <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="longitude"
                            type="number"
                            value={location.lng}
                            onChange={(e) => handleCoordinateChange(e.target.value, 'lng')}
                            step="0.0000001"
                            min="-180"
                            max="180"
                            required
                            className="w-32 px-4 py-3 rounded-xl border-2 border-gray-300
                                      bg-white transition-all duration-200 [appearance:textfield]
                                      focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                      hover:border-gray-400 shadow-sm"
                            placeholder="-180 to 180"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}