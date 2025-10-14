'use client'

import {auth} from "@/lib/auth";
import {useState} from "react";
import {LoadScript, Autocomplete} from "@react-google-maps/api";
import {useRef} from "react";

type Trip = {
    id: number;
    title: string;
    experience_date: string;
    details: string;
    keywords: string;
    user_id: number;
    created_at: string;
};

type Session = typeof auth.$Infer.Session;

const libraries = ['places'];

export default function CreateExperience({ session }: { session: Session | null }) {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [experienceDate, setExperienceDate] = useState('');
    const [createDate, setCreateDate] = useState('');
    const [keywords, setKeywords] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const [error, setError] = useState('');

    // Handle Autocomplete Place Selection
    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            if (place.geometry && place.geometry.location) {
                const newLocation = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };

                setLocation(newLocation);
                setAddress(place.formatted_address || '');

                // Center map on the selected place
                if (mapRef.current) {
                    mapRef.current.panTo(newLocation);
                    mapRef.current.setZoom(14);
                }
            }
        }
    };

    const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };


    return (
        <div className="flex flex-col p-6 bg-white rounded-lg shadow-md">

            <form className="space-y-6">
                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Title"
                        required
                    />
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Date
                    </label>
                    <input
                        id="experience_date"
                        type="date"
                        value={experienceDate}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Title"
                        required
                    />
                </div>
                <LoadScript
                    googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ''}
                    libraries={libraries as any}
                >
                    {/* Address autocomplete input */}
                    <div className="">
                        <label htmlFor="address" className="text-sm font-medium text-gray-700">
                            Search for an address
                        </label>
                        <Autocomplete
                            onLoad={onAutocompleteLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{ fields: ['formatted_address', 'geometry', 'name'] }}
                        >
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter an address or place name"
                            />
                        </Autocomplete>
                    </div>

                </LoadScript>

                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Details
                    </label>
                    <textarea
                        id="details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Write about your experience..."
                    />
                </div>
            </form>
        </div>
    )
}