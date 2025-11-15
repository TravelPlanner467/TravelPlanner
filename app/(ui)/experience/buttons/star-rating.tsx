// Star Rating Component
import {useState} from "react";
import {StarIcon} from "@heroicons/react/16/solid";

interface RatingDisplayProps {
    rating: number;
    rating_count: number;
    showLabel?: boolean;
    compact?: boolean;
}

interface SelectableRatingProps {
    experience_rating?: number;
    onRatingChange: (rating: number) => void;
}

export function RatingDisplay({rating, showLabel = true, rating_count, compact = false}: RatingDisplayProps) {
    const stars = Array.from({ length: 5 }, (_, i) => i);
    const numericRating = Number(rating) || 0;

    // Convert rating to percentage for coloring the Stars Display
    const getStarFillPercentage = (starIndex: number) => {
        const difference = rating - starIndex;
        if (difference >= 1) return 100;
        if (difference <= 0) return 0;
        return difference * 100;
    };

    const starSize = compact ? 'w-5 h-5' : 'w-7 h-7';

    return (
        <div className={`flex flex-col items-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
            {/* Stars */}
            <div className="flex items-center md:gap-0.5">
                {stars.map((starIndex) => {
                    const fillPercentage = getStarFillPercentage(starIndex);

                    return (
                        <div key={starIndex} className={`relative ${starSize}`}>
                            {/* Gray background star */}
                            <StarIcon className={`${starSize} text-gray-300 absolute drop-shadow-sm`} />

                            {/* Gradient filled portion */}
                            <div
                                className="overflow-hidden absolute top-0 left-0 h-full"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <StarIcon className={`relative ${starSize} 
                                                    text-blue-400 drop-shadow-sm`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rating */}
            {showLabel && numericRating > 0 && (
                <div className={`flex items-center ${compact ? 'gap-1.5 px-2' : 'gap-2 px-3'}`}>
                    {/*Average Score*/}
                    <div className="flex items-baseline gap-1">
                        <span className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
                            {numericRating.toFixed(1)}
                        </span>
                        <span className={`font-medium text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                            / 5
                        </span>
                    </div>

                    {/*Divider*/}
                    <div className={`w-px bg-gray-300 ${compact ? 'h-3' : 'h-4'}`} />

                    {/*Review Count*/}
                    <p className={`font-medium text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                        {rating_count?.toLocaleString() || 0} {rating_count === 1 ? 'review' : 'reviews'}
                    </p>
                </div>
            )}
        </div>
    );
}

export function SelectableRating({experience_rating = 0, onRatingChange}: SelectableRatingProps) {
    const [rating, setRating] = useState(experience_rating);
    const [hover, setHover] = useState(0);

    function handleRatingClick(selectedRating: number) {
        setRating(selectedRating);
        onRatingChange(selectedRating);
    }

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="relative w-7 h-7 flex items-center justify-center
                                   transition-transform focus:outline-none focus:ring-2
                                   focus:ring-blue-500 rounded disabled:opacity-50
                                   disabled:cursor-not-allowed hover:scale-110"
                    >
                        <StarIcon
                            className={`w-8 h-8 transition-colors ${
                                star <= (hover || rating)
                                    ? 'text-blue-300'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
            </div>

            {/*{rating > 0 && (*/}
            {/*    <p className="text-sm text-gray-600">*/}
            {/*        {rating} {rating === 1 ? 'star' : 'stars'}*/}
            {/*    </p>*/}
            {/*)}*/}

        </div>
    );
}