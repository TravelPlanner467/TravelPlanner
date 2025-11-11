'use client'

import {useRouter} from 'next/navigation';
import {MapPinIcon} from "@heroicons/react/24/outline";
import {Experience} from "@/lib/types";
import {RatingDisplay} from "@/app/(ui)/experience/buttons/star-rating";

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
            className="flex flex-col py-3 px-4 border border-gray-500 shadow-md
                       rounded-lg transition-all hover:shadow-lg hover:scale-[1.02]"
        >
            {/*========TOP ROW=======================================================================================*/}
            <div className="flex w-full">
                <div className="flex flex-col w-1/2">
                    {/*Title*/}
                    <h2 className="text-2xl font-semibold text-gray-900 truncate">
                        {experience.title}
                    </h2>
                    {/*Experience Date*/}
                    <p className="text-sm text-gray-600">
                        {experienceDate}
                    </p>
                </div>

                {/*Ratings*/}
                <div className="flex justify-center w-1/4">
                    <RatingDisplay rating={experience.average_rating} rating_count={experience.rating_count} />
                </div>

                {/*Keywords*/}
                <div className="flex flex-wrap justify-start items-start gap-2 w-1/4">
                    {experience.keywords.map((keyword, index) => (
                        <p key={index} className="px-2 py-1 text-xs font-medium border">
                            {keyword}
                        </p>
                    ))}
                </div>
            </div>

            {/*========MIDDLE ROW====================================================================================*/}
            <div className="my-4 px-3">
                {/*Description*/}
                <p className="text-gray-700 line-clamp-4">
                    {experience.description}
                </p>
            </div>

            {/*========BOTTOM ROW====================================================================================*/}
            <div className="flex flex-row justify-between items-start">
                {/*Location*/}
                <div className="flex w-3/5 items-center ">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <p className="truncate text-sm text-gray-600">
                        {experience.address}
                    </p>
                </div>
            </div>
        </div>
    );
}
