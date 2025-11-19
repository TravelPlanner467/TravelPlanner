import {useState} from "react";
import {ErrorResponse, UserTripsProps} from "@/lib/types";
import {addExperienceToTrip} from "@/lib/actions/trips-actions";

export interface AddExperienceToTripButtonProps {
    experience_id: string;
    user_id: string;
    trips?: UserTripsProps[] | ErrorResponse;
}

export function AddToTripButton({user_id, experience_id, trips}: AddExperienceToTripButtonProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{
        text: string;
        type: 'success' | 'error' | null;
    }>({ text: '', type: null });

    function toggleDropdown() {
        setIsDropdownOpen(!isDropdownOpen);
        // Clear any existing status messages
        if (statusMessage.text) {
            setStatusMessage({ text: '', type: null });
        }
    };

    async function addToTrip(trip_id: string, tripName: string) {
        setIsLoading(true);

        try {
            const result = await addExperienceToTrip({
                user_id: user_id!,
                experience_id: experience_id!,
                trip_id
            });

            if ('error' in result) {
                setStatusMessage({
                    text: `Failed to add to trip: ${result.message}`,
                    type: 'error'
                });
            } else {
                setStatusMessage({
                    text: `Added to "${tripName}"`,
                    type: 'success'
                });

                // Automatically close dropdown after success
                setTimeout(() => {
                    setIsDropdownOpen(false);
                    setStatusMessage({ text: '', type: null });
                }, 2000);
            }
        } catch (error) {
            setStatusMessage({
                text: 'Error. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Check if we have valid trips
    const validTrips = trips && !('error' in trips) && trips.length > 0;


    return (
        <div className="relative inline-block text-left">
            <button
                onClick={toggleDropdown}
                className="w-36 px-4 py-2 bg-blue-600 text-white line-clamp-1
                rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : '+ Add to Trip'}
            </button>

            {/* Status message */}
            {statusMessage.text && (
                <div className={`mt-2 text-sm ${
                    statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                    {statusMessage.text}
                </div>
            )}

            {/* Dropdown menu */}
            {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg
                                bg-white border border-gray-300 ring-1 ring-black ring-opacity-5
                                focus:outline-none z-10">
                    {/*Dropdown Header*/}
                    <div className="py-1 border-b border-gray-100">
                        <p className="py-2 text-center text-sm font-medium text-gray-800">
                            Select a trip
                        </p>
                    </div>

                    {/*Trips List*/}
                    <div className="max-h-60 overflow-y-auto">
                        {validTrips ? (
                            <div className="py-1">
                                {(trips as UserTripsProps[]).map((trip) => (
                                    <button
                                        key={trip.trip_id}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 "
                                        onClick={() => addToTrip(trip.trip_id, trip.title)}
                                    >
                                        <div className="text-sm font-medium
                                                        text-gray-700 hover:text-gray-900"
                                        >
                                            {trip.title}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                {trips && 'error' in trips
                                    ? trips.message
                                    : "You don't have any trips yet. Create a trip first."}
                            </div>
                        )}
                    </div>

                    {/*Cancel Button*/}
                    <div className="border-t border-gray-100">
                        <button
                            className="block w-full text-center px-4 py-2
                                        text-sm text-gray-700
                                        hover:bg-gray-100 hover:text-gray-900"
                            onClick={toggleDropdown}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}