'use server'

import {deleteSavedTrip} from "@/app/lib/data";

export async function getUserTrips() {
    const url = 'http://localhost:8004/load'
    try {
        console.log('Fetching all saved calculations')
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

export async function deleteTrips(calculationId: string) {
    try {
        // Call database function to delete the trip
        const result = await deleteSavedTrip(calculationId);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error deleting calculation:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

export const sendToTripServer = async (jsonData: any) => {
    try {
        const response = await fetch('http://localhost:8004/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

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