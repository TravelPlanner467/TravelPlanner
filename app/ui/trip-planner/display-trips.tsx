'use client'

import React, {useEffect, useState} from "react";
import {getUserTrips} from "@/app/ui/trip-planner/trip-planner-actions";
import {DeleteTrip} from "@/app/ui/trip-planner/delete-trip";

interface Trip {
    id: number;
    title: string;
    description: string
}

export default function DisplayTrips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadTrips() {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Loading trips...');
            const response = await getUserTrips();
            if (response && response.status === 'success') {
                setTrips(response.data);
            }
        } catch (err) {
            setError('Failed to load user trips');
            console.error('Error loading trips:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTrips()
    }, []);

    const handleDeleteSuccess = () => {
        // Reload the calculations after successful deletion
        loadTrips();
    };


    if (isLoading) {
        return <div className="text-center py-4">Loading User Trips...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    return (
            <div className="flex flex-wrap flex-shrink-0 justify-center items-start gap-4">
                {trips.map((trip) => (
                    <div
                        key={`calculation-${trip.id}`}
                        className="flex-shrink-0 w-52 min-w-52 border border-gray-200 rounded-lg shadow-md">
                        {/* Card Header */}
                        <div className="flex flex-row justify-between items-center
                                        bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg"
                        >
                            <div className="flex flex-col justify-start items-start">
                                <h3 className="text-md text-gray-900">
                                    Title: {trip.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Description: {trip.description}
                                </p>
                            </div>
                            <DeleteTrip
                                tripID={trip.id.toString()}
                                onDeleteSuccess={handleDeleteSuccess}
                            />
                        </div>
                    </div>
                ))}
            </div>
    );



}