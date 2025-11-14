// app/(dev)/dev/components/map-page-client.tsx
'use client'

import {useState, useCallback, useTransition} from "react";

import DisplayByMap from "@/app/(ui)/experience/display-by-map";
import {getExperiencesByLocation} from "@/lib/actions/experience-actions";
import {Experience} from "@/lib/types";

interface MapPageClientProps {
    initialExperiences: Experience[];
    session_user_id: string;
}

export default function MapPageClient({initialExperiences, session_user_id}: MapPageClientProps) {
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [isPending, startTransition] = useTransition();
    const [mapBounds, setMapBounds] = useState<{
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    } | null>(null);

    // Callback to update bounds from child component
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
        <div className="flex flex-col h-full w-full">
            <DisplayByMap
                experiences={experiences}
                onBoundsChange={handleBoundsChange}
                mapBounds={mapBounds}
                onRequestRefresh={handleRequestRefresh}
            />
        </div>
    );
}
