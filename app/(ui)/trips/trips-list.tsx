'use client'
import { useState } from 'react';
import TripsListCard from "@/app/(ui)/trips/trips-list-card";
import {Trip, UserTripsProps} from "@/lib/types";
import {PaginatedList} from "@/app/(ui)/general/paginated-list";

interface TripDataProps {
    trips: UserTripsProps[]
    session_user_id: string
}

const ITEMS_PER_PAGE = 6;

export default function TripsList({ trips, session_user_id }: TripDataProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return (
        <div className="flex flex-col w-full items-center px-4 py-3">
            <div className="w-full max-w-5xl">
                {/*User Experiences List*/}
                <PaginatedList
                    items={trips}
                    itemsPerPage={6}
                    renderItem={(trip: UserTripsProps) => (
                        <TripsListCard
                            key={trip.trip_id}
                            trip={trip}
                            session_user_id={session_user_id}
                        />
                    )}
                />
            </div>
        </div>
    );
}
