'use client'
import {useState} from "react";
import {CreateTrip} from "@/app/ui/trip-planner/create-trip";

export default function NewTripButton() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => setIsPopupOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                + New Trip
            </button>

            <CreateTrip
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
            />
        </div>
    );
}