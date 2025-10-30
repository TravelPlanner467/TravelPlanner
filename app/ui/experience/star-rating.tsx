// Star Rating Component
import {useState} from "react";
import {StarIcon} from "@heroicons/react/16/solid";

interface StarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
}

interface RatingDisplayProps {
    rating: number;
    showLabel?: boolean;
}

export function StarRating({ rating, setRating }: StarRatingProps) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex justify-center items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="text-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={`Rate ${star} out of 5 stars`}
                >
                    <span
                        className={`${
                            star <= (hover || rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    >
                        ★
                    </span>
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600 self-center">
                    {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
            )}
        </div>
    );
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

    console.log(rating)

    return (
        <div className="flex items-center gap-1">
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
                <p className="ml-2 text-sm text-gray-600">
                    {numericRating.toFixed(1)} {numericRating === 1 ? 'star' : 'stars'}
                </p>
            )}
        </div>
    );
}