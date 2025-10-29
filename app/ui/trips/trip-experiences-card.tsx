'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon, PhotoIcon } from "@heroicons/react/16/solid";
import {Experience} from "@/lib/types";
import {RemoveExperienceButton} from "@/app/ui/trips/buttons/remove-experience-button";
import {NavButton} from "@/app/ui/components/buttons/nav-buttons";

interface ExperienceCardProps {
    experience: Experience;
    session_user_id: string;
    trip_id: string;
}

export default function TripExperiencesCard({ experience, session_user_id, trip_id }: ExperienceCardProps) {
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div
            className="w-80 p-3 border border-gray-200
            transition-all hover:shadow-md"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-start my-2">
                <h3 className="text-xl font-semibold">{experience.title}</h3>
                <div className="flex flex-row gap-2">
                    <NavButton link={`/experience/details?q=${experience.experience_id}`}
                               text={"View"} />
                    <RemoveExperienceButton
                        user_id={session_user_id}
                        experience_id={experience.experience_id}
                        trip_id={trip_id}
                    />
                </div>

            </div>

            {/*Location*/}
            <div className="flex items-center my-2 text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2">
                    <MapPinIcon/>
                </svg>
                <p>{experience.address}</p>
            </div>

        </div>
    );
}
