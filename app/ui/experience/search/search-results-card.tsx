'use client'

import { useRouter } from 'next/navigation';
import {MapPinIcon, PhotoIcon } from "@heroicons/react/16/solid";
import {Experience} from "@/lib/types";

interface ExperienceCardProps {
    experience: Experience;
}

export default function SearchResultsCard({ experience }: ExperienceCardProps) {
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
            className="bg-white rounded-lg py-2 px-4 border border-gray-300
            transition-all hover:shadow-lg hover:scale-[1.01]"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-center">
                {/*Title*/}
                <h2 className="text-2xl font-semibold text-gray-900 truncate min-w-0 w-2/5">
                    {experience.title}
                </h2>

                {/*Keywords*/}
                <div className="flex flex-wrap gap-2 w-2/5 min-w-0">
                    {experience.keywords.map((keyword, index) => (
                        <p key={index}
                           className="px-2 py-1 text-xs font-medium border"
                        >
                            {keyword}
                        </p>
                    ))}
                </div>

                {/*Experience Date*/}
                <p className="text-sm text-gray-500 whitespace-nowrap w-1/5 text-right">
                    {experienceDate}
                </p>
            </div>

            {/*MIDDLE ROW*/}
            <div className="my-4">
                {/*Description*/}
                <p className="text-gray-700">{experience.description}</p>
            </div>

            {/*BOTTOM ROW*/}
            <div className="flex flex-row justify-between items-start">
                {/*Location*/}
                <div className="flex w-3/5 items-center ">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <p className="truncate text-sm text-gray-600">
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
        </div>
    );
}
