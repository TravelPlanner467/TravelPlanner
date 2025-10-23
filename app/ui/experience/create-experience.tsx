'use client'

import {useState, useRef, useEffect} from "react";
import {MapContainer, Marker, TileLayer, useMap, useMapEvents} from "react-leaflet";

// HELPER COMPONENT: Handles map clicks
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

// HELPER COMPONENT: Changes map view when 'center' prop changes
function ChangeMapView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function CreateExperience(userID: string) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    // Location State
    const [latitude, setLatitude] = useState(51.505);
    const [longitude, setLongitude] = useState(-0.09);
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
    const [address, setAddress] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Loading States
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);


    // UTILITY: Round coordinates to specified decimal places (default 6 = ~0.11m accuracy)
    const roundCoordinate = (coord, decimals = 6) => {
        return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchForwardGeocode(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);


    // Fetch address from coordinates (Reverse Geocoding)
    const fetchReverseGeocode = async (lat, lon) => {
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
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddress('Error fetching address');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Fetch coordinates/suggestions from address string (Forward Geocoding)
    const fetchForwardGeocode = async (query) => {
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
    const handleMapClick = (latlng) => {
        const lat = roundCoordinate(latlng.lat);
        const lng = roundCoordinate(latlng.lng);

        setLatitude(lat);
        setLongitude(lng);
        fetchReverseGeocode(lat, lng);
    };

    // User clicked on a search suggestion
    const handleSuggestionClick = (result) => {
        const lat = roundCoordinate(parseFloat(result.lat));
        const lon = roundCoordinate(parseFloat(result.lon));

        setLatitude(lat);
        setLongitude(lon);
        setAddress(result.display_name);
        setMapCenter([lat, lon]);

        // Clear search
        setSearchQuery('');
        setSearchResults([]);
    };

    // Handle manual coordinate input
    const handleLatitudeChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= -90 && value <= 90) {
            const rounded = roundCoordinate(value);
            setLatitude(rounded);
            setMapCenter([rounded, longitude]);
        } else if (e.target.value === '' || e.target.value === '-') {
            setLatitude(e.target.value);
        }
    };

    const handleLongitudeChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= -180 && value <= 180) {
            const rounded = roundCoordinate(value);
            setLongitude(rounded);
            setMapCenter([latitude, rounded]);
        } else if (e.target.value === '' || e.target.value === '-') {
            setLongitude(e.target.value);
        }
    };

    // Update address when coordinates change manually
    useEffect(() => {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            const timeoutId = setTimeout(() => {
                fetchReverseGeocode(lat, lon);
            }, 1000); // Debounce address lookup

            return () => clearTimeout(timeoutId);
        }
    }, [latitude, longitude]);

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate coordinates
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            alert('Please enter valid coordinates');
            return;
        }

        const formData = {
            title,
            description,
            latitude: lat,
            longitude: lon,
            address,
            image
        };

        console.log('Experience data:', formData);
        alert('Experience data logged to console!');
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                maxWidth: '600px',
                margin: '20px auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff'
            }}
        >
            <h3 style={{ margin: '0 0 10px 0' }}>Create New Experience</h3>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Title: *</strong>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Enter experience title"
                />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Description:</strong>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                    placeholder="Describe your experience..."
                />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong>Image:</strong>
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    accept="image/*"
                    style={{ padding: '8px', fontSize: '14px' }}
                />
                {image && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
            Selected: {image.name}
          </span>
                )}
            </label>

            <fieldset style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px' }}>
                <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>Location</legend>

                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    style={{
                        marginBottom: '15px',
                        padding: '10px 20px',
                        backgroundColor: isGettingLocation ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    {isGettingLocation ? '📍 Getting Location...' : '📍 Use My Current Location'}
                </button>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <strong>Search for an address:</strong>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="e.g., 'Eiffel Tower, Paris'"
                            style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>

                    {/* Search Results Dropdown */}
                    {(searchResults.length > 0 || isSearching) && (
                        <ul style={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderTop: 'none',
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            position: 'absolute',
                            width: '100%',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            borderRadius: '0 0 4px 4px'
                        }}>
                            {isSearching ? (
                                <li style={{ padding: '12px', color: '#666', textAlign: 'center' }}>
                                    Searching...
                                </li>
                            ) : (
                                searchResults.map((result) => (
                                    <li
                                        key={result.place_id}
                                        onClick={() => handleSuggestionClick(result)}
                                        style={{
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #eee',
                                            color: '#333',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        📍 {result.display_name}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                    <strong>Address:</strong>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Click map, use current location, or search"
                        style={{
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: isLoadingAddress ? '#f5f5f5' : 'white'
                        }}
                    />
                    {isLoadingAddress && (
                        <span style={{ fontSize: '12px', color: '#666' }}>Loading address...</span>
                    )}
                </label>

                {/* Map */}
                <div style={{
                    height: '350px',
                    width: '100%',
                    margin: '15px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[latitude, longitude]} />
                        <MapClickHandler onMapClick={handleMapClick} />
                        <ChangeMapView center={mapCenter} />
                    </MapContainer>
                </div>

                {/* Coordinate Inputs */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <strong>Latitude: *</strong>
                        <input
                            type="number"
                            value={latitude}
                            onChange={handleLatitudeChange}
                            step="0.000001"
                            min="-90"
                            max="90"
                            required
                            style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                            placeholder="-90 to 90"
                        />
                    </label>
                    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <strong>Longitude: *</strong>
                        <input
                            type="number"
                            value={longitude}
                            onChange={handleLongitudeChange}
                            step="0.000001"
                            min="-180"
                            max="180"
                            required
                            style={{ padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                            placeholder="-180 to 180"
                        />
                    </label>
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    💡 Tip: Click on the map, search for a location, use your current location, or enter coordinates manually
                </div>
            </fieldset>

            <button
                type="submit"
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
                Create Experience
            </button>
        </form>
    );

    // return (
    //     <div className="flex flex-col p-6 bg-white rounded-lg shadow-md">
    //
    //         <form className="space-y-6">
    //             <div className="flex flex-row gap-2 items-center">
    //                 <label htmlFor="title" className="block text-sm font-medium text-gray-700">
    //                     Title
    //                 </label>
    //                 <input
    //                     id="title"
    //                     type="text"
    //                     value={title}
    //                     onChange={(e) => setTitle(e.target.value)}
    //                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    //                     placeholder="Title"
    //                     required
    //                 />
    //             </div>
    //             <div className="flex flex-row gap-2 items-center">
    //                 <label htmlFor="title" className="block text-sm font-medium text-gray-700">
    //                     Date
    //                 </label>
    //                 <input
    //                     id="experience_date"
    //                     type="date"
    //                     value={experienceDate}
    //                     onChange={(e) => setTitle(e.target.value)}
    //                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    //                     placeholder="Title"
    //                     required
    //                 />
    //             </div>
    //
    //
    //             <div className="flex flex-row gap-2 items-center">
    //                 <label htmlFor="description" className="block text-sm font-medium text-gray-700">
    //                     Details
    //                 </label>
    //                 <textarea
    //                     id="details"
    //                     value={details}
    //                     onChange={(e) => setDetails(e.target.value)}
    //                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    //                     placeholder="Write about your experience..."
    //                 />
    //             </div>
    //         </form>
    //     </div>
    // )
}