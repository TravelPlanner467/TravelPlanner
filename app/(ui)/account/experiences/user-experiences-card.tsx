'use client'

import {MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";
import {Experience} from "@/lib/types";
import {
    EditExperienceButton,
    DeleteExperienceButton,
    ViewExperienceButton
} from "@/app/(ui)/account/buttons/experience-buttons";

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
        <div className="flex flex-col w-full px-4 py-3 gap-1 border
                    border-gray-500 shadow-md rounded-lg">
            {/*==================================================================*/}
            {/* ======================TOP ROW====================== */}
            {/*==================================================================*/}
            <div className="flex flex-row justify-between items-center">
                {/*Date & Title*/}
                <div className="flex flex-col gap-2 justify-start w-3/5">
                    {/*Title*/}
                    <h2 className="text-2xl font-semibold text-gray-900 line-clamp-1">
                        {experience.title}
                    </h2>

                    {/*Date*/}
                    <div className="flex text-gray-700">
                        <CalendarIcon className="w-5 h-5 mr-1"/>
                        <p className="text-sm">{experienceDate}</p>
                    </div>
                </div>

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
            </div>

            {/*==================================================================*/}
            {/*======================MIDDLE ROW======================*/}
            {/*==================================================================*/}
            <div className="mt-2 px-3">
                {/*Description*/}
                <p className="text-gray-700 line-clamp-3">
                    {experience.description}
                </p>
            </div>

            {/*==================================================================*/}
            {/*======================BOTTOM ROW======================*/}
            {/*==================================================================*/}
            <div className="flex flex-row justify-between items-center mt-2">
                {/*Location*/}
                <div className="flex items-center w-3/5">
                    <svg className="w-5 h-5 mr-1">
                        <MapPinIcon/>
                    </svg>
                    <p className="truncate min-w-0 text-sm text-gray-600">
                        {experience.address}
                    </p>
                </div>

                {/*Buttons*/}
                <div className="flex flex-row gap-2">
                    <ViewExperienceButton experience_id={experience.experience_id} />
                    <EditExperienceButton experience_id={experience.experience_id} />
                    <DeleteExperienceButton experience_id={experience.experience_id} user_id={user_id} />
                </div>
            </div>
        </div>
    );
}
