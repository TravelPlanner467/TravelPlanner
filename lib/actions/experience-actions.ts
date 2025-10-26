'use server'

import experiences from "@/public/experiences.json"
import {Experience, ErrorResponse, DeleteExperienceProps} from "@/lib/types";

export async function createExperience(formData: Experience) {
    console.log("Attempting to create experience");
    try {
        const response = await fetch('http://localhost:5001/experiences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.userID,
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`upload OK: ${response.status}`)
            console.log('message:', result);
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

export async function getUserExperiences(userID: string): Promise<Experience[] | ErrorResponse> {
    try {
        const response = await fetch(`http://localhost:5001/experiences/user-experiences`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": userID,
            },
        });

        if (response.ok) {
            console.log(`OK: ${response.status}`)
            const result = await response.json();
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

export async function deleteExperience(formData: DeleteExperienceProps) {
    try {
        // TODO: REPLACE URL WITH API ENDPOINT TO CREATE EXPERIENCES
        const response = await fetch(`http://localhost:5001/experiences/${formData.experienceID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "X-User-id": formData.userID,
            },
        });

        if (response.ok) {
            console.log("sent DATA: ", formData)
            const result = await response.json();
            console.log('Delete Successful successful:', result);
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

// --------------------------------------------------------------------------------------------------------------------
// DEMO FUNCTIONS -----------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------

export async function demoGetExperiences(): Promise<Experience[] | ErrorResponse> {
    if (!experiences) {
        return {
            error: "ExperiencesNotFound",
            message: `No Experiences Found`,
        };
    }

    return experiences as Experience[];
}

export async function demoGetExperienceByID(experienceID: string): Promise<Experience | ErrorResponse> {
    const experiences = await demoGetExperiences();
    if ("error" in experiences) {
        return {
            error: "ExperiencesNotFound",
            message: `No Experiences Found`,
        };
    }

    // @ts-ignore
    const experience = experiences.find((exp: { experienceID: string; }) => exp.experienceID === experienceID);
    if (!experience) {
        return {
            error: "ExperienceNotFound",
            message: `No experience found with ID: ${experienceID}`,
        };
    }

    return experience as Experience;
}

export async function demoGetUserExperiences(userID: string): Promise<Experience[] | ErrorResponse> {
    const experiences = await demoGetExperiences();
    if ("error" in experiences) {
        return {
            error: "ExperiencesNotFound",
            message: `No Experiences Found`,
        };
    }

    const matches = experiences.filter(
        (exp: { userID: string }) => exp.userID === userID
    );

    if (matches.length === 0) {
        return {
            error: "ExperienceNotFound",
            message: `No experiences found associated with userID: ${userID}`,
        };
    }

    return matches as Experience[];
}