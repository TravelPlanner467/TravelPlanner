'use client'

import React, {useState, useEffect, useCallback, useRef, useMemo} from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

import {SelectableRating} from "@/app/(ui)/experience/buttons/star-rating";
import {PlacesAutocomplete} from "@/app/(dev)/dev/components/places-autocomplete";
import {createExperience} from "@/lib/actions/experience-actions";
import {Location} from "@/lib/types";

// ============================================================================
// CONSTANTS
// ============================================================================
const MAP_CONFIG = {
    containerStyle: { width: '100%', height: '350px' },
    defaultCenter: { lat: 44.5618, lng: -123.2823 },
    defaultZoom: 13,
    mapId: "405886d1612720dc9a7aa6a7",
    libraries: ['places', 'marker'],
} as const;
const COORDINATE_PRECISION = 5;
const GEOLOCATION_OPTIONS = {enableHighAccuracy: true, timeout: 5000, maximumAge: 0,} as const;
const googleLibraries: ("places" | "marker")[] = ['places', 'marker'];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function roundCoordinate(coord: number, decimals: number = COORDINATE_PRECISION): number {
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
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: apiKey,
        libraries: googleLibraries,
    });

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

    // Get user's current location
    const handleGetCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Location is not supported by this browser.");
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = roundCoordinate(position.coords.latitude);
                const lng = roundCoordinate(position.coords.longitude);
                updateLocation(lat, lng);
                setIsGettingLocation(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not get your location. Please check your browser permissions.");
                setIsGettingLocation(false);
            },
            GEOLOCATION_OPTIONS
        );
    }, [updateLocation]);

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

    // Add user keywords to an array
    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const keywordsArray = value
            .split(',')
            .map(k => k.trim())
            .filter(k => k !== '');
        setKeywords(keywordsArray);
    };
    // Handle Form Submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate Rating & Keywords
        if (keywords.length === 0) {return alert('Please add at least one keyword.')}
        if (rating <= 0 || rating > 5) {return alert('Please select a rating between 1 and 5.')}

        // Validate coordinates
        if (latitude === undefined || longitude === undefined || !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            setIsSubmitting(false);
            return alert('Please enter valid coordinates');
        }

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
            keywords: keywords,
            // images: images || undefined,
            // imageURL: imageURLS,
        };

        // Submit form
        // createExperience(formData);
        // TODO: after submit actions
        console.log(formData);
        setIsSubmitting(false);
    };

    // === Render Form =================================================================================================
    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 max-w-3xl w-full mx-auto p-8
            bg-white rounded-xl shadow-lg border border-gray-300"
        >
            {/* Form Header */}
            {/*<div className="border-b border-gray-200 pb-4">*/}
            {/*    <h2 className="text-2xl font-bold text-gray-900">Create New Experience</h2>*/}
            {/*    <p className="text-sm text-gray-500 mt-1">Share your travel moments and memories</p>*/}
            {/*</div>*/}

            {/*1ST ROW*/}
            <div className="flex flex-row w-full gap-2 items-start">
                {/*TITLE*/}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="title" className="text-md font-semibold text-gray-800">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-3 rounded-lg border border-gray-300
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter experience title"
                    />
                </div>

                {/*RATING*/}
                <div className="flex flex-col w-1/4 gap-2">
                    <label className="text-md font-semibold text-gray-800">
                        Rating <span className="text-red-500">*</span>
                    </label>
                    <SelectableRating experience_rating={rating} onRatingChange={setRating} />
                </div>
            </div>

            {/*2ND ROW*/}
            <div className="flex flex-row w-full gap-2 items-start">
                {/*DESCRIPTION*/}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="description" className="text-md font-semibold text-gray-800">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full p-3 rounded-lg border border-gray-300
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your experience..."
                    />
                </div>

                {/*EXPERIENCE DATE*/}
                <div className="flex flex-col w-1/4 gap-2">
                    <label htmlFor="experienceDate" className="text-md font-semibold text-gray-800">
                        Experience Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="experienceDate"
                        type="date"
                        value={experienceDate}
                        onChange={(e) => setExperienceDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}  // Only allow past/present dates
                        required
                        className="w-full p-3 rounded-lg border border-gray-300
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/*LOCATION & MAP*/}
            <div className="flex flex-col w-full gap-2 justify-center items-center">
                {/*Title & Instruction*/}
                <div className="flex flex-row w-full justify-center items-center gap-2 mb-2">
                    <h3 className="text-md font-semibold text-gray-800">Location</h3>
                    <p className="text-md text-gray-500">
                        - Search, use current location, click map, or enter coordinates
                    </p>
                </div>

                {/* Address Search Bar */}
                <div className="flex flex-col w-full">
                    {/*ADDRESS BAR*/}
                    <div className="flex flex-row gap-1 items-stretch">
                        {/* PlacesAutocomplete Component */}
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

                    {/*Loading Address...*/}
                    {isLoadingAddress && (
                        <div className="text-sm text-gray-500">Loading address...</div>
                    )}
                </div>

                {/*COORDINATES*/}
                <div className="flex flex-row w-full gap-2 justify-center items-center">
                    {/*LATITUDE*/}
                    <div className="flex flex-row items-center gap-2">
                        <label htmlFor="latitude" className="flex text-sm font-semibold text-gray-800 gap-1">
                            Lat: <span className="text-red-500">*</span>
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
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 [appearance:textfield]
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="-90 to 90"
                        />
                    </div>

                    {/*LONGITUDE*/}
                    <div className="flex flex-row items-center gap-2">
                        <label htmlFor="longitude" className="flex text-sm font-semibold text-gray-800 gap-1">
                            Lng: <span className="text-red-500">*</span>
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
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 [appearance:textfield]
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="-180 to 180"
                        />
                    </div>
                    {/* Map Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        aria-expanded={isMapExpanded}
                        aria-controls="map-container"
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700
                                       rounded-lg transition-colors font-medium
                                       flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        {isMapExpanded ? '▲ Hide Map' : '▼ Show Map'}
                    </button>
                </div>

                {/* ======================ROW 4 - MAP========================= */}
                <div className={`flex flex-col w-full ${isMapExpanded ? '' : 'h-0'}`}>
                    <div className={`grid transition-all duration-500 ease-in-out ${
                        isMapExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}>
                        <div className="overflow-hidden min-h-0">
                            <div className="h-[350px] w-full border border-gray-300 rounded-lg overflow-hidden">
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

            {/* KEYWORDS input */}
            <div className="flex flex-col w-full gap-2">
                <label htmlFor="keywords" className="text-md font-semibold text-gray-800">
                    Keywords <span className="text-red-500">*</span>
                </label>
                <input
                    id="keywords"
                    type="text"
                    onChange={handleKeywordsChange}
                    className="w-full p-3 rounded-lg border border-gray-300
        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter keywords separated by commas"
                    required
                />
            </div>

            {/*SUBMIT BUTTON*/}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-2 px-6 py-3 font-medium rounded-lg transition-colors ${
                    isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {isSubmitting ? 'Creating...' : 'Create Experience'}
            </button>
        </form>
    );
}