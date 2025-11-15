import React, {useState} from "react";
import {isValidLatitude, isValidLongitude, Location, roundCoordinate} from "@/lib/utils/nomatim-utils";
import {InteractiveMap} from "@/app/(ui)/experience/components/leaflet-map";
import {LocationSearch} from "@/app/(ui)/experience/components/location-search";

interface FreeAddressSearchProps {
    onLocationSelect: (location: Location) => void;
    initialLocation?: Location;
    mapZoom?: number;
}

// ============================================================================
// MAP CONFIG
// ============================================================================
const MAP_CONFIG = {
    defaultCenter: { lat: 44.5618, lng: -123.2823 },
    defaultZoom: 13,
} as const;

// =====================================================================================================================
// MAIN COMPONENT
// =====================================================================================================================
export function FreeAddressSearch({onLocationSelect, initialLocation, mapZoom = 13,}: FreeAddressSearchProps) {
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Current location state
    const [location, setLocation] = useState<Location>(
        initialLocation || {
            lat: MAP_CONFIG.defaultCenter.lat,
            lng: MAP_CONFIG.defaultCenter.lng,
            address: ''
        }
    );
    const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({
        lat: location.lat,
        lng: location.lng
    });

    // Handle location selection from LocationSearch
    const handleLocationSelect = (selectedLocation: Location) => {
        setLocation(selectedLocation);
        setMapCenter({lat: selectedLocation.lat, lng: selectedLocation.lng});
        onLocationSelect(selectedLocation);
    };

    // Handle map clicks
    const handleMapClick = async (lat: number, lng: number) => {
        const roundedLat = roundCoordinate(lat);
        const roundedLng = roundCoordinate(lng);

        const newLocation = {
            lat: roundedLat,
            lng: roundedLng,
            address: '' // LocationSearch will handle reverse geocoding
        };

        setLocation(newLocation);
        setMapCenter({lat: roundedLat, lng: roundedLng});
        onLocationSelect(newLocation);
    };

    return (
        <div className="relative flex flex-col gap-2 items-center justify-center">
            {/* Location Search */}
            <div className="w-full">
                <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    location={location}
                    onMapClick={handleMapClick}
                    // pass map expansion button to LocationSearch
                    mapButton={
                        <button
                            type="button"
                            onClick={() => setIsMapExpanded(!isMapExpanded)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95
                                       text-white rounded-xl transition-all duration-200 font-semibold
                                       shadow-md hover:shadow-lg flex items-center justify-center gap-2
                                       cursor-pointer"
                        >
                            {isMapExpanded ? <><span>▲</span> Hide Map</> : <><span>▼</span> Show Map</>}
                        </button>
                    }
                />
            </div>

            {/* Map Section */}
            {isMapExpanded && (
                <div className="h-[450px] w-full border-2 border-gray-300 rounded-xl overflow-hidden shadow-md">
                    <InteractiveMap
                        center={mapCenter}
                        zoom={mapZoom}
                        selectedMarker={
                            isValidLatitude(location.lat) && isValidLongitude(location.lng)
                                ? { lat: location.lat, lng: location.lng }
                                : null
                        }
                        onMapClick={handleMapClick}
                        height="450px"

                    />
                </div>
            )}
        </div>
    );
}