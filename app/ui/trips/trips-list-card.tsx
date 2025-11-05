'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon} from "@heroicons/react/16/solid";
import {UserTripsProps,} from "@/lib/types";

interface TripCardProps {
    trip: UserTripsProps
    index: number
}

export default function TripsListCard({ trip, index }: TripCardProps) {
    const router = useRouter();

    // TRIP DATES HANDLER
    const formatDateRange = () => {
        if (!trip.start_date || !trip.end_date) {
            return <span className="text-gray-400 italic">Dates not set</span>;
        }

        const startDate = new Date(trip.start_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const endDate = new Date(trip.end_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        if (startDate === endDate) {
            return <div>{startDate}</div>;
        }

        return <div>{startDate} - {endDate}</div>;
    };

    const handleClick = () => {
        router.push(`/trips/details?q=${trip.trip_id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-lg p-3 border border-gray-400
                        transition-all hover:shadow-md hover:scale-[1.005]"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-start my-2">
                {/*Title*/}
                <div className="flex flex-row">
                    {/*<h3 className="text-lg font-semibold text-gray-500">{index + 1}.&nbsp;</h3>*/}
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {trip.title}
                    </h2>
                </div>

                {/*Date*/}
                <div className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {formatDateRange()}
                </div>
            </div>

            {/*Description*/}
            <p className="text-gray-700 mb-3">
                {trip.description || "No description"}
            </p>

            {/*Number of Trip Experiences*/}
            <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-1"/>
                <p>
                    {trip.experience_count} {trip.experience_count === 1 ? 'experience' : 'experiences'}
                </p>
            </div>
        </div>
    );
}
