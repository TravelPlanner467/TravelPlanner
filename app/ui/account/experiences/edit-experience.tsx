'use client'

import React, { useState, useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import {createExperience} from "@/lib/actions/experience-actions";
import { LatLng } from "leaflet";
import 'leaflet/dist/leaflet.css';
import {StarRating} from "@/app/ui/experience/star-rating";
import {NominatimResult, MapClickHandlerProps, ChangeMapViewProps, EditExperienceProps} from '@/lib/types'
import Link from "next/link";


// HELPER COMPONENT: Handles map clicks
function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

// HELPER COMPONENT: Changes map view when 'center' prop changes
function ChangeMapView({ center }: ChangeMapViewProps) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function EditExperience({ userID, experience }: EditExperienceProps) {
    if ("error" in experience) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        TODO: Create "No Experience Found" component
                    </h1>
                    <Link
                        href={`/public`}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Return to Home (TODO)
                    </Link>
                </div>
            </div>
        );
    }

    // formData
    const [title, setTitle] = useState(experience.title);
    const [description, setDescription] = useState(experience.description);
    const [images, setImages] = useState([] as any);
    // const [imageURLS, setImageURLs] = useState(experience.imageURLs);
    const [experienceDate, setExperienceDate] = useState(experience.experience_date);
    const [keywords, setKeywords] = useState(experience.keywords);
    const [rating, setRating] = useState(experience.rating);

    // Location State
    const [latitude, setLatitude] = useState<number | string>(experience.latitude);
    const [longitude, setLongitude] = useState<number | string>(experience.longitude);
    const [mapCenter, setMapCenter] = useState<[number, number]>([experience.latitude, experience.longitude]);
    const [address, setAddress] = useState(experience.address);

    // Search State
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAddressFocused, setIsAddressFocused] = useState(false);

    // Loading States
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // UTILITY: Round coordinates to specified decimal places (default 6 = ~0.11m accuracy)
    const roundCoordinate = (coord: number, decimals: number = 6): number => {
        return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    // Helper to get numeric coordinates for map display
    const getNumericCoordinates = (): [number, number] => {
        const lat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude));
        const lng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude));

        // Return valid coordinates or fallback to center
        if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng];
        }
        return mapCenter;
    };

    // Debounce address search
    useEffect(() => {
        const handler = setTimeout(() => {
            if (address.trim() && !isLoadingAddress && isAddressFocused) {
                fetchForwardGeocode(address);
            } else if (!isAddressFocused) {
                setSearchResults([]);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [address, isLoadingAddress, isAddressFocused]);

    // create and set image URL
    // useEffect(() => {
    //     if (images.length < 1) return;
    //     const newImageUrls: any = [];
    //     images.forEach((image:any) => newImageUrls.push(URL.createObjectURL(image)));
    //     setImageURLs(newImageUrls);
    // }, [images]);

    // Fetch address from coordinates (Reverse Geocoding)
    const fetchReverseGeocode = async (lat: number, lon: number) => {
        setIsLoadingAddress(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }

            const data = await response.json();
            setAddress(data.display_name || 'Could not find address');
            setSearchResults([]); // Clear search results when getting address from coordinates
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddress('Error fetching address');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Fetch coordinates/suggestions from address string (Forward Geocoding)
    const fetchForwardGeocode = async (query: string) => {
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // --- EVENT HANDLERS ---

    // User uploads a photo
    function onImageChange(e: any) {
        setImages([...e.target.files]);
    }

    // User clicked "Use My Current Location"
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = roundCoordinate(position.coords.latitude);
                const lon = roundCoordinate(position.coords.longitude);

                setLatitude(lat);
                setLongitude(lon);
                setMapCenter([lat, lon]);
                fetchReverseGeocode(lat, lon);
                setIsGettingLocation(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not get your location. Please enter it manually or check your browser permissions.");
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    // User clicked on the map
    const handleMapClick = (latlng: LatLng) => {
        const lat = roundCoordinate(latlng.lat);
        const lng = roundCoordinate(latlng.lng);

        setLatitude(lat);
        setLongitude(lng);
        fetchReverseGeocode(lat, lng);
    };

    // User clicked on a search suggestion
    const handleSuggestionClick = (result: NominatimResult) => {
        const lat = roundCoordinate(parseFloat(result.lat));
        const lon = roundCoordinate(parseFloat(result.lon));

        setLatitude(lat);
        setLongitude(lon);
        setAddress(result.display_name);
        setMapCenter([lat, lon]);

        // Clear search results and remove focus after selection
        setSearchResults([]);
        setIsAddressFocused(false);
    };

    const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // handling for missing Latitude
        if (value === '' || value === '-') {
            setLatitude('');
            return;
        }

        const parsed = parseFloat(value);

        // validate latitude before setting
        if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
            const rounded = roundCoordinate(parsed);
            setLatitude(rounded);
            const currentLng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude));
            if (!isNaN(currentLng)) {
                setMapCenter([rounded, currentLng]);
            }
        }
    };

    const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '' || value === '-') {
            setLongitude('');
            return;
        }

        const parsed = parseFloat(value);

        if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
            const rounded = roundCoordinate(parsed);
            setLongitude(rounded);
            const currentLat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude));
            if (!isNaN(currentLat)) {
                setMapCenter([currentLat, rounded]);
            }
        }
    };

    // Update address when coordinates change manually
    useEffect(() => {
        const lat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude));
        const lon = typeof longitude === 'number' ? longitude : parseFloat(String(longitude));

        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            const timeoutId = setTimeout(() => {
                fetchReverseGeocode(lat, lon);
            }, 1000); // Debounce address lookup

            return () => clearTimeout(timeoutId);
        }
    }, [latitude, longitude]);

    // Handle focus events for address input
    const handleAddressFocus = () => {
        setIsAddressFocused(true);
        // Only trigger search if there is text in the box
        if (address.trim()) {
            fetchForwardGeocode(address);
        }
    };

    const handleAddressBlur = () => {
        // Delay blur
        setTimeout(() => {
            setIsAddressFocused(false);
        }, 200);
    };

    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.trim() === '') {
            setKeywords([]);
        } else {
            const keywordsArray = value
                .split(',')
                .map(k => k.trim())
                .filter(k => k !== '');
            setKeywords(keywordsArray);
        }
    };

    // Form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate coordinates
        const lat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude));
        const lon = typeof longitude === 'number' ? longitude : parseFloat(String(longitude));

        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            alert('Please enter valid coordinates');
            return;
        }

        const editDate = new Date().toISOString();
        const coordinates = {latitude: lat, longitude: lon};

        const formData = {
            userID: userID,
            title: title,
            description: description,
            experience_date: experienceDate,
            latitude: lat,
            longitude: lon,
            address: address,
            // images: images || undefined,
            // imageURL: imageURLS,
            create_date: editDate,
            rating: rating,
            keywords: keywords
        };

        console.log(formData);
        createExperience(formData);

    };

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
                    <StarRating rating={rating} setRating={setRating} />
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

            {/*3RD ROW*/}
            <div className="flex flex-row w-full gap-2 justify-center items-center">
                {/*LOCATION inputs*/}
                <div className="p-2 flex flex-col w-3/4 gap-2
                                border border-gray-300 rounded-lg "
                >
                    <div className="px-2 font-medium">Location</div>

                    {/* Combined Address Search with Autocomplete */}
                    <div className="relative">
                        <label htmlFor="address" className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleGetCurrentLocation}
                                    disabled={isGettingLocation}
                                    className={`px-4 py-2.5 rounded-md font-medium text-white 
                                                transition-colors ${
                                        isGettingLocation
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-white hover:bg-gray-100'}`}
                                >
                                    📍
                                </button>
                                <input
                                    id="address"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    onFocus={handleAddressFocus}
                                    onBlur={handleAddressBlur}
                                    placeholder="Search for a location or address"
                                    className={`flex-1 p-3 rounded-lg border border-gray-300 
                                                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                                ${isLoadingAddress ? 'bg-gray-50' : ''}`}
                                />

                            </div>
                        </label>
                        {isLoadingAddress && (
                            <div className="text-sm text-gray-500">Loading address...</div>
                        )}

                        {/* Search Results Dropdown - Only shown when the field is focused */}
                        {isAddressFocused && (searchResults.length > 0 || isSearching) && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 border-t-0
                                           rounded-b-lg shadow-lg max-h-48 overflow-y-auto"
                            >
                                {isSearching ? (
                                    <li className="p-3 text-gray-500 text-center">
                                        Searching...
                                    </li>
                                ) : (
                                    searchResults.map((result) => (
                                        <li
                                            key={result.place_id}
                                            onClick={() => handleSuggestionClick(result)}
                                            className="p-3 border-b border-gray-100 text-gray-700
                                        cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            📍 {result.display_name}
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Map */}
                    <div className="h-[350px] w-full border border-gray-300 rounded-lg overflow-hidden">
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            className="h-full w-full"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={getNumericCoordinates()} />
                            <MapClickHandler onMapClick={handleMapClick} />
                            <ChangeMapView center={mapCenter} />
                        </MapContainer>
                    </div>
                </div>

                {/* COORDINATE inputs */}
                <div className="flex flex-col w-1/4 h-full gap-4 justify-center items-center">
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="latitude" className="text-sm font-medium">
                            Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="latitude"
                            type="number"
                            value={latitude}
                            onChange={handleLatitudeChange}
                            step="0.000001"
                            min="-90"
                            max="90"
                            required
                            className="w-full p-3 rounded-lg border border-gray-300
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="-90 to 90"
                        />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="longitude" className="text-sm font-medium">
                            Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="longitude"
                            type="number"
                            value={longitude}
                            onChange={handleLongitudeChange}
                            step="0.000001"
                            min="-180"
                            max="180"
                            required
                            className="w-full p-3 rounded-lg border border-gray-300
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="-180 to 180"
                        />
                    </div>


                    <p className="text-sm text-gray-500 mt-3">
                        💡 Click on the map, search for a location, use your current location, or enter coordinates
                    </p>
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
                />
            </div>

            {/*UPLOAD IMAGE*/}
            <div className="flex flex-col gap-2">
                <label htmlFor="keywords" className="text-sm font-medium">
                    Photos
                </label>
                <div>
                    <input
                        type="file"
                        multiple accept="image/*"
                        onChange={onImageChange}
                    />
                    {images.map((imageSrc: string, index: number) => (
                        <img key={index} src={imageSrc} alt="not found" width={"250px"} />
                    ))}
                </div>

            </div>



            {/*SUBMIT*/}
            <button
                type="submit"
                className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                font-medium rounded-lg transition-colors"
            >
                Submit Changes
            </button>
        </form>
    );
}
