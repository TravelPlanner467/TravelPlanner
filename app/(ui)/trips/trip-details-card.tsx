'use client'

import {Trip, TripExperience} from "@/lib/types";
import {CalendarDaysIcon} from "@heroicons/react/16/solid";
import TripExperiencesCard from "@/app/(ui)/trips/trip-experiences-card";
import {DeleteTripButton, EditTripButton} from "@/app/(ui)/trips/buttons/trip-buttons";
import {useLayoutEffect, useRef, useState} from "react";
import TripExperiencesList from "@/app/(ui)/trips/trip-experiences-list";

interface TripDetailsProps {
    trip: Trip;
    session_user_id: string;
}

export function TripDetailsCard({trip, session_user_id}: TripDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    // Handle truncation of long trip descriptions
    useLayoutEffect(() => {
        const element = textRef.current;
        if (element) {
            // Check if text is actually truncated
            setIsTruncated(element.scrollHeight > element.offsetHeight);
        }
    }, [trip.description]);

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


    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="flex flex-col bg-white p-6 border border-gray-300 shadow-lg rounded-lg">
                {/* ========================================== */}
                {/* TOP ROW - Title, Dates, & Buttons */}
                {/* ========================================== */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b">
                    <div className="flex-1 mb-4 md:mb-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            {trip.title}
                        </h1>
                        <div className="flex items-center text-gray-600">
                            <CalendarDaysIcon className="w-5 h-5 mr-2" />
                            <p className="text-sm md:text-base">
                                {startDate} - {endDate}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <EditTripButton trip_id={trip.trip_id} />
                        <DeleteTripButton trip_id={trip.trip_id} session_user_id={trip.user_id} />
                    </div>
                </div>

                {/* ========================================== */}
                {/* MIDDLE ROW - Description */}
                {/* ========================================== */}
                <div className="mb-6 pb-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                    <p ref={textRef}
                       className={`text-gray-700 leading-relaxed ${
                           !isExpanded ? 'line-clamp-3' : ''
                       }`}
                    >
                        {trip.description}
                    </p>
                    {isTruncated && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {isExpanded ? '← Show Less' : 'Show More →'}
                        </button>
                    )}
                </div>

                {/* ========================================== */}
                {/* BOTTOM ROW */}
                {/* ========================================== */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Experiences</h2>
                    <TripExperiencesList trip={trip} session_user_id={session_user_id} />
                </div>
            </div>
        </div>
    );
}