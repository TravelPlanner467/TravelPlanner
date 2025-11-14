'use client'

import {useCallback, useRef, useState} from "react";
import {ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";

import {LocationSearch} from "@/app/(ui)/experience/components/location-search";
import {InteractiveMap} from "@/app/(ui)/experience/components/leaflet-map";
import MapExperienceListCard from "@/app/(ui)/experience/map-experiences-list-card";
import {isValidLatitude, isValidLongitude, Location} from "@/lib/utils/nomatim-utils";
import {Experience} from "@/lib/types";

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
}

const MAP_CONFIG = {
    defaultCenter: { lat: 44.5618, lng: -123.2823 },
    defaultZoom: 13,
    mapHeight: "78vh"
} as const;

export default function DisplayByMap({experiences, onBoundsChange, mapBounds, onRequestRefresh}
: DisplayByMapProps
) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [location, setLocation] = useState<Location>({
        lat: MAP_CONFIG.defaultCenter.lat,
        lng: MAP_CONFIG.defaultCenter.lng,
        address: ''
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

    // Set Coordinates when user uses SearchBar
    const handleLocationSelect = useCallback((selectedLocation: Location) => {
        setLocation(selectedLocation);
    }, []);

    // Set Coordinates when user clicks on the map
    const handleMapClick = useCallback((lat: number, lng: number) => {
        // Validate Coordinates
        if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
            console.warn('Coordinates out of valid range from map click:', { lat, lng });
            return;
        }

        // Pass coordinates with empty address to LocationSearch
        handleLocationSelect({lat, lng, address: ''});

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
        // Center map on this experience
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
    };

    return (
        <div className="flex flex-col min-h-0 w-full">
            {/*=================================== SEARCH BAR ====================================*/}
            <div className="shrink-0">
                <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    location={location}
                />
            </div>

            {/* Map and Experiences Section */}
            <div className="flex gap-3 p-3">
                {/*=================================== SIDEBAR (OPEN) ====================================*/}
                {isSidebarOpen && (
                    <div
                        className={`flex flex-col w-80 min-h-0 shrink-0
                                    border-2 border-gray-300 rounded-xl shadow-md
                                    transition-all duration-300 ease-in-out overflow-hidden`}
                        style={{height: MAP_CONFIG.mapHeight}}
                    >
                        {/* Sidebar Header with Toggle Button */}
                        <div className="flex items-center justify-between p-3 bg-gray-50
                                        border-b border-gray-200 shrink-0"
                        >
                            <h2 className="font-semibold text-gray-800">
                                Experiences ({experiences.length})
                            </h2>
                            <button
                                onClick={toggleSidebar}
                                className="p-1.5 rounded-md text-gray-600
                                           hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200
                                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Collapse sidebar"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sidebar Content (List of Experiences) */}
                        <div className="flex-1 overflow-y-auto min-h-0"
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
                                        ${hoveredExperienceId === exp.experience_id ? 'bg-blue-50 scale-[1.02]' : ''}
                                        ${selectedExperienceId === exp.experience_id ? 'ring-2 ring-blue-500' : ''}
                                    `}
                                >
                                    <MapExperienceListCard
                                        experience={exp}
                                        isHovered={hoveredExperienceId === exp.experience_id}
                                        isSelected={selectedExperienceId === exp.experience_id}
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
                        className="p-2 rounded-md bg-white text-gray-600 hover:text-gray-900
                                   border-2 border-gray-300 shadow-md hover:bg-gray-50
                                   transition-colors duration-200 self-start shrink-0
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                )}

                {/*====================================== MAP ======================================*/}
                <div className="relative flex-1 h-full min-h-0 overflow-hidden
                                border-2 border-gray-300 rounded-xl shadow-md"
                >
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
                    <InteractiveMap
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
                        hoveredMarkerId={hoveredExperienceId}
                        selectedMarkerId={selectedExperienceId}
                        onMarkerHover={handleMarkerHover}
                        onMarkerClick={handleMarkerClick}
                        onMapClick={handleMapClick}
                        onBoundsChange={handleMapBoundsChange}
                        height={MAP_CONFIG.mapHeight}
                    />
                </div>
            </div>
        </div>
    )
}
