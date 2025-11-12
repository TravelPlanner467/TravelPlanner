'use client'

import React, {useState, useEffect, useCallback, useRef, useMemo} from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import {XMarkIcon} from "@heroicons/react/24/outline";

import {SelectableRating} from "@/app/(ui)/experience/buttons/star-rating";
import {PlacesAutocomplete} from "@/app/(dev)/dev/components/places-autocomplete";
import {KeywordsAutocomplete} from "@/app/(dev)/dev/components/keywords-autocomplete";
import {useGoogleMaps} from "@/app/(ui)/general/google-maps-provider";
import {createExperience} from "@/lib/actions/experience-actions";
import {Location} from "@/lib/types";

// ============================================================================
// CONFIGS FOR MAP & GOOGLE API
// ============================================================================
const MAP_CONFIG = {
    containerStyle: { width: '100%', height: '350px' },
    defaultCenter: { lat: 44.5618, lng: -123.2823 },
    defaultZoom: 13,
    mapId: "405886d1612720dc9a7aa6a7",
    libraries: ['places', 'marker'],
} as const;
const googleLibraries: ("places" | "marker")[] = ['places', 'marker'];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function roundCoordinate(coord: number, decimals: number = 5): number {
    return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
const isValidLatitude = (lat: number | undefined): lat is number =>
    lat !== undefined && lat >= -90 && lat <= 90;

const isValidLongitude = (lng: number | undefined): lng is number =>
    lng !== undefined && lng >= -180 && lng <= 180;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CreateExperienceGoogle({ user_id }: { user_id: string }) {
    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [experienceDate, setExperienceDate] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [currentKeywordInput, setCurrentKeywordInput] = useState('');
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Location states
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [address, setAddress] = useState('');
    const [mapCenter, setMapCenter] = useState<Location | undefined>(undefined);

    // Search states
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // Map visibility state
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Refs
    const mapRef = useRef<google.maps.Map>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

    // Load Google Maps
    const { isLoaded } = useGoogleMaps();

    // Memoized mapID (under mapOptions) for Google Maps
    const mapOptions = useMemo(() => ({mapId: MAP_CONFIG.mapId}), []);

    // ========================================================================
    // REVERSE GEOCODING - Get Address from Latitude & Longitude
    // ========================================================================
    const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
            );
            const data = await response.json();
            return data.results[0]?.formatted_address || 'Could not find address';
        } catch (error) {
            console.error("Error fetching address:", error);
            return 'Error fetching address';
        }
    }, [apiKey]);

    // =================================================================================================================
    // useEffects
    // =================================================================================================================
    // Reverse geocode when user manually changes coordinates
    useEffect(() => {
        if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return;

        // Fetch Address (debounced)
        const timeoutId = setTimeout(async () => {
            setIsLoadingAddress(true);
            const newAddress = await reverseGeocode(latitude, longitude);
            setAddress(newAddress);
            setIsLoadingAddress(false);
        }, 500);

        return () => clearTimeout(timeoutId);

    }, [latitude, longitude, reverseGeocode]);


    // Load/update marker position
    useEffect(() => {
        if (!mapRef.current || !isLoaded || latitude === undefined || longitude === undefined) {
            return;
        }

        const updateMarker = async () => {
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

            if (!markerRef.current) {
                // Create marker if it doesn't exist
                markerRef.current = new AdvancedMarkerElement({
                    map: mapRef.current,
                    position: { lat: latitude, lng: longitude },
                });
            } else {
                // Update existing marker position
                markerRef.current.position = { lat: latitude, lng: longitude };
            }
        };

        updateMarker();
    }, [latitude, longitude, isLoaded]);

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================
    const updateLocation = useCallback(async (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
        setMapCenter({ lat, lng });
    }, []);

    // Sets Address & Coordinates upon selecting a location
    const handlePlaceSelect = useCallback((location: { latitude: number; longitude: number; address: string } | null) => {
        if (location) {
            setLatitude(location.latitude);
            setLongitude(location.longitude);
            setAddress(location.address);
            setMapCenter({ lat: location.latitude, lng: location.longitude });
        }
    }, []);

    // Load the Google Maps Component
    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    // Change coordinates when user clicks on the map
    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        const latLng = e.latLng;
        if (!latLng) return;

        const lat = roundCoordinate(latLng.lat());
        const lng = roundCoordinate(latLng.lng());
        updateLocation(lat, lng);
    }, [updateLocation]);

    // Change map parameters when coordinates are manually changed
    const handleCoordinateChange = (value: string, type: 'lat' | 'lng') => {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) return;

        if (type === 'lat' && isValidLatitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            setLatitude(rounded);
            setMapCenter({ lat: rounded, lng: longitude ?? 0 });  // Fallback to 0 if undefined
        } else if (type === 'lng' && isValidLongitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            setLongitude(rounded);
            setMapCenter({ lat: latitude ?? 0, lng: rounded });  // Fallback to 0 if undefined
        }
    };

    // Handle keyword input changes for KeywordsAutocomplete component
    const handleKeywordInputChange = (value: string) => {
        setCurrentKeywordInput(value);
    };

    // Check for comma-separated values in keyword input
    // Allows user to add multiple keywords at once
    const parseKeywords = (input: string) => {
        if (!input.trim()) return;
        const newKeywords = input
            .split(',')
            .map(keyword => keyword.trim())
            .filter(keyword => {
                // Only add non-empty, non-duplicate keywords
                const trimmed = keyword.toLowerCase();
                return keyword && !keywords.some(k => k.toLowerCase() === trimmed);
            });

        if (newKeywords.length > 0) {
            setKeywords([...keywords, ...newKeywords]);
            setCurrentKeywordInput(''); // Clear input after adding
        }
    }

    // Handle keyboard events on keyword input
    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            parseKeywords(currentKeywordInput);
        }
    };

    // Handle removing a keyword
    const handleRemoveKeyword = (indexToRemove: number) => {
        setKeywords(keywords.filter((_, index) => index !== indexToRemove));
    };

    // Handle Form Submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate keywords
        if (keywords.length === 0 && !currentKeywordInput.trim()) {
            setIsSubmitting(false);
            return alert('Please add at least one keyword.');
        }

        if (rating <= 0 || rating > 5) {
            setIsSubmitting(false);
            return alert('Please select a rating between 1 and 5.');
        }

        // Validate coordinates
        if (latitude === undefined || longitude === undefined ||
            !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            setIsSubmitting(false);
            return alert('Please enter valid coordinates');
        }

        const finalKeywords = currentKeywordInput.trim()
            ? [...keywords, currentKeywordInput.trim()]
            : keywords;

        const formData = {
            user_id: user_id,
            title: title,
            description: description,
            experience_date: experienceDate,
            latitude: Number(latitude),
            longitude: Number(longitude),
            address: address,
            create_date: new Date().toISOString(),
            user_rating: rating,
            keywords: finalKeywords,
            // images: images || undefined,
            // imageURL: imageURLS,
        };

        // Submit form
        console.log(formData);
        // createExperience(formData);

        // TODO: after submit actions
        setIsSubmitting(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8 max-w-4xl w-full mx-auto p-10
    bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200"
        >
            {/* Form Header */}
            <div className="flex items-center pb-4 gap-3 border-b-2 border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an Experience</h2>
            </div>

            {/* 1ST ROW - Title & Rating */}
            <div className="flex flex-col md:flex-row w-full gap-6 items-start">
                {/* TITLE */}
                <div className="flex flex-col flex-1 gap-2 group">
                    <label htmlFor="title" className="text-sm font-semibold text-gray-700 tracking-wide">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                                   bg-white transition-all duration-200
                                   focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                   hover:border-gray-400 shadow-sm"
                        placeholder="Enter your experience title"
                    />
                </div>

                {/* RATING */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 tracking-wide">
                        Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <SelectableRating experience_rating={rating} onRatingChange={setRating} />
                    </div>
                </div>
            </div>

            {/* 2ND ROW - Description & Date */}
            <div className="flex flex-col md:flex-row w-full gap-6 items-start">
                {/* DESCRIPTION */}
                <div className="flex flex-col flex-1 gap-2">
                    <label htmlFor="description" className="text-sm font-semibold text-gray-700 tracking-wide">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                bg-white transition-all duration-200 resize-none
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                hover:border-gray-400 shadow-sm"
                        placeholder="Share the details of your experience..."
                    />
                </div>

                {/* EXPERIENCE DATE */}
                <div className="flex flex-col gap-2 min-w-[180px]">
                    <label htmlFor="experienceDate" className="text-sm font-semibold text-gray-700 tracking-wide">
                        Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="experienceDate"
                        type="date"
                        value={experienceDate}
                        onChange={(e) => setExperienceDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                bg-white transition-all duration-200
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                hover:border-gray-400 shadow-sm"
                    />
                </div>
            </div>

            {/* LOCATION & MAP SECTION */}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/* Section Header */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-gray-900">Location</h3>
                    <p className="text-sm text-gray-600">
                        Search for a place, use your current location, click the map, or enter coordinates manually
                    </p>
                </div>

                {/* Address Search Bar */}
                <div className="flex flex-col w-full gap-2">
                    <label className="text-sm font-semibold text-gray-700">Address</label>
                    <div className="flex flex-row gap-2 items-stretch">
                        <div className="flex-1">
                            {isLoaded && (
                                <PlacesAutocomplete
                                    onLocationSelect={handlePlaceSelect}
                                    currentAddress={address}
                                    apiKey={apiKey}
                                />
                            )}
                        </div>
                    </div>
                    {isLoadingAddress && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Loading address...
                        </div>
                    )}
                </div>

                {/* COORDINATES */}
                <div className="flex flex-col sm:flex-row w-full gap-3 items-end">
                    {/* LATITUDE */}
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="latitude" className="text-sm font-semibold text-gray-700">
                            Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="latitude"
                            type="number"
                            value={latitude ?? ''}
                            onChange={(e) => handleCoordinateChange(e.target.value, 'lat')}
                            step="0.000001"
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

                    {/* LONGITUDE */}
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="longitude" className="text-sm font-semibold text-gray-700">
                            Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="longitude"
                            type="number"
                            value={longitude ?? ''}
                            onChange={(e) => handleCoordinateChange(e.target.value, 'lng')}
                            step="0.000001"
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

                    {/* Map Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        aria-expanded={isMapExpanded}
                        aria-controls="map-container"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95
                text-white rounded-xl transition-all duration-200 font-semibold
                shadow-md hover:shadow-lg flex items-center justify-center gap-2
                whitespace-nowrap min-h-[48px]"
                    >
                        {isMapExpanded ? (
                            <>
                                <span>▲</span> Hide Map
                            </>
                        ) : (
                            <>
                                <span>▼</span> Show Map
                            </>
                        )}
                    </button>
                </div>

                {/* MAP */}
                <div className={`flex flex-col w-full ${isMapExpanded ? '' : 'h-0'}`}>
                    <div className={`grid transition-all duration-500 ease-in-out ${
                        isMapExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}>
                        <div className="overflow-hidden min-h-0">
                            <div className="h-[350px] w-full border-2 border-gray-300 rounded-xl
                    overflow-hidden shadow-md mt-2">
                                {isMapExpanded && isLoaded && (
                                    <GoogleMap
                                        mapContainerStyle={MAP_CONFIG.containerStyle}
                                        zoom={MAP_CONFIG.defaultZoom}
                                        center={mapCenter || MAP_CONFIG.defaultCenter}
                                        onLoad={handleMapLoad}
                                        onClick={handleMapClick}
                                        options={mapOptions}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KEYWORDS SECTION */}
            <div className="flex flex-col w-full gap-3">
                <label htmlFor="keywords" className="text-sm font-semibold text-gray-700 tracking-wide">
                    Keywords <span className="text-red-500">*</span>
                </label>

                <div onKeyDown={handleKeywordKeyDown}>
                    <KeywordsAutocomplete
                        keywords={currentKeywordInput}
                        setKeywords={handleKeywordInputChange}
                    />
                </div>

                <p className="text-xs text-gray-500 italic">
                    💡 Press Enter to add keywords (comma-separated values supported)
                </p>

                {/* Display added keywords as tags */}
                {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                        {keywords.map((keyword, index) => (
                            <span
                                key={`keyword-${index}`}
                                className="inline-flex items-center gap-2 px-3 py-1.5
                                           text-md font-medium text-white bg-blue-600
                                           rounded-lg shadow-sm"
                            >
                        {keyword}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveKeyword(index)}
                                    className="hover:bg-white/20 rounded-full p-1
                            transition-colors active:scale-90"
                                    aria-label={`Remove ${keyword}`}
                                >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </span>
                        ))}
                    </div>
                )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-4 px-8 py-4 font-bold text-lg rounded-xl 
                            transition-all duration-200 shadow-lg
                            ${isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                        : 'bg-blue-700 hover:to-blue-800 text-white hover:shadow-xl active:scale-95'
                }`}
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Experience...
            </span>
                ) : (
                    'Create Experience'
                )}
            </button>
        </form>

    );
}