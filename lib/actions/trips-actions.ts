'use server'

import {
    Trip,
    TripIDProps,
    Experience,
    GetBatchExperiencesProps,
    ExperienceToTripsProps, UserTripsProps, ErrorResponse, EditTripProps, ExperiencesOrderProps,
} from "@/lib/types";

// CREATE ====================================================================
export async function createTrip(formData: any) {
    console.log(`createTrip: ${JSON.stringify(formData)}`);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/create-trip`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Upload successful:', result);

            return result;

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Upload failed:', error);
        return {
            error: "Error in: createTrip",
            message: `${error}`,
        };
    }
}

// READ ======================================================================
export async function getUserTrips(userID: string): Promise<UserTripsProps[] | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/user-trips`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": userID,
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result as UserTripsProps[];
        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Error in: getUserTrips",
            message: `${error}`,
        };
    }
}

export async function getTripDetails(formData: TripIDProps): Promise<Trip | ErrorResponse> {
    console.log("Getting Trip details: ", formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/get-trip-details/${formData.trip_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.session_user_id,
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`)
            console.log('message:', result);
            return result as Trip;

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Error in: getTripDetails",
            message: `${error}`,
        };
    }
}

// UPDATE ========================================================================
export async function editTrip(formData: EditTripProps) {
    console.log(`editTrip: ${JSON.stringify(formData)}`);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/edit-trip`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Edit successful:', result);
            setTimeout(() => {}, 2000);

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('editTrip failed:', error);
        return {
            error: "Error in: editTrip",
            message: `${error}`,
        };
    }
}

// DELETE ========================================================================
export async function deleteTrip (formData: TripIDProps) {
    console.log("Deleting Trip: ", formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/delete-trip/${formData.trip_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.session_user_id,
            },
        });

        if (response.ok) {
            console.log("sent DATA: ", formData)
            const result = await response.json();
            console.log('Delete Successful:', result);
            setTimeout(() => {}, 2000);

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Delete failed:', error);
        return {
            error: "Error in: deleteTrip",
            message: `${error}`,
        };
    }
}

export async function getTripExperienceDetails(formData: GetBatchExperiencesProps) {
    console.log("Getting Trip-Experiences details: ", formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/batch-experiences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`)
            console.log('message:', result);
            return result as Experience[];

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Error in: getTripExperienceDetails",
            message: `${error}`,
        };
    }
}

export async function addExperienceToTrip(formData: ExperienceToTripsProps) {
    console.log(formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/add-experience`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`)
            console.log('message:', result);
            return result as Trip;

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Error in: addExperienceToTrip",
            message: `${error}`,
        };
    }
}

export async function removeExperienceFromTrip(formData: ExperienceToTripsProps) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/remove-experience`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`)
            console.log('message:', result);
            return result as Trip;

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Error in: removeExperienceFromTrip",
            message: `${error}`,
        };
    }
}

export async function updateExperiencesOrder(formData: ExperiencesOrderProps) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/trips/update-experience-order`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': formData.session_user_id,
                },
                body: JSON.stringify({
                    trip_id: formData.trip_id,
                    updates: formData.updates,
                }),
            }
        );

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`);
            return result;
        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: 'Error in: updateExperiencesOrder',
            message: String(error),
        };
    }
}
