'use client'

import {useRouter} from 'next/navigation';
import {ChevronRightIcon, MapPinIcon, PhotoIcon} from "@heroicons/react/24/outline";

import {RatingDisplay} from "@/app/(ui)/experience/buttons/star-rating";
import {Experience} from "@/lib/types";

interface ExperienceCardProps {
    experience: Experience;
    isHovered?: boolean;
    isSelected?: boolean;
    compact?: boolean
}

export function SearchResultsCard({ experience, compact = false }: ExperienceCardProps) {
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
                        {experience.keywords.slice(0, 4).map((keyword, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700
                                           rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                {keyword}
                            </span>
                        ))}
                        {experience.keywords.length > 4 && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                                +{experience.keywords.length - 4} more
                            </span>
                        )}
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
