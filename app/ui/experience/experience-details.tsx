'use client'

import {Experience, ErrorResponse, Trip, UserTripsProps} from "@/lib/types";
import {CalendarDaysIcon, MapPinIcon} from "@heroicons/react/16/solid";
import {AddToTripButton} from "@/app/ui/experience/trip-features/add-to-trip-button";
import {RatingDisplay} from "@/app/ui/experience/buttons/star-rating";
import {RateExperienceButton} from "@/app/ui/experience/buttons/experience-buttons";

interface ExperienceDetailsProps {
    experience: Experience;
    user_id?: string;
    trips?: UserTripsProps[] | ErrorResponse;
}

export function ExperienceDetailsContent({ experience, trips, user_id }: ExperienceDetailsProps) {
    // Convert date string to displayable date
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check if user is logged in
    const isLoggedIn = !!user_id;

    // @ts-ignore
    return (
        <div className="w-full p-4">
            <div className="bg-white rounded-lg shadow-md p-8">
                {/*Top Row*/}
                <div className="flex flex-row justify-between items-center mb-6">
                    {/*Title & Date*/}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {experience.title}
                        </h1>
                        <div className="flex items-center text-gray-600 space-x-2">
                            <CalendarDaysIcon className="w-5 h-5" />
                            <p className="text-gray-600">{experienceDate}</p>
                        </div>
                    </div>

                    {/*Ratings*/}
                    <div className="flex flex-col justify-center items-center gap-2">
                        <RatingDisplay rating={experience.user_rating} />
                        {isLoggedIn && (
                            <RateExperienceButton user_id={user_id} experience_id={experience.experience_id} />
                        )}
                    </div>

                    {/*Add to Trip Button*/}
                    {isLoggedIn && (
                        <AddToTripButton
                            user_id={user_id}
                            experience_id={experience.experience_id}
                            trips={trips}/>
                    )}
                </div>


                {/*Description*/}
                <div className="mb-6">
                    <p className="text-lg text-gray-700 leading-relaxed">{experience.description}</p>
                </div>

                {/*Location*/}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Location
                    </h2>
                    <div className="flex items-start text-gray-700">
                        <MapPinIcon className="w-5 h-5 mt-2 mr-2"/>
                        <div>
                            <p className="font-medium">{experience.address}</p>
                            <p className="text-sm text-gray-500">
                                {experience.latitude}, {experience.longitude}
                            </p>
                        </div>
                    </div>
                </div>

                {/*Keywords*/}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Keywords</h2>
                    <div className="flex flex-wrap gap-2">
                        {experience.keywords.map((keyword, index) => (
                            <p key={index}
                                  className="px-2 py-1 bg-blue-100 text-xs font-medium"
                            >
                                {keyword}
                            </p>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}