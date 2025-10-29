import {useState} from "react";
import {ExperienceTripProps} from "@/lib/types";
import {removeExperienceFromTrip} from "@/lib/actions/trips-actions";
import {TrashIcon} from "@heroicons/react/24/outline";

export function RemoveExperienceButton({user_id, experience_id, trip_id}: ExperienceTripProps) {
    const [statusMessage, setStatusMessage] = useState<{
        text: string;
        type: 'success' | 'error' | null;
    }>({ text: '', type: null });

    function onRemoveClick() {
        const result = confirm("Are you sure you want to remove this trip?");
        if (result) {
            try {
                console.log(user_id, experience_id, trip_id);
                removeExperienceFromTrip({user_id, experience_id, trip_id})
            } catch (error) {
                setStatusMessage({
                    text: 'Something went wrong. Please try again.',
                    type: 'error'
                });
            }
        }
    }

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={onRemoveClick}
                className="bg-white rounded-lg px-3 text-sm border border-gray-200
                    transition-all hover:shadow-lg hover:scale-[1.01]"
            >
                <svg className="w-4 h-4">
                    <TrashIcon />
                </svg>
            </button>

            {/* Status message */}
            {statusMessage.text && (
                <div className={`mt-2 text-sm ${
                    statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                    {statusMessage.text}
                </div>
            )}
        </div>
    );

}