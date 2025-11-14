import React, {useEffect, useRef, useState} from "react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {MapPinIcon} from "@heroicons/react/16/solid";
import {isValidLatitude, isValidLongitude, reverseGeocode, roundCoordinate, Location} from "@/lib/utils/nomatim-utils";
import {InteractiveMap} from "@/app/(ui)/experience/components/leaflet-map";


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

// ============================================================================
// UTILITIES
// ============================================================================
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

// =====================================================================================================================
// MAIN COMPONENT
// =====================================================================================================================
export function FreeAddressSearch({onLocationSelect, initialLocation, mapZoom = 13,}: {
    onLocationSelect: (location: Location) => void;
    initialLocation?: Location;
    mapZoom?: number;
}) {
    const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
    const [results, setResults] = useState<Location[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Current location state
    const [location, setLocation] = useState<Location>(
        initialLocation || {
            lat: 44.5618,
            lng: -123.2823,
            address: ''
        }
    );
    const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({
        lat: location.lat,
        lng: location.lng
    });

    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const lastSearchedQueryRef = useRef<string>('');


    // Auto-search effect when debounced query changes
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchQuery.trim().length < 2) {
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
            setShowResults(searchResults.length > 0);

            setIsSearching(false);
        };

        performSearch();
    }, [debouncedSearchQuery]);

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
            setLocation(newLocation);
            setMapCenter({lat: coords.lat, lng: coords.lng});
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

    const handleSelect = (result: Location) => {
        lastSearchedQueryRef.current = result.address;
        setSearchQuery(result.address);
        setShowResults(false);
        setLocation(result);
        setMapCenter({lat: result.lat, lng: result.lng});
        onLocationSelect(result);
    };

    const handleManualSearch = async () => {
        if (!searchQuery.trim()) return;

        lastSearchedQueryRef.current = searchQuery;
        setIsSearching(true);
        const searchResults = await searchAddress(searchQuery);
        setResults(searchResults);
        setShowResults(true);
        setIsSearching(false);
    };

    // Handle map clicks
    const handleMapClick = async (lat: number, lng: number) => {
        const roundedLat = roundCoordinate(lat);
        const roundedLng = roundCoordinate(lng);

        const address = await reverseGeocode(roundedLat, roundedLng);

        const newLocation = {
            lat: roundedLat,
            lng: roundedLng,
            address
        };

        lastSearchedQueryRef.current = address;
        setSearchQuery(address);
        setLocation(newLocation);
        setMapCenter({lat: roundedLat, lng: roundedLng});
        onLocationSelect(newLocation);
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
            setLocation(newLocation);
            setMapCenter({ lat: rounded, lng: location.lng });
            onLocationSelect(newLocation);
        } else if (type === 'lng' && isValidLongitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            const address = await reverseGeocode(location.lat, rounded);
            const newLocation = { lat: location.lat, lng: rounded, address };

            lastSearchedQueryRef.current = address;
            setSearchQuery(address);
            setLocation(newLocation);
            setMapCenter({ lat: location.lat, lng: rounded });
            onLocationSelect(newLocation);
        }
    };

    return (
        <div className="relative flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative flex items-center">
                <button
                    type="button"
                    onClick={handleGetMyLocation}
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
                <div className="absolute top-full z-20 w-full mt-2 bg-white border-2 border-gray-300
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

            {/* Coordinates Input */}
            <div className="flex flex-col sm:flex-row w-full gap-3 items-end">
                <div className="flex flex-col gap-2 flex-1">
                    <label htmlFor="latitude" className="text-sm font-semibold text-gray-700">
                        Latitude <span className="text-red-500">*</span>
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                            bg-white transition-all duration-200 [appearance:textfield]
                            focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                            hover:border-gray-400 shadow-sm"
                        placeholder="-90 to 90"
                    />
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <label htmlFor="longitude" className="text-sm font-semibold text-gray-700">
                        Longitude <span className="text-red-500">*</span>
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                            bg-white transition-all duration-200 [appearance:textfield]
                            focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                            hover:border-gray-400 shadow-sm"
                        placeholder="-180 to 180"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95
                        text-white rounded-xl transition-all duration-200 font-semibold
                        shadow-md hover:shadow-lg flex items-center justify-center gap-2
                        whitespace-nowrap min-h-[48px]"
                >
                    {isMapExpanded ? <><span>▲</span> Hide Map</> : <><span>▼</span> Show Map</>}
                </button>
            </div>

            {/* Map Section */}
            {isMapExpanded && (
                <div className="h-[350px] w-full border-2 border-gray-300 rounded-xl overflow-hidden shadow-md">
                    <InteractiveMap
                        center={mapCenter}
                        zoom={mapZoom}
                        selectedMarker={
                            isValidLatitude(location.lat) && isValidLongitude(location.lng)
                                ? { lat: location.lat, lng: location.lng }
                                : null
                        }
                        onMapClick={handleMapClick}
                        height="350px"
                    />
                </div>
            )}
        </div>
    );
}