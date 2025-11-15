'use client'

import dynamic from 'next/dynamic';
import {startTransition, useCallback, useState} from "react";
import { ListBulletIcon, MapIcon } from "@heroicons/react/24/outline";

import {getExperiencesByLocation} from "@/lib/actions/experience-actions";
import { Experience } from "@/lib/types";

interface ExperienceViewProps {
    experiences: Experience[];
    keywords?: string;
    location?: string
    session_user_id?: string;
    default_view_mode?: ViewMode;
}

type ViewMode = 'list' | 'map';

// Dynamically import List & Map Views
const UserExperiences = dynamic(
    () => import('@/app/(ui)/account/experiences/user-experiences'),
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
    () => import('@/app/(ui)/experience/components/display-by-map'),
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
                                               default_view_mode = "map"}
: ExperienceViewProps)
{
    const [viewMode, setViewMode] = useState<ViewMode>(default_view_mode);

    // Map boundaries for searching experiences by location
    const [mapBounds, setMapBounds] = useState<{
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    } | null>(null);

    // Handle bounds change from map
    const handleBoundsChange = useCallback((bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    }) => {
        setMapBounds(bounds);
    }, []);

    // Handle refresh request from map
    const handleRequestRefresh = useCallback(() => {
        if (!mapBounds) {
            console.warn('Cannot refresh: map bounds not available');
            return;
        }

        startTransition(async () => {
            const formData = {
                northEast: mapBounds.northEast,
                southWest: mapBounds.southWest,
            }
            try {
                const newData = await getExperiencesByLocation(formData);
                // if ("error" in newData) {
                //     console.error('Error refreshing experiences:', newData.error);
                //     alert('Failed to refresh data. Please try again.');
                // } else {
                //     setExperiences(newData);
                // }
            } catch (error) {
                console.error('Error refreshing experiences:', error);
                alert('Failed to refresh data. Please try again.');
            }
        });
    }, [mapBounds]);

    return (
        <div className="flex flex-col w-full h-full">
            {/* Navigation Tab */}
            <div className="flex border-b border-gray-300 bg-white">
                <button
                    onClick={() => setViewMode('map')}
                    className={`
                        flex items-center gap-2 px-6 py-1 font-medium transition-all duration-200
                        border-b-2 -mb-[2px]
                        ${viewMode === 'map'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                    `}
                >
                    <MapIcon className="w-5 h-5" />
                    Map View
                </button>

                <button
                    onClick={() => setViewMode('list')}
                    className={`
                        flex items-center gap-2 px-6 py-1 font-medium transition-all duration-200
                        border-b-2 -mb-[2px]
                        ${viewMode === 'list'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                    `}
                >
                    <ListBulletIcon className="w-5 h-5" />
                    List View
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
                        {experiences.length}
                    </span>
                </button>
            </div>

            {/* Search Results Views */}
            <div className="flex min-h-0 w-full h-full justify-center items-center">
                {viewMode === 'list' && (
                    <UserExperiences
                        session_user_id={session_user_id}
                        experiences={experiences}
                    />
                )}

                {viewMode === 'map' && (
                    <DisplayByMap
                        experiences={experiences}
                        mapBounds={mapBounds || null}
                        onBoundsChange={handleBoundsChange}
                        onRequestRefresh={handleRequestRefresh}
                    />
                )}
            </div>
        </div>
    );
}
