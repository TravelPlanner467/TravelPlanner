'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon, PhotoIcon} from "@heroicons/react/16/solid";
import {Experience} from "@/lib/types";

interface ExperienceCardProps {
    experience: Experience;
}

export default function RecommendationsCard({ experience }: ExperienceCardProps) {
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
            className="bg-white rounded-lg py-2 px-4 border border-gray-400
            transition-all duration-200  hover:shadow-lg hover:scale-[1.005]"
        >
            {/*Top Row*/}
            <div className="flex flex-col justify-between items-center">
                {/*Title*/}
                <h3 className="text-2xl font-semibold text-gray-900">{experience.title}</h3>
                {/* Experiences Date*/}
                <p className="text-sm text-gray-500">{experienceDate}</p>
            </div>

            {/*MIDDLE ROW*/}
            <div className="my-4">
                {/*Description*/}
                <p className="text-gray-700">{experience.description}</p>
            </div>

            {/*BOTTOM ROW*/}
            {/*Location*/}
            <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-1"/>
                <p className="truncate">
                    {experience.address}
                </p>
            </div>

            {/*Photos*/}
            {/*{experience.imageURLs && experience.imageURLs.length > 0 && (*/}
            {/*    <div className="flex items-center text-sm text-gray-500">*/}
            {/*        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"*/}
            {/*        >*/}
            {/*            <PhotoIcon/>*/}
            {/*        </svg>*/}

            {/*        {experience.imageURLs.length} {experience.imageURLs.length === 1 ? 'photo' : 'photos'}*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
}
