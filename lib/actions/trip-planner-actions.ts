'use server'

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

export const deleteTrip = async (jsonData: any) => {
    try {
        const response = await fetch('http://localhost:8000/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
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


