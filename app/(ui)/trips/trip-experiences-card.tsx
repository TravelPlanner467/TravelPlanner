'use client'

import {MapPinIcon} from "@heroicons/react/16/solid";
import {RemoveExperienceButton, ViewExperienceTripButton} from "@/app/(ui)/trips/buttons/trip-buttons";

import {Experience} from "@/lib/types";

interface ExperienceCardProps {
    experience: Experience;
    session_user_id: string;
    trip_id: string;
}

export default function TripExperiencesCard({ experience, session_user_id, trip_id }: ExperienceCardProps) {
    return (
        <div
            className="flex flex-col w-80 min-h-32 p-3 justify-between
            border border-gray-500 rounded-lg
            transition-all hover:shadow-md"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-start my-2 h-2/5">
                <h3 className="text-xl font-semibold line-clamp-2">{experience.title}</h3>
            </div>

            {/*Location*/}
            <div className="flex items-center my-2 text-sm text-gray-600 h-2/5">
                <svg className="w-5 h-5 mr-2">
                    <MapPinIcon/>
                </svg>
                <p className="line-clamp-2">{experience.address}</p>
            </div>

            {/*Buttons*/}
            <div className="flex flex-row gap-2 h-1/5">
                <ViewExperienceTripButton trip_id={trip_id}/>
                <RemoveExperienceButton
                    user_id={session_user_id}
                    experience_id={experience.experience_id}
                    trip_id={trip_id}
                />
            </div>
        </div>
    );
}
