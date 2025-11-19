'use client'

import {useCallback, useEffect, useRef, useState, useMemo} from "react";
import {useRouter, useSearchParams} from 'next/navigation';
import {ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon} from "@heroicons/react/24/outline";

import {LocationSearch} from "@/app/(ui)/experience/components/location-search";
import {InteractiveMap} from "@/app/(ui)/experience/components/leaflet-map";
import {SearchResultsCard} from "@/app/(ui)/experience/search/search-results-card";
import {isValidLatitude, isValidLongitude, Location, reverseGeocodeWithCache} from "@/lib/utils/nomatim-utils";
import {Experience} from "@/lib/types";
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon
} from "@heroicons/react/16/solid";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

interface DisplayByMapProps {
    experiences: Experience[];
    onBoundsChange: (bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    }) => void;
    mapBounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    } | null;
    onRequestRefresh?: () => void;
    initialCenter?: {
        lat: number;
        lng: number;
        address: string;
    } | null;
}

const MAP_CONFIG = {
    defaultCenter: { lat: 44.5618, lng: -123.2823 },
    defaultZoom: 13,
} as const;

export default function DisplayByMap({experiences, onBoundsChange, mapBounds, onRequestRefresh, initialCenter}
: DisplayByMapProps
) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullWidth, setIsFullWidth] = useState(false);

    // State for reverse geocoding errors
    const [geocodingError, setGeocodingError] = useState<string | null>(null);

    // Initialize location from prop or default
    const [location, setLocation] = useState<Location>(() => {
        if (initialCenter) {
            return {
                lat: initialCenter.lat,
                lng: initialCenter.lng,
                address: initialCenter.address
            };
        }
        return {
            lat: MAP_CONFIG.defaultCenter.lat,
            lng: MAP_CONFIG.defaultCenter.lng,
            address: ''
        };
    });

    // Track if user has manually moved the map
    const [showRefreshButton, setShowRefreshButton] = useState(false);
    const initialBoundsRef = useRef<{
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    } | null>(null);

    // Track hovered/selected experience
    const [hoveredExperienceId, setHoveredExperienceId] = useState<string | null>(null);
    const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);

    // Refs for sidebar items to enable auto scrolling
    const sidebarItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const sidebarContainerRef = useRef<HTMLDivElement>(null);

    // Key to reset map after sidebar state change
    const [mapKey, setMapKey] = useState(0);

    // CRITICAL: Watch URL changes for browser back/forward navigation
    // Without this, back/forward buttons won't update the map location
    useEffect(() => {
        const lat = searchParams.get('latitude');
        const lng = searchParams.get('longitude');
        const addr = searchParams.get('address');

        if (lat && lng) {
            const newLat = parseFloat(lat);
            const newLng = parseFloat(lng);

            // Only update if coordinates actually changed
            if (newLat !== location.lat || newLng !== location.lng) {
                setLocation({
                    lat: newLat,
                    lng: newLng,
                    address: addr || `${lat}, ${lng}`
                });
            }
        }
    }, [searchParams]); // Watches URL changes

    // Update location when initialCenter prop changes (initial load)
    useEffect(() => {
        if (initialCenter) {
            setLocation({
                lat: initialCenter.lat,
                lng: initialCenter.lng,
                address: initialCenter.address
            });
        }
    }, [initialCenter]);

    // Sync location changes back to URL
    const syncLocationToURL = useCallback((newLocation: Location) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set('latitude', newLocation.lat.toString());
        params.set('longitude', newLocation.lng.toString());
        if (newLocation.address) {
            params.set('address', newLocation.address);
        }

        // Use router.replace to update URL without adding to history
        router.replace(`/experience/search?${params.toString()}`, {
            scroll: false
        });
    }, [router, searchParams]);

    // Debounced sync to prevent excessive URL updates
    const debouncedSyncToURL = useMemo(
        () => debounce(syncLocationToURL, 500),
        [syncLocationToURL]
    );

    // Set Coordinates when user uses LocationSearch (and sync to URL)
    const handleLocationSelect = useCallback((selectedLocation: Location) => {
        setLocation(selectedLocation);
        debouncedSyncToURL(selectedLocation);
    }, [debouncedSyncToURL]);

    // Set Coordinates when user clicks on the map (with reverse geocoding)
    const handleMapClick = useCallback(async (lat: number, lng: number) => {
        // Validate Coordinates
        if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
            console.warn('Invalid coordinates from map click:', { lat, lng });
            setGeocodingError('Invalid coordinates selected');
            return;
        }

        try {
            // Clear previous errors
            setGeocodingError(null);

            // Attempt reverse geocoding
            const address = await reverseGeocodeWithCache(lat, lng);

            const newLocation = {
                lat,
                lng,
                address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };

            handleLocationSelect(newLocation);
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            setGeocodingError('Could not determine address for this location');

            // Still update with coordinates as fallback
            const newLocation = {
                lat,
                lng,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };
            handleLocationSelect(newLocation);
        }
    }, [handleLocationSelect]);

    // Handle when user moves the map or zooms in/out
    const handleMapBoundsChange = useCallback((bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    }) => {
        // On initial load, set the bounds and don't show button
        if (!initialBoundsRef.current) {
            initialBoundsRef.current = bounds;
            onBoundsChange(bounds);
            return;
        }

        // Check if bounds have changed significantly
        const boundsChanged =
            Math.abs(bounds.northEast.lat - initialBoundsRef.current.northEast.lat) > 0.001 ||
            Math.abs(bounds.northEast.lng - initialBoundsRef.current.northEast.lng) > 0.001 ||
            Math.abs(bounds.southWest.lat - initialBoundsRef.current.southWest.lat) > 0.001 ||
            Math.abs(bounds.southWest.lng - initialBoundsRef.current.southWest.lng) > 0.001;

        // Show button if user has moved the map a significant distance
        if (boundsChanged) {
            setShowRefreshButton(true);
        }

        onBoundsChange(bounds);
    }, [onBoundsChange]);

    // Send new bounds data to server when user clicks "Search this area" button
    const handleRefreshClick = () => {
        setShowRefreshButton(false);
        initialBoundsRef.current = mapBounds;
        if (onRequestRefresh) {
            onRequestRefresh();
        }
    };

    // Handle hovering over a map market (scrolls the sidebar)
    const handleMarkerHover = useCallback((experienceId: string | null) => {
        setHoveredExperienceId(experienceId);

        // Scroll to the corresponding sidebar item
        if (experienceId && sidebarItemRefs.current.has(experienceId)) {
            const element = sidebarItemRefs.current.get(experienceId);
            if (element && sidebarContainerRef.current) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }
    }, []);

    // Handle marker click from map
    const handleMarkerClick = useCallback((experienceId: string) => {
        setSelectedExperienceId(experienceId);

        // Scroll to the corresponding sidebar item
        if (sidebarItemRefs.current.has(experienceId)) {
            const element = sidebarItemRefs.current.get(experienceId);
            if (element && sidebarContainerRef.current) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, []);

    // Handle sidebar item hover
    const handleSidebarItemHover = useCallback((experienceId: string | null) => {
        setHoveredExperienceId(experienceId);
    }, []);

    // Handle sidebar item click
    const handleSidebarItemClick = useCallback((experience: Experience) => {
        setSelectedExperienceId(experience.experience_id);
        if (experience.latitude && experience.longitude) {
            setLocation({
                lat: experience.latitude,
                lng: experience.longitude,
                address: experience.address || ''
            });
        }
    }, []);

    // Toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
        // If closing sidebar, also reset full width
        if (isSidebarOpen && isFullWidth) {
            setIsFullWidth(false);
        }
        // Force map to resize after sidebar open/close
        setTimeout(() => {
            setMapKey(prev => prev + 1);
        }, 300);
    };

    // Toggle full width mode
    const toggleFullWidth = () => {
        setIsFullWidth(prev => !prev);
        // Force map to resize after sidebar open/close
        setTimeout(() => {
            setMapKey(prev => prev + 1);
        }, 300);
    };

    return (
        <div className="flex flex-col min-h-0 h-full w-full overflow-hidden">
            {/* Geocoding Error Banner */}
            {geocodingError && (
                <div className="mx-2 mt-2 p-3 bg-yellow-50 border border-yellow-300
                                rounded-lg text-sm text-yellow-800 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{geocodingError}</span>
                    <button
                        onClick={() => setGeocodingError(null)}
                        className="ml-auto text-yellow-600 hover:text-yellow-800"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="flex gap-3 p-2 flex-1 min-h-0">
                {/*=================================== SIDEBAR (OPEN) ====================================*/}
                {isSidebarOpen && (
                    <div
                        className={`flex flex-col h-full shrink-0
                                border-2 border-gray-300 rounded-xl shadow-md
                                transition-all duration-300 ease-in-out overflow-hidden
                                ${isFullWidth ? 'w-full' : 'w-lg'}`}
                    >
                        {/* Sidebar Header with Toggle Button */}
                        <div className="flex items-center justify-between p-3 bg-gray-50
                                        border-b border-gray-200 shrink-0"
                        >
                            <h2 className="font-semibold text-gray-800">
                                Experiences ({experiences.length})
                            </h2>
                            <div className="flex gap-2">
                                {/* Collapse Sidebar Button */}
                                <button
                                    onClick={toggleSidebar}
                                    className="p-1.5 rounded-md text-gray-600
                                               hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200
                                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Collapse sidebar"
                                >
                                    {isFullWidth ? (
                                        <XMarkIcon className="size-7" />
                                    ) : (
                                        <ChevronLeftIcon className="size-6" />
                                    )}

                                </button>
                                {/* Full Width Toggle Button */}
                                <button
                                    onClick={toggleFullWidth}
                                    className="p-1.5 rounded-md text-gray-600
                                               hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200
                                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={isFullWidth ? "Show map" : "Hide map"}
                                >
                                    {isFullWidth ? (
                                        <ChevronDoubleLeftIcon className="size-7" />
                                    ) : (
                                        <ChevronDoubleRightIcon className="size-7" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Content (List of Experiences) */}
                        <div className="flex flex-col overflow-y-auto min-h-0 pt-2 px-2 gap-1"
                             ref={sidebarContainerRef}
                        >
                            {experiences.map((exp: Experience) => (
                                <div key={exp.experience_id}
                                     onMouseEnter={() => handleSidebarItemHover(exp.experience_id)}
                                     onMouseLeave={() => handleSidebarItemHover(null)}
                                     onClick={() => handleSidebarItemClick(exp)}
                                     ref={(selected) => {
                                         if (selected) {
                                             sidebarItemRefs.current.set(exp.experience_id, selected);
                                         } else {
                                             sidebarItemRefs.current.delete(exp.experience_id);
                                         }
                                     }}
                                     className={`transition-all duration-200 cursor-pointer
                                        ${hoveredExperienceId === exp.experience_id ? 'bg-blue-50' : ''}
                                        ${selectedExperienceId === exp.experience_id ? 'ring-2 ring-blue-500 rounded-xl' : ''}
                                    `}
                                >
                                    <SearchResultsCard
                                        experience={exp}
                                        isHovered={hoveredExperienceId === exp.experience_id}
                                        isSelected={selectedExperienceId === exp.experience_id}
                                        compact={!isFullWidth}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/*====================================== SIDEBAR (CLOSED) ======================================*/}
                {!isSidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 mt-2 rounded-md bg-white text-gray-900 self-start shrink-0
                                   border-2 border-gray-300 shadow-md
                                   hover:bg-gray-50 transition-colors duration-200
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRightIcon className="size-7" />
                    </button>
                )}
                {/* =================================== SEARCH & MAP  ======================================= */}
                {!isFullWidth && (
                    <div className="flex flex-col w-full h-full gap-2 ">
                        {/* ========== Search ==========*/}
                        <div className="shrink-0">
                            <LocationSearch
                                onLocationSelect={handleLocationSelect}
                                location={location}
                                isRow={true}
                            />
                        </div>

                        {/* ========== MAP ========== */}
                        <div className="relative flex-1 min-h-o overflow-hidden border-2 border-gray-300 rounded-xl shadow-md">
                            {/* "Search this area" Button */}
                            {showRefreshButton && (
                                <button
                                    onClick={handleRefreshClick}
                                    className="absolute top-4 right-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-lg
                                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                           transition-all duration-200 flex items-center gap-2 font-medium pointer-events-auto"
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        zIndex: 9999
                                    }}
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                    Search this area
                                </button>
                            )}

                            {/* Map */}
                            <div className="w-full h-full">
                                <InteractiveMap
                                    key={mapKey}
                                    center={{lat: location.lat, lng: location.lng}}
                                    zoom={MAP_CONFIG.defaultZoom}
                                    markers={experiences
                                        .map(exp => ({
                                            lat: exp.latitude,
                                            lng: exp.longitude,
                                            id: exp.experience_id,
                                            title: exp.title
                                        }))
                                    }
                                    selectedMarker={
                                        isValidLatitude(location.lat) && isValidLongitude(location.lng)
                                            ? { lat: location.lat, lng: location.lng }
                                            : null
                                    }
                                    onMarkerHover={handleMarkerHover}
                                    onMarkerClick={handleMarkerClick}
                                    onMapClick={handleMapClick}
                                    onBoundsChange={handleMapBoundsChange}
                                    height="100%"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
