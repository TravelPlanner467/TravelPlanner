'use client'
import { useState } from 'react';
import TripCard from "@/app/ui/trip-planner/trip-card";
import Pagination from "@/app/ui/components/pagination";
import {Trip} from "@/app/trip-planner/page";

interface TripDataProps {
    tripsData: any
}

const ITEMS_PER_PAGE = 5;

export default function SampleTrips({ tripsData }: TripDataProps) {
    // @ts-ignore
    const trips: Trip[] = tripsData;

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(trips.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTrips = trips.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen mx-auto px-4 py-10">
            {/*My Trips Header*/}
            {/*<div className="mb-8">*/}
            {/*    <h1 className="text-4xl font-bold mb-2">My Trips</h1>*/}
            {/*    <p className="text-gray-600">*/}
            {/*        Showing {startIndex + 1}-{Math.min(endIndex, trips.length)} of {trips.length} trips*/}
            {/*    </p>*/}
            {/*</div>*/}

            {/*My Trips Display List*/}
            <div className="space-y-6">
                {currentTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>

            {/*Pagination*/}
            <div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}
