'use client'

import React, {useState, useEffect, useCallback} from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {useDebounce} from "use-debounce";

import {SelectableRating} from "@/app/(ui)/experience/buttons/star-rating";
import {KeywordsAutocomplete} from "@/app/(ui)/general/keywords-autocomplete";
import {FreeAddressSearch} from "@/app/(ui)/experience/create/free-address-search";
import {InteractiveMap} from "@/app/(ui)/experience/create/leaflet-map";
import {reverseGeocode} from "@/lib/utils/nomatim-utils";
import {createExperience} from "@/lib/actions/experience-actions";
import {PhotoFile, usePhotoUpload} from "@/lib/utils/photo-utils";
import {PhotoUpload} from "@/app/(ui)/experience/photo-upload";

// ============================================================================
// MAP CONFIG
// ============================================================================
const MAP_CONFIG = {
    defaultCenter: { lat: 44.5618, lng: -123.2823 },
    defaultZoom: 13,
} as const;

interface LocationState {
    lat: number | undefined;
    lng: number | undefined;
    address: string;
}


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
export default function DegoogledCreatePage({ user_id }: { user_id: string }) {
    // formData States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [experienceDate, setExperienceDate] = useState('');
    const [rating, setRating] = useState(0);
    const [location, setLocation] = useState<LocationState>({
        lat: undefined,
        lng: undefined,
        address: ''
    });
    const [uploadedPhotos, setUploadedPhotos] = useState<PhotoFile[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [currentKeywordInput, setCurrentKeywordInput] = useState('');

    // Loading States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Map & Address States
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedLocation] = useDebounce(location, 1000);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(MAP_CONFIG.defaultCenter);
    const [isMapExpanded, setIsMapExpanded] = useState(false);


    // ========================================================================
    // EFFECTS
    // ========================================================================
    useEffect(() => {
        const {lat, lng} = debouncedLocation;

        if (!isValidLatitude(lat) || !isValidLongitude(lng)) return;

        const fetchAddress = async () => {
            setIsLoadingAddress(true);
            const newAddress = await reverseGeocode(lat, lng);
            setLocation(prev => ({...prev, address: newAddress}));
            setSearchQuery(newAddress); // Update search input with reverse geocoded address
            setIsLoadingAddress(false);
        };

        fetchAddress();
    }, [debouncedLocation.lat, debouncedLocation.lng]);


    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================
    const updateLocation = useCallback((lat: number, lng: number, address?: string) => {
        setLocation(prev => ({
            lat,
            lng,
            address: address !== undefined ? address : prev.address
        }));
        setMapCenter({lat, lng});
    }, []);

    // Update coordinates and map when user selects a location from the address search
    const handleLocationSelect = useCallback((selectedLocation: {
        lat: number;
        lng: number;
        address: string
    }) => {
        setLocation({
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            address: selectedLocation.address
        });
        setMapCenter({
            lat: selectedLocation.lat,
            lng: selectedLocation.lng
        });
    }, []);

    // Update coordinates and map when user clicks on the map
    const handleMapClick = useCallback((lat: number, lng: number) => {
        const roundedLat = roundCoordinate(lat);
        const roundedLng = roundCoordinate(lng);
        updateLocation(roundedLat, roundedLng);
    }, [updateLocation]);

    const handleCoordinateChange = (value: string, type: 'lat' | 'lng') => {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) return;

        if (type === 'lat' && isValidLatitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            setLocation(prev => ({...prev, lat: rounded}));
            setMapCenter({lat: rounded, lng: location.lng ?? 0});
        } else if (type === 'lng' && isValidLongitude(parsed)) {
            const rounded = roundCoordinate(parsed);
            setLocation(prev => ({...prev, lng: rounded}));
            setMapCenter({lat: location.lat ?? 0, lng: rounded});
        }
    };

    const handleGetMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
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
                console.error('Error getting location:', error);
                let errorMessage = 'Unable to retrieve your location';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }

                alert(errorMessage);
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const parseKeywords = (input: string) => {
        if (!input.trim()) return;

        const newKeywords = input
            .split(',')
            .map(keyword => keyword.trim())
            .filter(keyword => {
                const exists = keywords.some(k => k.toLowerCase() === keyword.toLowerCase());
                return keyword && !exists;
            });

        if (newKeywords.length > 0) {
            setKeywords([...keywords, ...newKeywords]);
            setCurrentKeywordInput('');
        }
    }

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            parseKeywords(currentKeywordInput);
        }
    };

    const handleKeywordInputChange = (value: string) => {
        setCurrentKeywordInput(value);
    };

    const handleRemoveKeyword = (indexToRemove: number) => {
        setKeywords(keywords.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate coordinates
        if (!isValidLatitude(location.lat) || !isValidLongitude(location.lng)) {
            setIsSubmitting(false);
            return alert('Please enter valid coordinates');
        }

        // Validate rating
        if (rating <= 0 || rating > 5) {
            setIsSubmitting(false);
            return alert('Please select a rating between 1 and 5.');
        }

        // Validate keywords
        if (keywords.length === 0 && !currentKeywordInput.trim()) {
            setIsSubmitting(false);
            return alert('Please add at least one keyword.');
        }

        const finalKeywords = currentKeywordInput.trim()
            ? [...keywords, currentKeywordInput.trim()]
            : keywords;

        const formData = {
            user_id: user_id,
            title: title,
            description: description,
            experience_date: experienceDate,
            latitude: location.lat,
            longitude: location.lng,
            address: location.address,
            create_date: new Date().toISOString(),
            user_rating: rating,
            keywords: finalKeywords,
            // photos: photos.map(p => p.file),
        };
        console.log(formData);

        // Submit form
        createExperience(formData);
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
            {/*======================================================================================================*/}
            {/* ========================================= TRIP INFO  =============================================== */}
            {/*======================================================================================================*/}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Trip Information</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Share your experience with others
                    </p>
                </div>

                {/*Title & Rating*/}
                <div className="flex flex-col md:flex-row w-full gap-6 items-start">
                    {/*Title*/}
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

                    {/*Rating*/}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 tracking-wide">
                            Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="px-3 py-2 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <SelectableRating experience_rating={rating} onRatingChange={setRating}/>
                        </div>
                    </div>
                </div>

                {/* Description & Date */}
                <div className="flex flex-col md:flex-row w-full gap-6 items-start">
                    {/*Description*/}
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
                                bg-white transition-all duration-200 resize-y
                                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                hover:border-gray-400 shadow-sm"
                            placeholder="Share the details of your experience..."
                        />
                    </div>

                    {/*Date*/}
                    <div className="flex flex-col gap-2 min-w-[180px]">
                        <label htmlFor="experienceDate" className="text-sm font-semibold text-gray-700 tracking-wide">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="experienceDate"
                            type="date"
                            value={experienceDate}
                            onChange={(e) => setExperienceDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}  // Max date == today
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                            bg-white transition-all duration-200
                            focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                            hover:border-gray-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/*======================================================================================================*/}
            {/* =========================================== LOCATION  ============================================== */}
            {/*======================================================================================================*/}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/*Section Header*/}
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Location</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Search for a place, click the map, enter coordinates, or use your current location
                    </p>
                </div>

                {/* Address Search */}
                <div className="flex flex-col w-full gap-2">
                    <label className="text-sm font-semibold text-gray-700">Address</label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <FreeAddressSearch
                                onLocationSelect={handleLocationSelect}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                onGetMyLocation={handleGetMyLocation}
                                isGettingLocation={isGettingLocation}
                            />
                        </div>
                    </div>
                    {isLoadingAddress && (
                        <p className="flex items-center gap-2 text-sm text-blue-600">
                            Loading address...
                        </p>
                    )}
                </div>

                {/* COORDINATES */}
                <div className="flex flex-col sm:flex-row w-full gap-3 items-end">
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="latitude" className="text-sm font-semibold text-gray-700">
                            Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="latitude"
                            type="number"
                            value={location.lat ?? ''}
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
                            value={location.lng ?? ''}
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
                                {isMapExpanded && (
                                    <InteractiveMap
                                        center={mapCenter}
                                        zoom={MAP_CONFIG.defaultZoom}
                                        markerPosition={
                                            isValidLatitude(location.lat) && isValidLongitude(location.lng)
                                                ? { lat: location.lat, lng: location.lng }
                                                : null
                                        }
                                        onMapClick={handleMapClick}
                                        height="350px"
                                        className="mt-2"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*======================================================================================================*/}
            {/*=========================================== PHOTOS ===================================================*/}
            {/*======================================================================================================*/}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/* Section Header */}
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Photos</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Upload up to 10 photos of your experience (max 5MB each)
                    </p>
                </div>
                <PhotoUpload
                    maxPhotos={10}
                    maxFileSizeMB={5}
                    onPhotosChange={setUploadedPhotos}
                />
            </div>

            {/*======================================================================================================*/}
            {/*============================================ KEYWORDS ================================================*/}
            {/*======================================================================================================*/}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/*Section Header*/}
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Keywords</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Press Enter to add keywords (comma-separated values supported)
                    </p>
                </div>

                <div onKeyDown={handleKeywordKeyDown}>
                    <KeywordsAutocomplete
                        keywords={currentKeywordInput}
                        setKeywords={handleKeywordInputChange}
                    />
                </div>

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
                                    <XMarkIcon className="w-4 h-4"/>
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
                    <p className="flex items-center justify-center gap-3">
                        Creating Experience...
                    </p>
                ) : (
                    'Create Experience'
                )}
            </button>
        </form>
    )
}