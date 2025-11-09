'use client'

import React, {useState, useEffect, useCallback, useRef} from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

import {SelectableRating} from "@/app/ui/experience/buttons/star-rating";
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
const COORDINATE_PRECISION = 6;
const GEOLOCATION_OPTIONS = {enableHighAccuracy: true, timeout: 5000, maximumAge: 0,} as const;
const googleLibraries: ("places" | "marker")[] = ['places', 'marker'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function roundCoordinate(coord: number, decimals: number = COORDINATE_PRECISION): number {
    return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
const isValidLatitude = (lat: number): boolean => lat >= -90 && lat <= 90;
const isValidLongitude = (lng: number): boolean => lng >= -180 && lng <= 180;

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

    // Location states
    const [latitude, setLatitude] = useState<number>(MAP_CONFIG.defaultCenter.lat);
    const [longitude, setLongitude] = useState<number>(MAP_CONFIG.defaultCenter.lng);
    const [address, setAddress] = useState('');
    const [mapCenter, setMapCenter] = useState<Location>(MAP_CONFIG.defaultCenter);

    // Search states
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // Map visibility state
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Refs
    const mapRef = useRef<google.maps.Map>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: apiKey,
        libraries: googleLibraries,
    });

    // ========================================================================
    // GEOCODING FUNCTION
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
        if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            return;
        }

        const fetchAddress = async () => {
            setIsLoadingAddress(true);
            const newAddress = await reverseGeocode(latitude, longitude);
            setAddress(newAddress);
            setIsLoadingAddress(false);
        };

        fetchAddress();
    }, [latitude, longitude, reverseGeocode]);

    // Update marker position
    useEffect(() => {
        if (markerRef.current && isLoaded) {
            markerRef.current.position = { lat: latitude, lng: longitude };
        }
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

        // Dynamically import AdvancedMarkerElement
        google.maps.importLibrary("marker").then(({ AdvancedMarkerElement }: any) => {
            // Create marker only if one doesn't exist
            if (!markerRef.current) {
                markerRef.current = new AdvancedMarkerElement({
                    position: { lat: latitude, lng: longitude },
                    map,
                });
            }
        });
    }, [latitude, longitude]);

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
            setMapCenter({ lat: rounded, lng: longitude });
        } else if (type === 'lng' && isValidLongitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            setLongitude(rounded);
            setMapCenter({ lat: latitude, lng: rounded });
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

        // Validate Rating & Keywords
        if (keywords.length === 0) {return alert('Please add at least one keyword.')}
        if (rating <= 0 || rating > 5) {return alert('Please select a rating between 1 and 5.')}

        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude) || !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
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
    };

    // === Render Form =================================================================================================
    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 max-w-3xl w-full mt-2 p-6
            border border-gray-300 rounded-lg bg-white shadow-md"
        >
            {/*1ST ROW*/}
            <div className="flex flex-row w-full gap-2 justify-center items-start">
                {/*TITLE*/}
                <div className="flex flex-col w-3/4 gap-2">
                    <label htmlFor="title" className="text-sm font-medium">
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
                    <label className="text-sm font-medium">
                        Rating <span className="text-red-500">*</span>
                    </label>
                    <SelectableRating experience_rating={rating} onRatingChange={setRating} />
                    {rating === 0 && (
                        <p className="text-xs text-gray-500">Please select a rating</p>
                    )}
                </div>
            </div>

            {/*2ND ROW*/}
            <div className="flex flex-row w-full gap-2 justify-center items-center">
                {/*DESCRIPTION*/}
                <div className="flex flex-col w-3/4 gap-3">
                    <label htmlFor="description" className="text-sm font-medium">
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
                <div className="flex flex-col w-1/4 gap-3 justify-center items-center">
                    <label htmlFor="experienceDate" className="text-sm font-medium">
                        Experience Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="experienceDate"
                        type="date"
                        value={experienceDate}
                        onChange={(e) => setExperienceDate(e.target.value)}
                        required
                        className="p-2 rounded-lg border border-gray-300
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/*LOCATION & MAP*/}
            <div className="flex flex-col w-full gap-2 justify-center items-center">
                {/*Title & Instruction*/}
                <div className="flex flex-col w-full">
                    {/*TITLE */}
                    <h3 className="px-2 font-medium">Location</h3>

                    {/*INSTRUCTIONS*/}
                    <p className="text-sm text-gray-500 w-full">
                        💡 Search for a location, use your current location, select on the map, or manually enter coordinates
                    </p>
                </div>


                {/*ROW 3 - LOCATION - SEARCH */}
                <div className="flex flex-col w-full">
                    {/*ADDRESS BAR*/}
                    <label htmlFor="address" className="flex flex-row gap-1 px-2">
                        <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={isGettingLocation}
                            className={`p-3 rounded-md transition-colors ${
                                isGettingLocation
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-white hover:bg-gray-100'}`}
                        >
                            📍
                        </button>

                        {/* PlacesAutocomplete Component */}
                        <div className="flex-1">
                            {isLoaded && (
                                <PlacesAutocomplete
                                    onLocationSelect={handlePlaceSelect}
                                    currentAddress={address}
                                />
                            )}
                        </div>

                        {/* Map Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setIsMapExpanded(!isMapExpanded)}
                            className="w-1/5 p-2 bg-blue-100 hover:bg-blue-200 text-blue-700
                               rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            {isMapExpanded ? '▲ Hide Map' : '▼ Show Map'}
                        </button>
                    </label>

                    {/*Loading Address...*/}
                    {isLoadingAddress && (
                        <div className="text-sm text-gray-500">Loading address...</div>
                    )}
                </div>

                {/*ROW 4 - LOCATION - MAP*/}
                <div className={`flex flex-col w-full ${isMapExpanded ? '' : 'h-0'}`}>
                    {/* Map */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isMapExpanded ? 'max-h-[350px] opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="h-[350px] w-full border border-gray-300 rounded-lg overflow-hidden">
                            {isLoaded && (
                                <GoogleMap
                                    mapContainerStyle={MAP_CONFIG.containerStyle}
                                    zoom={MAP_CONFIG.defaultZoom}
                                    center={mapCenter}
                                    onLoad={handleMapLoad}
                                    onClick={handleMapClick}
                                    options={{ mapId: MAP_CONFIG.mapId }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 5 - LOCATION - COORDINATE inputs */}
            <div className="flex flex-row w-full gap-2 justify-center items-center">
                {/*LATITUDE*/}
                <div className="flex flex-col w-2/5">
                    <label htmlFor="latitude" className="text-sm font-medium">
                        Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="latitude"
                        type="number"
                        value={latitude}
                        onChange={(e) => handleCoordinateChange(e.target.value, 'lat')}
                        step="0.000001"
                        min="-90"
                        max="90"
                        required
                        className="w-full p-3 rounded-lg border border-gray-300
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="-90 to 90"
                    />
                </div>

                {/*LONGITUDE*/}
                <div className="flex flex-col w-2/5">
                    <label htmlFor="longitude" className="text-sm font-medium">
                        Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="longitude"
                        type="number"
                        value={longitude}
                        onChange={(e) => handleCoordinateChange(e.target.value, 'lng')}
                        step="0.000001"
                        min="-180"
                        max="180"
                        required
                        className="w-full p-3 rounded-lg border border-gray-300
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="-180 to 180"
                    />
                </div>
            </div>

            {/*KEYWORDS*/}
            <div className="flex flex-col gap-2">
                <label htmlFor="keywords" className="text-sm font-medium">
                    Keywords
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
                className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                font-medium rounded-lg transition-colors"
            >
                Create Experience
            </button>
        </form>
    );
}


// ============================================================================
// PLACES AUTOCOMPLETE COMPONENT
// ============================================================================
interface PlacesAutocompleteProps {
    onLocationSelect: (coords: { latitude: number; longitude: number; address: string } | null) => void;
    currentAddress: string;
}

function PlacesAutocomplete({onLocationSelect, currentAddress}: PlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState(currentAddress);
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // User clicks address box
    const handleFocus = () => {
        setInputValue('');
        setSuggestions([]);
    };

    // Update input when currentAddress changes externally
    useEffect(() => {
        setInputValue(currentAddress);
    }, [currentAddress]);

    const handleInputChange = async (value: string) => {
        setInputValue(value);

        if (!value.trim()) {
            setSuggestions([]);
            setHighlightedIndex(-1);
            return;
        }

        try {
            const { AutocompleteSuggestion } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input: value,
            });

            setSuggestions(suggestions);
            setHighlightedIndex(-1);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    };

    const handleSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
        const placePrediction = suggestion.placePrediction;

        if (!placePrediction) return;

        try {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ['location', 'formattedAddress'] });

            const location = place.location;
            const address = place.formattedAddress || '';

            if (location) {
                setInputValue(address);
                setSuggestions([]);
                setHighlightedIndex(-1);
                onLocationSelect({
                    latitude: roundCoordinate(location.lat()),
                    longitude: roundCoordinate(location.lng()),
                    address: address
                });
            }
        } catch (error) {
            console.error('Error getting place details:', error);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setSuggestions([]);
            setHighlightedIndex(-1);
        }
    };

    // Handle clicking outside the component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setSuggestions([]);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputValue && inputValue !== currentAddress) {
                handleInputChange(inputValue);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue, currentAddress]);

    return (
        <div ref={wrapperRef} className="flex items-center flex-1 gap-2 px-3 py-2 relative">
            <div className="w-full relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={handleFocus}
                    placeholder="Address, city, landmark, region..."
                    className="w-full outline-none text-gray-900 placeholder-gray-400"
                />
                {/*Google Place Autocomplete API Suggestions*/}
                {suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => {
                            const placePrediction = suggestion.placePrediction;
                            if (!placePrediction) return null;

                            return (
                                <li
                                    key={placePrediction.placeId || index}
                                    onClick={() => handleSelect(suggestion)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    <div className="text-gray-900 text-left">
                                        {placePrediction.text?.text || ''}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}