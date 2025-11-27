'use client'

import dynamic from 'next/dynamic';
import {startTransition, useCallback, useState, useEffect} from "react";
import { ListBulletIcon, MapIcon } from "@heroicons/react/24/outline";

import {getExperiencesByLocation} from "@/lib/actions/experience-actions";
import { Experience } from "@/lib/types";

interface ExperienceViewProps {
    experiences: Experience[];
    session_user_id?: string;
    keywords?: string;
    location?: string
    default_view_mode?: ViewMode;
    initialCenter?: {
        lat: number;
        lng: number;
        address: string;
    } | null;
}

type ViewMode = 'list' | 'map';

interface ViewToggleButtonProps {
    viewMode: ViewMode;
    onChange: (mode: ViewMode) => void;
    count: number;
}

function ViewToggleButton({ viewMode, onChange, count }: ViewToggleButtonProps) {
    return (
        <div className="inline-flex border border-gray-400 rounded-lg bg-white overflow-hidden">
            <button
                type="button"
                onClick={() => onChange('map')}
                className={`
                          flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200
                          border-r border-gray-400 ${viewMode === 'map'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-white text-gray-600 hover:text-gray-900'}`}
            >
                <MapIcon className="w-4 h-4" />
                Map
            </button>

            <button
                type="button"
                onClick={() => onChange('list')}
                className={`
                            flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200
                            ${viewMode === 'list'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-white text-gray-600 hover:text-gray-900'}`}
            >
                <ListBulletIcon className="w-4 h-4" />
                List
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
          {count}
        </span>
            </button>
        </div>
    );
}

// Dynamically import List & Map Views
const ExperiencesList = dynamic(
    () => import('@/app/(ui)/experience/experience-list'),
    {
        ssr: true,
        loading: () => (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }
);

const DisplayByMap = dynamic(
    () => import('@/app/(ui)/experience/display-by-map'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }
);

export default function ExperiencesDisplay({
                                               experiences,
                                               keywords,
                                               location,
                                               session_user_id,
                                               default_view_mode = "map",
                                               initialCenter,
}
: ExperienceViewProps)
{
    const [viewMode, setViewMode] = useState<ViewMode>(default_view_mode);

    // State for displayed experiences (can be filtered by map bounds)
    const [displayedExperiences, setDisplayedExperiences] = useState<Experience[]>(experiences);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Map boundaries for searching experiences by location
    const [mapBounds, setMapBounds] = useState<{
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    } | null>(null);

    // Sync experiences prop with displayedExperiences when new search results arrive
    useEffect(() => {
        setDisplayedExperiences(experiences);
    }, [experiences]);

    // Handle bounds change from map
    const handleBoundsChange = useCallback((bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    }) => {
        setMapBounds(bounds);
    }, []);

    // Handle refresh request from map
    const handleRequestRefresh = useCallback(async () => {
        if (!mapBounds) {
            console.warn('Cannot refresh: map bounds not available');
            return;
        }

        // ⭐ PHASE 1: Simple duplicate prevention
        if (isLoading) {
            console.log('Search already in progress, ignoring click');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await getExperiencesByLocation({
                northEast: mapBounds.northEast,
                southWest: mapBounds.southWest,
            });

            if ('error' in result) {
                setError(result.message || result.error || 'Failed to load experiences');
            } else {
                setDisplayedExperiences(result);
                // Clear error on success
                setError(null);
            }
        } catch (error) {
            console.error('Error refreshing experiences:', error);
            setError('Failed to refresh data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [mapBounds, isLoading]);

    return (
        <div className="relative flex flex-col w-full h-full">
            {/* Toggle Button */}
            <div className="absolute -top-8 left-4 z-20">
                <ViewToggleButton
                    viewMode={viewMode}
                    onChange={setViewMode}
                    count={experiences.length}
                />
            </div>

            {/* Search Results Views */}
            <div className="flex min-h-0 w-full h-full justify-center items-stretch">
                {viewMode === 'list' && (
                    <ExperiencesList
                        session_user_id={session_user_id || undefined}
                        experiences={displayedExperiences}
                    />
                )}

                {viewMode === 'map' && (
                    <DisplayByMap
                        experiences={displayedExperiences}
                        session_user_id={session_user_id || undefined}
                        mapBounds={mapBounds || null}
                        onBoundsChange={handleBoundsChange}
                        onRequestRefresh={handleRequestRefresh}
                        initialCenter={initialCenter}
                        enableSelectMarker={false}
                        showSelectedMarker={false}
                        isLoading={isLoading}
                        error={error}
                    />
                )}
            </div>
        </div>
    );
}
