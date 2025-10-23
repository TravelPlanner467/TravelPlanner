'use server'

import trips from "@/public/trips.json"
import experiences from "@/public/experiences.json";
import {Trip, ErrorResponse, Experience, DeleteTripsProps} from "@/lib/types";
import {demoGetExperienceByID} from "@/lib/actions/experience-actions";

export async function demoGetTrips(userID: string): Promise<Trip[] | ErrorResponse>  {
    if (!experiences) {
        return {
            error: "TripsNotFound",
            message: `User Trips Not Found`,
        };
    }

    // Filter Trips by userID
    const userTrips = trips.filter((trip) => trip.userID === userID);

    // Return an error message if no results found
    if (userTrips.length === 0) {
        return {
            error: "TripsNotFound",
            message: `No trips found for userID: ${userID}`,
        };
    }

    return userTrips;
}

export async function demoGetTripByID(tripID: string, userID: string): Promise<Trip | ErrorResponse>  {
    const trips = await demoGetTrips(userID)
    if ("error" in trips) {
        return trips;
    }

    const trip = trips.find((trip) => trip.tripID === tripID);
    if (!trip) {
        return {
            error: "TripNotFound",
            message: `No Trip Found with ID: ${tripID}`,
        };
    }

    return trip as Trip;
}

export async function demoGetTripExperiences(experienceIDs: string[]): Promise<Experience[] | ErrorResponse>  {
    const tripExperiences: Experience[] = []

    for (const expID of experienceIDs) {
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

export async function demoDeleteTrip() {

}


export async function getUserTrips() {
    const url = 'http://localhost:8000/load'
    try {
        console.log('Fetching all User Trips')
        const response = await fetch(url, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const text = await response.text();
        return JSON.parse(text);

    } catch (error: any) {
        console.error(error.message);
        return null;
    }
}

export const uploadTrip = async (jsonData: any) => {
    try {
        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        console.log("generated JSON: ", jsonData)

        if (response.ok) {
            console.log("generated JSON: ", jsonData)
            const result = await response.json();

            console.log('Upload successful:', result);
            setTimeout(() => {}, 2000);

        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Upload failed:', error);
    }
};

export const deleteTrip = async (deleteData: DeleteTripsProps) => {
    try {
        const response = await fetch('http://localhost:8000/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deleteData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle cases without a body
        let result;
        try {
            const text = await response.text();
            result = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.warn('No JSON response from delete endpoint:', parseError);
            result = {};
        }

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('Error deleting calculation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}


