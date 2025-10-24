'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon, PhotoIcon } from "@heroicons/react/16/solid";
import {Experience} from "@/lib/types";

interface ExperienceCardProps {
    userID: string;
    experience: Experience;
}

export default function UserExperiencesCard({ experience, userID }: ExperienceCardProps) {
    const router = useRouter();
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleClick = () => {
        router.push(`/account/experience/edit?q=${experience.experienceID}`);
    };


    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-lg p-3 border border-gray-200
            transition-all duration-200  hover:shadow-lg hover:scale-[1.01]"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-start my-2">
                <h3 className="text-2xl font-semibold text-gray-900">{experience.title}</h3>
                <p className="text-sm text-gray-500 whitespace-nowrap ml-4">{experienceDate}</p>
            </div>

            {/*Description*/}
            <p className="text-gray-700 leading-relaxed">{experience.description}</p>

            {/*Location*/}
            <div className="flex items-center my-2 text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2">
                    <MapPinIcon/>
                </svg>
                <p>{experience.address}</p>
            </div>

            {/*Keywords*/}
            <div className="flex flex-wrap my-2 gap-2">
                {experience.keywords.map((keyword, index) => (
                    <p key={index}
                       className="px-2 py-1 bg-blue-100 text-xs font-medium"
                    >
                        {keyword}
                    </p>
                ))}
            </div>

            {/*Photos*/}
            {experience.photos && experience.photos.length > 0 && (
                <div className="flex items-center my-2 text-sm text-gray-500">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                    >
                        <PhotoIcon/>
                    </svg>

                    {experience.photos.length} {experience.photos.length === 1 ? 'photo' : 'photos'}
                </div>
            )}
        </div>
    );
}
