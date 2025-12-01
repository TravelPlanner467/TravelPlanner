'use client'

import {Trip} from "@/lib/types";
import {CalendarDaysIcon} from "@heroicons/react/16/solid";
import {DeleteTripButton, EditTripButton} from "@/app/(ui)/trips/buttons/trip-buttons";
import {useLayoutEffect, useRef, useState} from "react";
import DraggableExperiences from "@/app/(ui)/trips/draggable-experiences";
import {updateExperiencesOrder} from "@/lib/actions/trips-actions";

interface TripDetailsProps {
    trip: Trip;
    session_user_id: string;
}

interface ExperiencesPayload {
    orderedExperiences: Trip["experiences"];
    unorderedExperiences: Trip["experiences"];
};

export function TripDetailsCard({trip, session_user_id}: TripDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [lastPayload, setLastPayload] = useState<ExperiencesPayload | null>(null);

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

    // When user clicks button in DraggableExperiences
    const handleExperiencesEditAction = async (
        action: "edit" | "save" | "cancel",
        payload: ExperiencesPayload
    ) => {
        // Keep latest payload so top-right buttons can work with current order
        setLastPayload(payload);

        if (action === "edit") {
            setIsEditMode(true);
            return;
        }

        if (action === "save") {
            // Build updates array for API
            const updates = [
                ...payload.orderedExperiences.map((exp, i) => ({
                    experience_id: exp.experience_id,
                    order: i + 1,
                })),
                ...payload.unorderedExperiences.map((exp) => ({
                    experience_id: exp.experience_id,
                    order: 0,
                })),
            ];

            await updateExperiencesOrder({
                trip_id: trip.trip_id,
                session_user_id: session_user_id,
                updates: updates,
            });

            // console.log({
            //         trip_id: trip.trip_id,
            //         session_user_id: session_user_id,
            //         updates: updates,
            //     });

            setIsEditMode(false);
            return;
        }

        if (action === "cancel") {
            setIsEditMode(false);
            return;
        }
    };

    // Use the latest payload in button actions
    const handleButtonClick = async (action: "edit" | "save" | "cancel") => {
        if (action === "edit") {
            // edit mode using latest trip.experiences
            const ordered = trip.experiences
                .filter((exp) => exp.order > 0)
                .sort((a, b) => a.order - b.order);
            const unordered = trip.experiences.filter((exp) => exp.order === 0);

            await handleExperiencesEditAction("edit", {
                orderedExperiences: ordered,
                unorderedExperiences: unordered,
            });
            return;
        }

        if (!lastPayload) {
            return;
        }

        if (action === "save") {
            await handleExperiencesEditAction("save", lastPayload);
            return;
        }

        if (action === "cancel") {
            await handleExperiencesEditAction("cancel", lastPayload);
            return;
        }
    };

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
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Experiences</h2>
                        <div className="flex gap-2">
                            {!isEditMode && (
                                <button
                                    onClick={() => handleButtonClick("edit")}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    Edit Order
                                </button>
                            )}
                            {isEditMode && (
                                <>
                                    <button
                                        onClick={() => handleButtonClick("save")}
                                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => handleButtonClick("cancel")}
                                        className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <DraggableExperiences
                        trip={trip}
                        session_user_id={session_user_id}
                        isEditMode={isEditMode}
                        onEditAction={handleExperiencesEditAction}
                    />
                </div>
            </div>
        </div>
    );
}