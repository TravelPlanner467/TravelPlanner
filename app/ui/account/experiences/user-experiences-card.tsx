'use client'

import {MapPinIcon, PhotoIcon } from "@heroicons/react/16/solid";
import {Experience} from "@/lib/types";
import {EditExperienceButton, DeleteExperienceButton} from "@/app/ui/account/buttons/experience-buttons";

interface ExperienceCardProps {
    user_id: string;
    experience: Experience;
}

export default function UserExperiencesCard({ experience, user_id }: ExperienceCardProps) {
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


    return (
        <div
            className="bg-white rounded-lg py-2 px-4 border border-gray-200
            transition-all duration-200  hover:shadow"
        >
            {/*Top Row*/}
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-gray-900">{experience.title}</h3>

                {/*Keywords*/}
                <div className="flex flex-wrap gap-2">
                    {experience.keywords.map((keyword, index) => (
                        <p key={index}
                           className="px-2 py-1 text-xs font-medium border"
                        >
                            {keyword}
                        </p>
                    ))}
                </div>

                <p className="text-sm text-gray-500 whitespace-nowrap ml-4">{experienceDate}</p>
            </div>

            {/*MIDDLE ROW*/}
            <div className="my-4">
                {/*Description*/}
                <p className="text-gray-700 leading-relaxed">{experience.description}</p>
            </div>

            {/*BOTTOM ROW*/}
            <div className="flex flex-row justify-between items-start">
                {/*Location*/}
                <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2">
                        <MapPinIcon/>
                    </svg>
                    <p>{experience.address}</p>
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

                <div className="flex flex-row gap-2">
                    <EditExperienceButton experience_id={experience.experience_id} user_id={user_id} />
                    <DeleteExperienceButton experience_id={experience.experience_id} user_id={user_id} />
                </div>
            </div>


        </div>
    );
}
