'use client'

import {useRouter} from 'next/navigation';
import {ChevronRightIcon, MapPinIcon, PhotoIcon} from "@heroicons/react/24/outline";

import {RatingDisplay} from "@/app/(ui)/experience/buttons/star-rating";
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
        <div className="group flex bg-white
                        border border-gray-400 shadow-md rounded-xl
                        hover:shadow-xl hover:border-blue-300 transition-all duration-200"
        >
            <div
                className="flex-1 p-6 hover:bg-gray-50/50 transition-colors"
            >
                {/*========TOP ROW=======================================================================================*/}
                <div className="flex w-full gap-4 mb-4">
                    {/* Title & Date Section */}
                    <div className="flex flex-col flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 truncate">
                            {experience.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {experienceDate}
                        </p>
                    </div>

                    {/* Ratings Section */}
                    <div className="flex justify-center items-start shrink-0">
                        <RatingDisplay rating={experience.average_rating} rating_count={experience.rating_count} />
                    </div>
                </div>


                {/* ======Keywords Row ======================================================================================*/}
                <div className="flex flex-wrap gap-2 mb-4">
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

                {/*========Description Row====================================================================================*/}
                <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed line-clamp-3">
                        {experience.description}
                    </p>
                </div>

                {/*========BOTTOM ROW====================================================================================*/}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    {/* Location */}
                    <div className="flex items-center flex-1 min-w-0">
                        <MapPinIcon className="w-5 h-5 mr-2 text-blue-600 shrink-0" />
                        <p className="truncate text-sm text-gray-600">
                            {experience.address}
                        </p>
                    </div>

                    {/* Photo Count */}
                    <div className="flex items-center shrink-0">
                        <PhotoIcon className="w-5 h-5 mr-2 text-blue-600" />
                        {experience.photos && experience.photos.length > 0 ? (
                            <p className="text-sm text-gray-600 font-medium">
                                {experience.photos.length} {experience.photos.length === 1 ? 'photo' : 'photos'}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No photos</p>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleClick();
                }}
                className="flex flex-col gap-2 px-6 items-center justify-center
                           bg-blue-600 rounded-r-xl text-white font-semibold
                           hover:bg-blue-700 hover:px-8 transition-all duration-200
                           cursor-pointer"
                aria-label="View experience details"
            >
                <span className="text-sm whitespace-nowrap writing-mode-vertical sm:writing-mode-horizontal">
                    View Details
                </span>
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
    );
}
