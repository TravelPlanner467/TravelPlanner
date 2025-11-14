'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon} from "@heroicons/react/24/outline";
import {Experience} from "@/lib/types";

interface ExperienceCardProps {
    experience: Experience;
    isHovered?: boolean;
    isSelected?: boolean;
}

export default function MapExperienceListCard({ experience, isHovered, isSelected }: ExperienceCardProps) {
    const router = useRouter();

    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleClick = () => {
        console.log(experience.experience_id);
    };

    return (
        <div
            onClick={handleClick}
            className="min-w-0 w-full bg-white border-b border-gray-600 p-4 cursor-pointer
            transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
        >
            {/*Title & Date*/}
            <div className="flex flex-col gap-1 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {experience.title}
                </h3>
                <p className="text-xs text-gray-500">{experienceDate}</p>
            </div>

            {/*Description*/}
            <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                {experience.description}
            </p>

            {/*Location*/}
            <div className="flex items-start gap-1.5 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0"/>
                <p className="line-clamp-2 text-xs">
                    {experience.address}
                </p>
            </div>
        </div>
    );
}
