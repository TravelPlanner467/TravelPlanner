'use client'

import {useState} from "react";
import {SelectableRating} from "@/app/(ui)/experience/buttons/star-rating";
import {rateExperience} from "@/lib/actions/experience-actions";

interface RateExperienceProps {
    user_id: string;
    experience_id: string;
}

export function RateExperienceButton({user_id, experience_id}: RateExperienceProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);

    // Open/Close Popup Box
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleRatingSubmit = (rating: number) => {
        const formData = {
            session_user_id: user_id,
            experience_id: experience_id,
            rating: rating
        }
        rateExperience(formData)
        // TODO - Add success/error messages

        setTimeout(() => {
            handleClose();
        }, 500);
    };

    return (
        <div>
            <button
                onClick={handleOpen}
                className="bg-white rounded-lg px-3 py-2 text-sm border border-gray-700
                transition-all hover:shadow-lg hover:scale-[1.01]"
            >
                Leave Review
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Rate This Experience
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="py-6">
                            <p className="text-center text-gray-600 mb-4">
                                How would you rate this experience?
                            </p>
                            <SelectableRating experience_rating={rating} onRatingChange={setRating} />
                        </div>

                        <div className="flex justify-center items-center">
                            <button
                                onClick={() => handleRatingSubmit(rating)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}