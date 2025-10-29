'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon} from "@heroicons/react/16/solid";
import {ErrorResponse, UserTripsProps,} from "@/lib/types";

interface TripCardProps {
    trip: UserTripsProps
}

export default function TripsListCard({ trip }: TripCardProps) {
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
            className="bg-white rounded-lg p-3 border border-gray-200
            transition-all duration-200  hover:shadow-lg hover:scale-[1.01]"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-start my-2">
                <h3 className="text-2xl font-semibold text-gray-900">{trip.title}</h3>
                <div className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {formatDateRange()}
                </div>
            </div>

            {/*Description*/}
            <p className="text-gray-700 mb-4 leading-relaxed">
                {trip.description || "No description"}
            </p>


            <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2">
                    <MapPinIcon/>
                </svg>
                <p>
                    {trip.experience_count} {trip.experience_count === 1 ? 'experience' : 'experiences'}
                </p>
            </div>
        </div>
    );
}
