'use client'

import {ErrorResponse, Experience, Trip} from "@/lib/types";
import {CalendarDaysIcon} from "@heroicons/react/16/solid";
import TripExperiencesCard from "@/app/ui/trips/trip-experiences-card";
import {DeleteTripButton, EditTripButton} from "@/app/ui/trips/buttons/trip-buttons";

interface TripDetailsProps {
    trip: Trip;
    tripExperiences: Experience[] | ErrorResponse;
    session_user_id: string;
}

export function TripDetails({trip, tripExperiences, session_user_id}: TripDetailsProps) {
    // Format dates
    const formatDate = (date: string | null) => {
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

    // Render TripExperiences
    function renderExperiences() {
        // tripExperiences fetch error
        if ('error' in tripExperiences) {
            return <p className="text-red-500">Error fetching trip experiences.</p>;
        }

        // if no tripExperiences found in trip
        if (!tripExperiences.length) {
            return <p className="text-gray-500">No experiences linked to this trip.</p>;
        }

        return (
            <ul className="flex flex-row flex-wrap gap-4 w-full space-y-1">
                {tripExperiences.map((exp: Experience) => (
                    <TripExperiencesCard
                        key={exp.experience_id}
                        experience={exp}
                        session_user_id={session_user_id}
                        trip_id={trip.trip_id}
                    />
                ))}
            </ul>
        );
    }

    return (
        <div className="w-full p-4">
            <div className="bg-white rounded-lg shadow-md p-8">
                {/* Top Row */}
                <div className="flex flex-row justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {trip.title}
                        </h1>
                        <div className="flex items-center text-gray-600 space-x-2">
                            <CalendarDaysIcon className="w-5 h-5" />
                            <p>
                                {startDate} - {endDate}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <EditTripButton trip_id={trip.trip_id} />
                        <DeleteTripButton trip_id={trip.trip_id} user_id={trip.user_id} />
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        {trip.description || "No description"}
                    </p>
                </div>

                 {/*Experiences*/}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Experiences
                    </h2>
                    {renderExperiences()}
                </div>
            </div>
        </div>
    );
}