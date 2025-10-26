'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon, PhotoIcon } from "@heroicons/react/16/solid";
import {Experience} from "@/lib/types";

interface ExperienceCardProps {
    experience: Experience;
}

export default function TripExperiencesCard({ experience }: ExperienceCardProps) {
    const router = useRouter();
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleClick = () => {
        router.push(`/experience/details?q=${experience.experience_id}`);
    };


    return (
        <div
            onClick={handleClick}
            className="bg-white p-3 border border-gray-200
            w-80
            transition-all hover:shadow-lg hover:scale-[1.01]"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-start my-2">
                <h3 className="text-xl font-semibold">{experience.title}</h3>
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
