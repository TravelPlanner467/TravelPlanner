'use client'

import {ErrorResponse, Experience, Trip} from "@/lib/types";
import {CalendarDaysIcon} from "@heroicons/react/16/solid";
import Link from "next/link";
import TripExperiencesCard from "@/app/ui/trips/trip-experiences-card";
import SearchResultsCard from "@/app/ui/experience/search/search-results-card";

interface TripDetailsProps {
    query: string;
    trip: Trip | ErrorResponse;
    tripExperiences: Experience[] | ErrorResponse;
}

export function TripDetails({query, trip, tripExperiences}: TripDetailsProps) {
    if ("error" in trip || "error" in tripExperiences) {
        return (
            <div>
                {/*<div>*/}
                {/*    error: {trip.error}*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*    message: {trip.message}*/}
                {/*</div>*/}
                <div>
                    TODO: IMPLEMENT TRIP DETAILS NOT FOUND ERROR CARD
                </div>
            </div>
        )
    }

    // Format start and end dates
    const startDate = trip.start_date
        ? new Date(trip.start_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "Unknown";

    const endDate = trip.end_date
        ? new Date(trip.end_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "Unknown";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="mb-6">
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

                    {/* Description */}
                    {trip.description && (
                        <div className="prose max-w-none mb-6">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {trip.description}
                            </p>
                        </div>
                    )}

                    {/* Experiences */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            Experiences
                        </h2>
                        {trip.experiences.length > 0 ? (
                            <ul className="flex flex-row flex-wrap gap-4 w-full space-y-1">
                                {tripExperiences.map((exp: Experience) => (
                                    <TripExperiencesCard key={exp.experienceID} experience={exp}/>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">
                                No experiences linked to this trip.
                            </p>
                        )}
                    </div>
                </div>

                <Link
                    href={`/trips`}
                    className="mt-8 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                    Return to My Trips
                </Link>
            </div>
        </div>
    );
}