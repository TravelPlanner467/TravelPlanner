'use client'

import {ErrorResponse, Experience, Trip} from "@/lib/types";
import {CalendarDaysIcon} from "@heroicons/react/16/solid";
import TripExperiencesCard from "@/app/(ui)/trips/trip-experiences-card";
import {DeleteTripButton, EditTripButton} from "@/app/(ui)/trips/buttons/trip-buttons";
import {useLayoutEffect, useRef, useState} from "react";

interface TripDetailsProps {
    trip: Trip;
    tripExperiences: Experience[] | ErrorResponse;
    session_user_id: string;
}

export function TripDetailsCard({trip, tripExperiences, session_user_id}: TripDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    // Handle truncation of long descriptions
    useLayoutEffect(() => {
        const element = textRef.current;
        if (element) {
            // Check if text is actually truncated
            setIsTruncated(element.scrollHeight > element.offsetHeight);
        }
    }, [trip.description]);

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
        <div className="w-full p-6">
            <div className="flex flex-col p-8 border border-gray-500 shadow-md rounded-lg ">
                {/* ========================================== */}
                {/* TOP ROW - Title, Dates, & Buttons */}
                {/* ========================================== */}
                <div className="flex flex-row justify-between items-center mb-6">
                    <div className="w-3/4">
                        <h1 className="mb-2 text-4xl font-bold text-gray-900 line-clamp-1">
                            {trip.title}
                        </h1>
                        <div className="flex items-center text-gray-700 space-x-2">
                            <CalendarDaysIcon className="w-5 h-5" />
                            <p className="text-lg font-medium">
                                {startDate} - {endDate}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 w-1/4">
                        <EditTripButton trip_id={trip.trip_id} />
                        <DeleteTripButton trip_id={trip.trip_id} user_id={trip.user_id} />
                    </div>
                </div>

                {/* ========================================== */}
                {/* MIDDLE ROW - Description */}
                {/* ========================================== */}
                <div className="flex flex-col w-full">
                    {/*Header*/}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Description
                    </h2>

                    {/*Description*/}
                    <p ref={textRef}
                       className={`text-md text-gray-700 leading-relaxed ${
                           !isExpanded ? 'line-clamp-4' : ''
                       }`}
                    >
                        {trip.description}
                    </p>

                    {/*"See More" button*/}
                    {isTruncated && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 pr-8 text-blue-800 hover:text-blue-900 font-medium self-end "
                        >
                            {isExpanded ? 'Show Less' : 'See More'}
                        </button>
                    )}
                </div>

                {/* ========================================== */}
                {/* BOTTOM ROW */}
                {/* ========================================== */}
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