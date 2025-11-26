'use client'

import { useRouter } from 'next/navigation';
import {CalendarDaysIcon, MapPinIcon} from "@heroicons/react/24/outline";
import {Trip, UserTripsProps,} from "@/lib/types";

interface TripCardProps {
    trip: UserTripsProps
    session_user_id: string
}

export default function TripsListCard({ trip, session_user_id }: TripCardProps) {
    const router = useRouter();

    // Format dates
    const formatDate = (date: string | undefined) => {
        return date
            ? new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : "Unknown";
    };

    const startDate = formatDate(trip.start_date);
    const endDate = formatDate(trip.end_date);

    const experience_count = trip.experience_count

    const handleClick = () => {
        router.push(`/trips/details?q=${trip.trip_id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="flex flex-col w-full p-4 gap-2 rounded-lg
                        border border-gray-500 shadow-md
                        transition-all hover:shadow-lg hover:scale-[1.02]"
        >

            {/*==========Top Row====================================================================================*/}
            <div className="flex justify-between items-center gap-2">
                {/*Title*/}
                <div className="w-3/4">
                    <h2 className="text-2xl font-semibold text-gray-900 line-clamp-1">
                        {trip.title}
                    </h2>
                </div>

                {/*Date*/}
                <div className="flex items-center text-gray-700 w-1/4">
                    <CalendarDaysIcon className="w-5 h-5 mr-3 flex-shrink-0"/>
                    <p>
                        {startDate} - {endDate}
                    </p>
                </div>
            </div>

            {/*==========MIDDLE ROW==================================================================================*/}
            <div className="px-2">
                <p className="text-md text-gray-800 line-clamp-4">
                    {trip.description || "No description"}
                </p>
            </div>


            {/*==========BOTTOM ROW==================================================================================*/}
            <div className="flex items-center text-gray-600 mt-2">
                <MapPinIcon className="w-5 h-5 mr-1"/>
                <p className="text-md font-medium">
                    {experience_count} {experience_count === 1 ? 'experience' : 'experiences'}
                </p>
            </div>
        </div>
    );
}
