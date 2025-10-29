'use server'

import trips from "@/public/trips.json"
import experiences from "@/public/experiences.json";
import {
    Trip,
    TripIDProps,
    ErrorResponse,
    Experience,
    ExperienceTripProps,
    GetBatchExperiencesProps
} from "@/lib/types";
import {demoGetExperienceByID} from "@/lib/actions/experience-actions";


export async function getUserTrips(userID: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/user-trips`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": userID,
            },
        });

        const result = await response.json();
        return result;

    } catch (error: any) {
        console.error(error.message);
        return null;
    }
}

export async function createTrip(formData: any) {
    console.log(formData);
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
            setTimeout(() => {}, 2000);

        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Upload failed:', error);
        return {
            error: "Unknown Error",
            message: `${error}`,
        };
    }
}

export async function getTripDetails(formData: TripIDProps) {
    console.log("Getting Trip details: ", formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/get-trip-details/${formData.trip_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
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
                error: `${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Unknown Error",
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
                error: `${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Unknown Error",
            message: `${error}`,
        };
    }
}

export async function deleteTrip (formData: TripIDProps) {
    console.log("Deleting Trip: ", formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/delete-trip/${formData.trip_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
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
                error: `${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Delete failed:', error);
        return {
            error: "Unknown Error",
            message: `${error}`,
        };
    }
}

export async function addExperienceToTrip(formData: ExperienceTripProps) {
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
                error: `${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Unknown Error",
            message: `${error}`,
        };
    }
}

export async function removeExperienceFromTrip(formData: ExperienceTripProps) {
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
                error: `${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Unknown Error",
            message: `${error}`,
        };
    }
}

// --------------------------------------------------------------------------------------------------------------------
// DEMO FUNCTIONS -----------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
export async function demoGetTrips(user_id: string): Promise<Trip[] | ErrorResponse>  {
    if (!experiences) {
        return {
            error: "TripsNotFound",
            message: `User Trips Not Found`,
        };
    }

    // Filter Trips by userID
    const userTrips = trips.filter((trip) => trip.user_id === user_id);

    // Return an error message if no results found
    if (userTrips.length === 0) {
        return {
            error: "TripsNotFound",
            message: `No trips found for userID: ${user_id}`,
        };
    }

    return userTrips;
}
export async function demoGetTripByID(trip_id: string, user_id: string): Promise<Trip | ErrorResponse>  {
    const trips = await demoGetTrips(user_id)
    if ("error" in trips) {
        return trips;
    }

    const trip = trips.find((trip) => trip.trip_id === trip_id);
    if (!trip) {
        return {
            error: "TripNotFound",
            message: `No Trip Found with ID: ${trip_id}`,
        };
    }

    return trip as Trip;
}
export async function demoGetTripExperiences(experience_ids: string[]): Promise<Experience[] | ErrorResponse>  {
    const tripExperiences: Experience[] = []

    for (const expID of experience_ids) {
        const exp = await demoGetExperienceByID(expID);
        // Handle errors
        if (!exp || "error" in exp) {
            return {
                error: "ExperienceFetchFailed",
                message: `Failed to load experience with ID: ${expID}`,
            };
        }
        tripExperiences.push(exp);
    }

    return tripExperiences as Experience[];
}