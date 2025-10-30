'use client'
import { useState } from 'react';
import TripsListCard from "@/app/ui/trips/trips-list-card";
import Pagination from "@/app/ui/components/pagination";
import {UserTripsProps} from "@/lib/types";

interface TripDataProps {
    trips: UserTripsProps[]
}

const ITEMS_PER_PAGE = 12;

export default function DisplayTrips({ trips }: TripDataProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Pagination logic
    const totalPages = Math.ceil(trips.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTrips = trips.slice(startIndex, endIndex);
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen mx-auto">
            {/* Trips List */}
            <div className="grid grid-rows-6 gap-3 max-w-2xl">
                {currentTrips.map((trip, index: number) => (
                    <TripsListCard key={trip.trip_id} trip={trip} index={index}/>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChangeAction={handlePageChange}
                />
            )}
        </div>
    );
}
