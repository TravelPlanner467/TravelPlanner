'use client'

import {MapPinIcon, StarIcon} from "@heroicons/react/16/solid";
import {RemoveExperienceButton, ViewExperienceButton} from "@/app/(ui)/trips/buttons/trip-buttons";
import {TripExperience} from "@/lib/types";

interface ExperienceCardProps {
    experience: TripExperience;
    session_user_id: string;
    trip_id: string;
}

export default function TripExperiencesCard({ experience, session_user_id, trip_id }: ExperienceCardProps) {
    return (
        <div className="flex flex-col w-full p-3 border border-gray-300 rounded-lg bg-white hover:shadow-md transition-all">
            {/* Top Row - Title, Order/Rating Row  */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold line-clamp-1 flex-1">{experience.title}</h3>
                {/*<span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 shrink-0">*/}
                {/*    {experience.order > 0 ? `#${experience.order}` : "Unordered"}*/}
                {/*</span>*/}
                <div className="flex items-center text-yellow-600 ml-2 shrink-0">
                    <StarIcon className="w-4 h-4 mr-1" />
                    <span className="font-medium">{experience.average_rating ?? 'N/A'}</span>
                </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center text-gray-600 flex-1 min-w-0">
                    <MapPinIcon className="w-4 h-4 mr-1 shrink-0" />
                    <span className="truncate">{experience.location.address}</span>
                </div>

            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                {experience.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-row gap-2 mt-auto">
                <ViewExperienceButton experience_id={experience.experience_id}/>
                <RemoveExperienceButton
                    user_id={session_user_id}
                    experience_id={experience.experience_id}
                    trip_id={trip_id}
                />
            </div>
        </div>
    );
}
