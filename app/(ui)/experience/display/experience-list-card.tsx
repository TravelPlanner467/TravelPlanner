'use client'

import {useRouter} from 'next/navigation';
import {CalendarIcon, ChevronRightIcon, MapPinIcon, PhotoIcon} from "@heroicons/react/24/outline";

import {RatingDisplay} from "@/app/(ui)/experience/buttons/star-rating";
import {Experience} from "@/lib/types";
import {
    DeleteExperienceButton,
    EditExperienceButton,
    ViewExperienceButton
} from "@/app/(ui)/experience/buttons/experience-buttons";
import { KeywordsButtons } from "@/app/(ui)/components/keywords-buttons";

interface ExperienceListCardProps {
    experience: Experience;
    session_user_id?: string | null;
    variant?: ExperienceCardVariant;
    isHovered?: boolean;
    isSelected?: boolean;
    compact?: boolean
}

type ExperienceCardVariant = 'search' | 'user';

export function ExperienceListCard({ experience, session_user_id, compact = false }: ExperienceListCardProps) {
    const router = useRouter();
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check if user is owner of the card
    const isOwner =
        typeof session_user_id === 'string' &&
        session_user_id.length > 0 &&
        session_user_id === experience.user_id;

    // Set card variant
    const variant: ExperienceCardVariant = isOwner ? 'user' : 'search';

    const handleClick = () => {
        router.push(`/experience/details?q=${experience.experience_id}`);
    };

    // ================= USER/OWNER STYLE =================
    if (variant === 'user') {
        if (compact) {
            // COMPACT USER/OWNER STYLE
            return (
                <div className="group flex bg-white border border-gray-400 shadow-md rounded-xl hover:shadow-xl hover:border-blue-300 transition-all duration-200">
                    {/* LEFT: content */}
                    <div className="flex flex-1 min-w-0 p-3 hover:bg-gray-50/50 transition-colors">
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            {/* Top row: title + date */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex flex-col min-w-0">
                                    <h2 className="font-bold text-gray-900 truncate text-base">
                                        {experience.title}
                                    </h2>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {experienceDate}
                                    </p>
                                </div>

                                {/* Small inline actions for owner */}
                                {isOwner && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <ViewExperienceButton experience_id={experience.experience_id} />
                                        <EditExperienceButton experience_id={experience.experience_id} />
                                        <DeleteExperienceButton
                                            experience_id={experience.experience_id}
                                            user_id={session_user_id}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 leading-relaxed line-clamp-2 text-xs mb-1">
                                {experience.description}
                            </p>

                            {/* Location */}
                            <div className="flex items-center border-t border-gray-300 pt-2">
                                <MapPinIcon className="text-blue-600 shrink-0 w-3.5 h-3.5 mr-1" />
                                <p className="truncate text-gray-600 text-xs">
                                    {experience.address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // FULL USER/OWNER STYLE
        return (
            <div className="group flex bg-white border border-gray-400 shadow-md rounded-xl hover:shadow-xl hover:border-blue-300 transition-all duration-200">
                {/* LEFT: content */}
                <div className="flex flex-col flex-1 px-4 py-3 gap-2">
                    {/* TOP ROW */}
                    <div className="flex flex-row justify-between items-start gap-4">
                        {/* Date & Title */}
                        <div className="flex flex-col gap-2 min-w-0">
                            <h2 className="text-2xl font-semibold text-gray-900 line-clamp-1">
                                {experience.title}
                            </h2>

                            <div className="flex text-gray-700 items-center">
                                <CalendarIcon className="w-5 h-5 mr-1" />
                                <p className="text-sm">{experienceDate}</p>
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="hidden md:flex flex-wrap gap-2 justify-end max-w-xs">
                            <KeywordsButtons keywords={experience.keywords} buttonClassName="px-2 py-1 text-xs font-medium border rounded-md bg-white hover:bg-gray-50" />
                        </div>
                    </div>

                    {/* MIDDLE ROW */}
                    <div className="px-1">
                        <p className="text-gray-700 line-clamp-3">
                            {experience.description}
                        </p>
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="flex items-center mt-1">
                        <MapPinIcon className="w-5 h-5 mr-1 text-blue-600" />
                        <p className="truncate min-w-0 text-sm text-gray-600">
                            {experience.address}
                        </p>
                    </div>
                </div>

                {/* RIGHT: vertical buttons */}
                {isOwner && (
                    <div className="flex flex-col items-stretch justify-center gap-2 px-3 py-3 border-l border-gray-300 bg-gray-50">
                        <ViewExperienceButton experience_id={experience.experience_id} />
                        <EditExperienceButton experience_id={experience.experience_id} />
                        <DeleteExperienceButton
                            experience_id={experience.experience_id}
                            user_id={session_user_id}
                        />
                    </div>
                )}
            </div>
        );
    }

    // ================= GENERAL SEARCH STYLE (NO USER AUTH) =================
    return (
        <div className="group flex bg-white
                        border border-gray-400 shadow-md rounded-xl
                        hover:shadow-xl hover:border-blue-300 transition-all duration-200"
        >
            <div className={`flex-1 min-w-0 hover:bg-gray-50/50 transition-colors ${compact 
                            ? 'p-3' 
                            : 'p-6'}`}
            >
                {/*========TOP ROW===================================================================================*/}
                <div className={`flex w-full ${compact 
                                ? 'gap-2 mb-2' 
                                : 'gap-4 mb-4'}`}
                >
                    {/* Title & Date Section */}
                    <div className="flex flex-col flex-1 min-w-0">
                        <h2 className={`font-bold text-gray-900 truncate ${compact 
                                        ? 'text-base' 
                                        : 'text-2xl'}`}>
                            {experience.title}
                        </h2>
                        <p className={`text-gray-500 ${compact 
                                        ? 'text-xs mt-0.5' 
                                        : 'text-sm mt-1'}`}
                        >
                            {experienceDate}
                        </p>
                    </div>

                    {/* Ratings Section */}
                    <div className="flex justify-start xl:justify-center items-center shrink-0">
                        <RatingDisplay
                            rating={experience.average_rating}
                            rating_count={experience.rating_count}
                            compact={compact}
                        />
                    </div>
                </div>


                {/* ======Keywords Row ==============================================================================*/}
                {!compact && (
                    <div className="hidden xl:flex flex-wrap gap-2 mb-4">
                        <KeywordsButtons
                            keywords={experience.keywords}
                            buttonClassName="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                        />
                    </div>
                )}

                {/*========Description Row===========================================================================*/}
                <div className={compact ? 'mb-2' : 'mb-4'}>
                    <p className={`text-gray-700 leading-relaxed line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                        {experience.description}
                    </p>
                </div>

                {/*========Location & Photo Count====================================================================*/}
                <div className={`flex border-t border-gray-400 ${compact 
                                ? 'flex-col gap-1.5 pt-2' 
                                : 'flex-row gap-3 pt-4'}`}
                >
                    {/* Location */}
                    <div className="flex items-center flex-1 min-w-0">
                        <MapPinIcon className={`text-blue-600 shrink-0 ${compact 
                                                ? 'w-3.5 h-3.5 mr-1' 
                                                : 'w-5 h-5 mr-2'}`}
                        />
                        <p className={`truncate text-gray-600 ${compact 
                                        ? 'text-xs' 
                                        : 'text-sm'}`}>
                            {experience.address}
                        </p>
                    </div>

                    {/* Photo Count */}
                    <div className="flex items-center shrink-0">
                        <PhotoIcon className={`text-blue-600 shrink-0 ${compact
                                                ? 'w-3.5 h-3.5 mr-1'
                                                : 'w-5 h-5 mr-2'}`}
                        />
                        {experience.photos && experience.photos.length > 0 ? (
                            <p className={`text-gray-600 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                                {experience.photos.length} {experience.photos.length === 1 ? 'photo' : 'photos'}
                            </p>
                        ) : (
                            <p className={`text-gray-400 italic ${compact 
                                            ? 'text-xs' 
                                            : 'text-sm'}`}
                            >
                                No photos
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                className={`flex flex-col items-center justify-center
                            bg-blue-600 rounded-r-xl text-white font-semibold
                            hover:bg-blue-700 transition-all duration-200
                            cursor-pointer ${compact 
                            ? 'px-4 hover:px-6' 
                            : 'px-8 hover:px-10'}`}
                aria-label="View experience details"
            >
                {compact ? (
                    <ChevronRightIcon className="w-4 h-4" />
                ) : (
                    <>
                        <p className="text-sm">View</p>
                        <p className="text-sm">Details</p>
                        <ChevronRightIcon className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    );
}
