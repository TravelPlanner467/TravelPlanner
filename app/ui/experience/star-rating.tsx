// Star Rating Component
import {useState} from "react";

interface StarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
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