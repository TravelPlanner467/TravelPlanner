// Star Rating Component
import {useState} from "react";
import {StarIcon} from "@heroicons/react/16/solid";

interface RatingDisplayProps {
    rating: number;
    showLabel?: boolean;
}

interface SelectableRatingProps {
    experience_rating?: number;
    onRatingChange: (rating: number) => void; // Add this callback prop
}

export function RatingDisplay({rating, showLabel = true}: RatingDisplayProps) {
    const stars = Array.from({ length: 5 }, (_, i) => i);

    const numericRating = Number(rating) || 0;

    const getStarFillPercentage = (starIndex: number) => {
        const difference = rating - starIndex;
        if (difference >= 1) return 100;
        if (difference <= 0) return 0;
        return difference * 100;
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex">
                {stars.map((starIndex) => {
                    const fillPercentage = getStarFillPercentage(starIndex);

                    return (
                        <div key={starIndex} className="relative w-8 h-8">
                            {/* Gray background star */}
                            <StarIcon className="w-8 h-8 text-gray-300 absolute" />

                            {/* Yellow filled portion */}
                            <div
                                className="overflow-hidden absolute top-0 left-0 h-full"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <StarIcon className="w-8 h-8 text-blue-300" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {showLabel && numericRating > 0 && (
                <p className="font-md text-gray-900">
                    {numericRating.toFixed(1)} {numericRating === 1 ? 'star' : 'stars'}
                </p>
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
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="relative w-8 h-8 transition-transform focus:outline-none focus:ring-2
                        focus:ring-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
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

            {rating > 0 && (
                <p className="text-sm text-gray-600">
                    {rating} {rating === 1 ? 'star' : 'stars'}
                </p>
            )}

        </div>
    );
}