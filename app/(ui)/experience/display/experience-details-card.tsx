'use client'

import {useLayoutEffect, useMemo, useRef, useState, useEffect} from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import {CalendarDaysIcon, MapPinIcon} from "@heroicons/react/16/solid";

import LightboxImage from "@/app/(ui)/experience/display/lightbox-image";
import {AddToTripButton} from "@/app/(ui)/experience/buttons/add-to-trip-button";
import {RatingDisplay} from "@/app/(ui)/experience/buttons/star-rating";
import {RateExperienceButton} from "@/app/(ui)/experience/buttons/rate-experience-button";
import {Experience, ErrorResponse, UserTripsProps} from "@/lib/types";
import {Inline, Thumbnails} from "yet-another-react-lightbox/plugins";
import { KeywordsButtons } from "@/app/(ui)/components/keywords-buttons";
import {getUserTrips} from "@/lib/actions/trips-actions";  // ADD THIS IMPORT

interface ExperienceDetailsProps {
    experience: Experience;
    user_id?: string;
    // REMOVED: trips prop - we'll fetch it here instead
    experienceAuthor: string;
}

export function ExperienceDetailsContent({ experience, user_id, experienceAuthor }: ExperienceDetailsProps) {
    // States for Expanding/Collapsing Description
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    // NEW: Fetch trips client-side
    const [trips, setTrips] = useState<UserTripsProps[] | ErrorResponse | undefined>(undefined);
    const [isLoadingTrips, setIsLoadingTrips] = useState(false);

    // NEW: Fetch trips when user_id is available
    useEffect(() => {
        if (user_id) {
            setIsLoadingTrips(true);
            getUserTrips(user_id)
                .then(setTrips)
                .catch((error) => {
                    console.error('Error fetching trips:', error);
                    setTrips(undefined);
                })
                .finally(() => setIsLoadingTrips(false));
        }
    }, [user_id]);

    // Load photos from server data
    const slides = useMemo(() => {
        return experience.photos.map((photo) => ({
            src: photo.photo_url,
            width: 1600,
            height: 900, // 16:9 aspect ratio
        }));
    }, [experience.photos]);

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
        <div className="w-3/4 p-6">
            <div className="bg-white border border-gray-200 shadow-lg rounded-2xl
                            overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
                <div className="p-8 pb-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                        {/* ========================================== */}
                        {/* Section 1 - Title, Date, Address, Keywords */}
                        {/* ========================================== */}
                        <div className="flex flex-col lg:w-3/5">
                            {/*Title*/}
                            <h1 className="text-3xl font-bold text-gray-900 mb-3"
                                title={experience.title}
                            >
                                {experience.title}
                            </h1>
                            {/*Date & Author*/}
                            <div className="flex items-center mb-2">
                                <CalendarDaysIcon className="w-5 h-5 shrink-0 mr-2 text-blue-600" />
                                <p className="text-sm font-medium text-gray-700">
                                    {experienceDate} <span className="text-gray-500">by</span> {experienceAuthor}
                                </p>
                            </div>
                            {/*Address*/}
                            <div className="flex flex-row items-start">
                                <MapPinIcon className="w-5 h-5 flex-shrink-0 mr-2 text-blue-600 mt-0.5"/>
                                <p className="text-sm line-clamp-2 text-gray-600">
                                    {experience.address}
                                </p>
                            </div>
                        </div>

                        {/*Keywords*/}
                        <div className="flex flex-col justify-start lg:items-end lg:w-2/5">
                            <KeywordsButtons
                                keywords={experience.keywords}
                                buttonClassName="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                            />
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* SECTION 2 - Ratings & Add to Trip Button   */}
                    {/* ========================================== */}
                    <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-gray-200
                                    sm:flex-row sm:justify-between sm:items-center"
                    >
                        {/*Ratings*/}
                        <div className="flex flex-row items-center gap-4">
                            <RatingDisplay rating={experience.average_rating} rating_count={experience.rating_count}/>
                            {isLoggedIn && (
                                <RateExperienceButton user_id={user_id} experience_id={experience.experience_id} />
                            )}
                        </div>

                        {/*Add to Trip Button - UPDATED with loading state*/}
                        {isLoggedIn && (
                            <>
                                {isLoadingTrips ? (
                                    <button
                                        disabled
                                        className="w-36 px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
                                    >
                                        Loading...
                                    </button>
                                ) : (
                                    <AddToTripButton
                                        user_id={user_id}
                                        experience_id={experience.experience_id}
                                        trips={trips}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* SECTION 3 - Photos                         */}
                {/* ========================================== */}
                {slides.length > 0 && (
                    <div className="flex w-full px-8 pb-6  justify-center items-center">
                        <div className="w-full max-w-4xl border border-gray-300 rounded-xl
                                        overflow-hidden shadow-sm hover:shadow-md transition-shadow
                                        lightbox-container"
                        >
                            <Lightbox
                                slides={slides}
                                plugins={slides.length > 1 ? [Inline, Thumbnails] : [Inline]}
                                styles={{
                                    container: {
                                        backgroundColor: "rgba(0, 0, 0, 0.95)"
                                    },
                                    thumbnailsContainer: {
                                        backgroundColor: "rgba(0, 0, 0, 0.95)"
                                    }
                                }}
                                inline={{
                                    style: {
                                        width: "100%",
                                        aspectRatio: "16 / 10",
                                    }
                                }}
                                carousel={{
                                    finite: true,
                                    padding: 0,
                                    spacing: 0,
                                }}
                                render={{
                                    slide: LightboxImage,
                                    thumbnail: LightboxImage,
                                    buttonPrev: slides.length <= 1 ? () => null : undefined,
                                    buttonNext: slides.length <= 1 ? () => null : undefined,
                                }}
                                thumbnails={slides.length > 1 ? {
                                    position: "bottom",
                                    width: 100,
                                    height: 60,
                                    gap: 12,
                                    padding: 0,
                                    border: 0,
                                } : undefined}
                            />
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* SECTION 4 - Description                    */}
                {/* ========================================== */}
                <div className="px-8 pb-8">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        {/*Header*/}
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-1 h-6 bg-blue-600 rounded mr-3"></span>
                            Description
                        </h2>

                        {/*Description*/}
                        <p ref={textRef}
                           className={`text-base text-gray-700 leading-relaxed ${
                               !isExpanded ? 'line-clamp-4' : ''
                           }`}
                        >
                            {experience.description}
                        </p>

                        {/*"See More" button*/}
                        {isTruncated && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors"
                            >
                                {isExpanded ? '↑ Show Less' : '↓ See More'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}