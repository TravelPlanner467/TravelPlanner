'use client'

import {Experience, ErrorResponse, Trip, UserTripsProps} from "@/lib/types";
import {CalendarDaysIcon, MapPinIcon} from "@heroicons/react/16/solid";
import {AddToTripButton} from "@/app/ui/experience/trip-features/add-to-trip-button";
import {RatingDisplay} from "@/app/ui/experience/buttons/star-rating";
import {RateExperienceButton} from "@/app/ui/experience/buttons/rate-experience-button";
import {useLayoutEffect, useRef, useState} from "react";

interface ExperienceDetailsProps {
    experience: Experience;
    user_id?: string;
    trips?: UserTripsProps[] | ErrorResponse;
}

export function ExperienceDetailsContent({ experience, trips, user_id }: ExperienceDetailsProps) {
    // States for Expanding/Collapsing Description
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    // Check height of description to determine if it should be truncated
    useLayoutEffect(() => {
        const element = textRef.current;
        if (element) {
            // Check if text is actually truncated
            setIsTruncated(element.scrollHeight > element.offsetHeight);
        }
    }, [experience.description]);

    // Convert date string to displayable date
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check if user is logged in
    const isLoggedIn = !!user_id;

    return (
        <div className="w-full p-6">
            <div className="flex flex-col p-8 gap-3 border border-gray-500 shadow-md rounded-lg ">
                {/* ========================================== */}
                {/* TOP ROW - Title, Date, Address, & Keywords */}
                {/* ========================================== */}
                <div className="flex flex-row justify-between">
                    {/*Title, Date & Address*/}
                    <div className="flex flex-col w-3/5">
                        {/*Title*/}
                        <h1 className="text-3xl font-bold line-clamp-1 text-gray-900 mb-2"
                            title={experience.title}
                        >
                            {experience.title}
                        </h1>
                        {/*Date*/}
                        <div className="flex items-center">
                            <CalendarDaysIcon className="w-5 h-5 shrink-0 mr-1" />
                            <p className="font-medium text-gray-900">
                                {experienceDate}
                            </p>
                        </div>
                        {/*Address*/}
                        <div className="flex flex-row items-center">
                            <MapPinIcon className="w-5 h-5 flex-shrink-0 mr-1"/>
                            <div>
                                <p className="line-clamp-2 text-gray-600">
                                    {experience.address}
                                </p>
                                {/*<p className="text-sm text-gray-500">*/}
                                {/*    {experience.latitude}, {experience.longitude}*/}
                                {/*</p>*/}
                            </div>
                        </div>
                    </div>

                    {/*Keywords*/}
                    <div className="flex flex-col justify-center items-start gap-2 w-2/5">
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

                {/* ========================================== */}
                {/* SECTION 2 - Ratings & Add to Trip Button */}
                {/* ========================================== */}
                <div className="flex flex-row justify-between items-center gap-6">
                    {/*Ratings*/}
                    <div className="flex flex-row justify-start items-center gap-6">
                        <RatingDisplay rating={experience.average_rating} />
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

                {/* ========================================== */}
                {/* SECTION 3 - Photos*/}
                {/* ========================================== */}
                <div className="flex items-center justify-center w-full
                                border border-gray-800 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-900 py-64">
                        TODO: DISPLAY PHOTOS HERE
                    </h2>
                </div>

                {/* ========================================== */}
                {/*SECTION 4 - Description*/}
                {/* ========================================== */}
                <div className="flex flex-col w-full">
                    {/*Header*/}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Description
                    </h2>
                    {/*Description*/}
                    <p ref={textRef}
                       className={`text-md text-gray-700 leading-relaxed ${
                            !isExpanded ? 'line-clamp-4' : ''
                        }`}
                    >
                        {experience.description}
                    </p>
                    {/*"See More" button*/}
                    {isTruncated && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-blue-600 hover:text-blue-700 font-medium self-end"
                        >
                            {isExpanded ? 'Show Less' : 'See More'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}