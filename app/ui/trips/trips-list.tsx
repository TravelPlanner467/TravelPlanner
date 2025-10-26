'use client'
import { useState } from 'react';
import TripsListCard from "@/app/ui/trips/trips-list-card";
import Pagination from "@/app/ui/components/pagination";
import {ErrorResponse, Trip} from "@/lib/types";

interface TripDataProps {
    trips: Trip[] | ErrorResponse
}

const ITEMS_PER_PAGE = 5;

export default function DisplayTrips({ trips }: TripDataProps) {
    if ("error" in trips) {
        return (
            <div>
                TODO: IMPLEMENT NO TRIPS FOUND ERROR CARD
            </div>
        )
    }

    // Pagination calculations
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(trips.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTrips = trips.slice(startIndex, endIndex);

    function handlePageChange(page: number) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen mx-auto px-4">
            {/*My Trips Display List*/}
            <div className="space-y-2">
                {currentTrips.map((trip) => (
                    <TripsListCard key={trip.tripID} trip={trip} />
                ))}
            </div>

            {/*Pagination*/}
            <div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChangeAction={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}
