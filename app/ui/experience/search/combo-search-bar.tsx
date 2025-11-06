'use client'

import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import {FormEvent, useEffect, useRef, useState} from "react";
import { useLoadScript } from "@react-google-maps/api";
import Script from "next/script";
import Autocomplete from '@mui/material/Autocomplete';
import {TextField} from "@mui/material";

interface PlacesAutocompleteProps {
    onLocationSelect: (coords: { latitude: number; longitude: number; address: string } | null) => void
}

interface KeywordsAutocompleteProps {
    keywordOptions: KeywordOption[];
    keywords: string;
    setKeywords: (keywords: string) => void;
}

interface KeywordOption {
    label: string;
    value: string;
}

export default function ComboSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');
    const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [keywordOptions, setKeywordOptions] = useState<KeywordOption[]>([]);

    // Load and sort keyword options from JSON file
    useEffect(() => {
        const loadKeywords = async () => {
            try {
                const response = await fetch('/keywords.json');
                const data = await response.json() as Record<string, number>;

                const options = Object.entries(data)
                    .map(([label, rank]) => ({ label, rank }))
                    .sort((a, b) => b.rank - a.rank);

                // @ts-ignore
                setKeywordOptions(options);
            } catch (error) {
                console.error('Error loading keywords:', error);
            }
        };

        loadKeywords();
    }, []);

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
                <div>Loading...</div>
            ) : (
                <form onSubmit={handleSearch}>
                    <div className="flex flex-col md:flex-row gap-2 pl-4 pr-6 py-2
                                    bg-white rounded-lg shadow-sm border border-gray-500"
                    >
                        <KeywordsAutocomplete keywordOptions={keywordOptions} keywords={keywords} setKeywords={setKeywords}/>

                        <PlacesAutocomplete onLocationSelect={setLocation} />

                        {/*Submit Button*/}
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 my-2
                            rounded-md transition-colors duration-200 flex-shrink-0"
                        >
                            Search
                        </button>

                    </div>
                </form>
            )}
        </div>
    );
}

function KeywordsAutocomplete({keywordOptions, keywords, setKeywords}: KeywordsAutocompleteProps) {
    return (
        <div className="flex items-center flex-1 gap-2 pl-3 pr-6 py-2 border-b
                        md:border-b-0 md:border-r border-gray-500">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <Autocomplete
                freeSolo
                id="keywords"
                options={keywordOptions}
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.label
                }
                inputValue={keywords}
                onInputChange={(event, newInputValue) => {
                    setKeywords(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Activities, attractions, keywords..."
                        variant="standard"
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                type: 'search',
                            },
                        }}
                    />
                )}
                sx={{ width: '100%' }}
            />
        </div>
    )
}

function PlacesAutocomplete({onLocationSelect}: PlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleFocus = () => {
        setInputValue('');
        setSuggestions([]);
    };

    const handleInputChange = async (value: string) => {
        setInputValue(value);

        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            const { AutocompleteSuggestion } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input: value,
                includedPrimaryTypes: ['(regions)'], // Cities and states
            });

            setSuggestions(suggestions);
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
                onLocationSelect({
                    latitude: location.lat(),
                    longitude: location.lng(),
                    address: address
                });
            }
        } catch (error) {
            console.error('Error getting place details:', error);
        }
    };

    // Handle clicking outside the component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputValue) {
                handleInputChange(inputValue);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    return (
        <div ref={wrapperRef} className="flex items-center flex-1 gap-2 px-3 py-2 relative">
            <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0"/>
            <div className="w-full relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={handleFocus}
                    placeholder="City, region, neighborhood..."
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
                                    <div className="text-gray-900">
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