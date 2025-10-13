'use client'
import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

import {deleteTrips} from "@/app/ui/trip-planner/trip-planner-actions";

interface DeleteButtonProps {
    tripID: string;
    onDeleteSuccess?: () => void;
}

export function DeleteTrip({ tripID, onDeleteSuccess }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete trip #${tripID}? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        setError(null);
        try {
            const result = await deleteTrips(tripID);

            if (result.success) {
                // Call the callback function if it exists
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }
            } else {
                setError(result.error as string);
            }
        } catch (err) {
            setError('Failed to delete trip. Please try again.');
            console.error('Error deleting trip:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Delete trip"
            >
                <TrashIcon className="h-5 w-5" />
            </button>

            {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
            )}
        </div>
    );
}