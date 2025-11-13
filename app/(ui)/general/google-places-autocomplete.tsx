import React, {useEffect, useMemo, useRef, useState} from "react";
import {MapPinIcon} from "@heroicons/react/16/solid";

interface PlacesAutocompleteProps {
    onLocationSelect: (coords: { latitude: number; longitude: number; address: string } | null) => void;
    currentAddress?: string;
    primaryTypes?: string[];  // Array of strings, optional
    apiKey: string
}

// HELPER FUNCTION
function roundCoordinate(coord: number, decimals: number = 6): number {
    return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function GooglePlacesAutocomplete({onLocationSelect, currentAddress, primaryTypes, apiKey}: PlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState(currentAddress);
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Session Token for API use minimization
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const getOrCreateSessionToken = () => {
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        }
        return sessionTokenRef.current;
    };
    const resetSessionToken = () => {
        sessionTokenRef.current = null;
    };

    // Geocode Cache to store data for minimizing API usage
    const geocodeCache = useRef<Map<string, string>>(new Map());

    // Reverse geocode coordinates to address (checks cache first)
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;

        // Check cache
        if (geocodeCache.current.has(key)) {
            return geocodeCache.current.get(key)!;
        }

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
            );
            const data = await response.json();
            const address = data.results[0]?.formatted_address || 'Could not find address';

            // Cache the result
            geocodeCache.current.set(key, address);
            return address;
        } catch (error) {
            console.error("Error fetching address:", error);
            return 'Error fetching address';
        }
    };


    // Get user's current location
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Location is not supported by this browser.");
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = roundCoordinate(position.coords.latitude);
                const lng = roundCoordinate(position.coords.longitude);

                // Get address from coordinates
                const address = await reverseGeocode(lat, lng);

                setInputValue(address);
                setSuggestions([]);
                onLocationSelect({
                    latitude: lat,
                    longitude: lng,
                    address: address
                });
                setIsGettingLocation(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not get your location. Please check your browser permissions.");
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    // User clicks address box
    const handleFocus = () => {
        if (inputValue === currentAddress) {
            setInputValue('');
        }
        setSuggestions([]);
        getOrCreateSessionToken();
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
            // Get session token
            const token = getOrCreateSessionToken();
            // Create request object
            const request: any = {
                input: value,
                sessionToken: token,
                ...(primaryTypes && primaryTypes.length > 0 && { includedPrimaryTypes: primaryTypes }),
            };

            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

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
                resetSessionToken();
            }
        } catch (error) {
            console.error('Error getting place details:', error);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSelect(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setSuggestions([]);
                setHighlightedIndex(-1);
                resetSessionToken();
                break;
        }
    };

    // Handle clicking outside the component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setSuggestions([]);
                setHighlightedIndex(-1);
                // Reset token if user clicks away
                if (suggestions.length > 0) {
                    resetSessionToken();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [suggestions.length]);

    // Debounce input change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputValue && inputValue !== currentAddress) {
                handleInputChange(inputValue);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue, currentAddress]);

    return (
        <div ref={wrapperRef} className="relative">
            <div className="flex items-center h-full w-full
                    border border-gray-300 rounded-lg bg-white
                    focus-within:ring-1 focus-within:ring-blue-500
                    transition-all duration-200"
            >
                {/* Current Location Button */}
                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    aria-label="Use my current location"
                    className={`px-3 py-2.5 flex-shrink-0 
                                transition-colors duration-200
                       border-r border-gray-300 ${
                        isGettingLocation
                            ? 'bg-gray-50 cursor-not-allowed'
                            : 'hover:bg-gray-50'
                    }`}
                >
                    <MapPinIcon className={`w-5 h-5 ${
                        isGettingLocation
                            ? 'text-gray-400 animate-pulse'
                            : 'text-blue-600'
                    }`} />
                </button>

                {/* Search Input */}
                <input
                    type="text"
                    value={inputValue ?? ''}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder="Address, city, landmark, region..."
                    className="flex-1 px-3 py-2.5
                       text-md text-gray-700 placeholder-gray-400
                       bg-transparent border-0 rounded-r-lg
                       focus:outline-none focus:ring-0"
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore
                    data-form-type="other"
                />
            </div>

            {/* Suggestions List */}
            {suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto
                       bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => {
                        const placePrediction = suggestion.placePrediction;
                        if (!placePrediction) return null;
                        return (
                            <li
                                key={placePrediction.placeId || index}
                                onClick={() => handleSelect(suggestion)}
                                className={`px-4 py-2 cursor-pointer text-left text-sm transition-colors duration-150 ${
                                    index === highlightedIndex
                                        ? 'bg-blue-50 text-blue-900'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {placePrediction.text?.text || ''}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}