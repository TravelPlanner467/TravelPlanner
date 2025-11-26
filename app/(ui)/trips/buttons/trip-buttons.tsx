'use client'

import Link from "next/link";
import {TrashIcon} from "@heroicons/react/24/outline";
import {deleteTrip, removeExperienceFromTrip} from "@/lib/actions/trips-actions";
import {ExperienceToTripsProps, TripIDProps} from "@/lib/types";
import {useState} from "react";
import {MinusIcon} from "@heroicons/react/16/solid";
import {useRouter} from "next/navigation";

export function NewTripButton() {
    return (
        <Link
            href={"/trips/new"}
            className={`w-48 h-10 flex justify-center items-center
                border-2 border-blue-800 rounded-lg
                hover:bg-blue-50 hover:shadow-lg hover:scale-[1.1]`}
        >
            <p className="text-center text-md font-medium text-blue-800">
                + New Trip
            </p>
        </Link>
    )
}

export function EditTripButton({trip_id}: { trip_id: string }) {
    return (
        <Link
            href={`/trips/edit?q=${trip_id}`}
            className={`w-32 h-10 flex justify-center items-center
                border-2 border-blue-800 rounded-lg
                hover:bg-blue-50 hover:shadow-lg hover:scale-[1.1]`}
        >
            <p className="text-center text-md font-medium text-blue-800">
                Edit
            </p>
        </Link>
    )
}

export function DeleteTripButton({session_user_id, trip_id}: TripIDProps) {
    const router = useRouter();
    const formData: TripIDProps = {session_user_id, trip_id}

    function onDeleteClick() {
        const result = confirm("Are you sure you want to delete this trip?");
        if (result) {
            deleteTrip(formData)
        }
        router.push("/trips");
    }

    return (
        <button
            onClick={onDeleteClick}
            className={`w-12 h-10 flex justify-center items-center
                border-2 border-red-800 rounded-lg
                hover:bg-red-50 hover:shadow-lg hover:scale-[1.1]`}
        >
            <TrashIcon className="w-5 h-5 text-red-800"/>
        </button>
    )
}

export function RemoveExperienceButton({user_id, experience_id, trip_id}: ExperienceToTripsProps) {
    const [statusMessage, setStatusMessage] = useState<{
        text: string;
        type: 'success' | 'error' | null;
    }>({ text: '', type: null });

    async function onRemoveClick() {
        const result = confirm("Are you sure you want to remove this trip?");
        if (result) {
            try {
                // Call server to remove experience from trip
                await removeExperienceFromTrip({user_id, experience_id, trip_id})
                window.location.reload();
            }
            catch (error) {
                setStatusMessage({
                    text: 'Something went wrong. Please try again.',
                    type: 'error'
                });
            }
        }
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={onRemoveClick}
                className={`w-12 h-8 flex justify-center items-center
                border-2 border-red-800 rounded-lg
                hover:bg-red-50 hover:shadow-lg hover:scale-[1.1]`}
            >
                <MinusIcon className="w-5 h-5 text-red-800"/>
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

export function ViewExperienceButton({experience_id}: { experience_id: string }) {
    return (
        <Link
            href={`/experience/details?q=${experience_id}`}
            className={`w-48 h-8 flex justify-center items-center
                border-2 border-blue-800 rounded-lg
                hover:bg-blue-50 hover:shadow-lg hover:scale-[1.1]`}
        >
            <p className="text-center text-sm font-medium">
                View Details
            </p>
        </Link>
    )
}