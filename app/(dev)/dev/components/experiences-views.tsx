'use client'

import { useState } from "react";
import dynamic from 'next/dynamic';
import { ListBulletIcon, MapIcon } from "@heroicons/react/24/outline";
import { Experience } from "@/lib/types";

// Dynamically import with better loading states
const SearchResults = dynamic(
    () => import('@/app/(ui)/experience/search/search-results'),
    { ssr: true }
);

const DisplayByMap = dynamic(
    () => import('@/app/(dev)/dev/components/display-by-map'),
    { ssr: false }
);

interface ExperienceViewProps {
    experiences: Experience[];
    onBoundsChange?: (bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    }) => void;
    mapBounds?: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    } | null;
    onRequestRefresh?: () => void;
    keywords: string;
    location: string
}

type ViewMode = 'list' | 'map';

export default function ExperienceView({
                                           experiences,
                                           keywords,
                                           location,
                                           onBoundsChange,
                                           mapBounds,
                                           onRequestRefresh,
                                       }: ExperienceViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    return (
        <div className="flex flex-col w-full h-full">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-300 bg-white">
                <button
                    onClick={() => setViewMode('list')}
                    className={`
                        flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200
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

                <button
                    onClick={() => setViewMode('map')}
                    className={`
                        flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200
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
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {viewMode === 'list' && (
                    <SearchResults
                        experiences={experiences}
                        keywords={keywords}
                        location={location}
                    />
                )}

                {viewMode === 'map' && (
                    <DisplayByMap
                        experiences={experiences}
                        onBoundsChange={onBoundsChange || (() => {})}
                        mapBounds={mapBounds || null}
                        onRequestRefresh={onRequestRefresh}
                    />
                )}
            </div>
        </div>
    );
}
