'use client';

import TripExperiencesCard from "@/app/(ui)/trips/trip-experiences-card";
import { TripExperience } from "@/lib/types";

interface TripExperiencesListProps {
    experiences: TripExperience[];
    session_user_id: string;
    trip_id: string;
}

export default function TripExperiencesList({
                                                experiences,
                                                session_user_id,
                                                trip_id,
                                            }: TripExperiencesListProps) {
    if (!experiences || experiences.length === 0) {
        return (
            <div className="w-full px-4 py-6 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                No experiences added to this trip yet.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {experiences.map((experience) => (
                <TripExperiencesCard
                    key={experience.experience_id}
                    experience={experience}
                    session_user_id={session_user_id}
                    trip_id={trip_id}
                />
            ))}
        </div>
    );
}
