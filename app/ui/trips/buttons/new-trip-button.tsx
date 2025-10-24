'use client'

import {useRouter} from "next/navigation";

export default function NewTripButton() {
    const router = useRouter();

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => router.push("/trips/new")}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                + New Trip
            </button>
        </div>
    );
}