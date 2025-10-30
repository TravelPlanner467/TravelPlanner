'use client'

import Link from "next/link";
import {TrashIcon} from "@heroicons/react/24/outline";
import {deleteTrip, removeExperienceFromTrip} from "@/lib/actions/trips-actions";
import {ExperienceToTripsProps, TripIDProps} from "@/lib/types";
import {useState} from "react";

export function NewTripButton() {
    return (
        <Link
            href={"/trips/new"}
            className="w-[135px] px-6 py-2
                      text-center
                      border border-blue-800 shadow-sm rounded-lg
                      hover:shadow-lg hover:scale-[1.01]"
        >
            + New Trip
        </Link>
    )
}

export function EditTripButton({trip_id}: { trip_id: string }) {
    return (
        <Link
            href={`/trips/edit?q=${trip_id}`}
            className="bg-white rounded-lg px-3 py-2 text-sm border border-gray-200
            transition-all hover:shadow-lg hover:scale-[1.01]"
        >
            Edit
        </Link>
    )
}

export function DeleteTripButton({user_id, trip_id}: TripIDProps) {
    const formData: TripIDProps = {user_id, trip_id}

    function onDeleteClick() {
        const result = confirm("Are you sure you want to delete this trip?");
        if (result) {
            console.log(formData);
            deleteTrip(formData)
        }
    }

    return (
        <button
            onClick={onDeleteClick}
            className="bg-white rounded-lg px-3 text-sm border border-gray-200
            transition-all hover:shadow-lg hover:scale-[1.01]"
        >
            <svg className="w-4 h-4">
                <TrashIcon />
            </svg>
        </button>
    )
}

export function RemoveExperienceButton({user_id, experience_id, trip_id}: ExperienceToTripsProps) {
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