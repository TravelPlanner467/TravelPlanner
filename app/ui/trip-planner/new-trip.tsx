'use client'
import {useState} from "react";
import {CreateTrip} from "@/app/ui/trip-planner/create-trip";
import {useRouter} from "next/navigation";

export default function NewTripButton() {
    const router = useRouter();

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => router.push("/trip-planner/new")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                + New Trip
            </button>
        </div>
    );
}