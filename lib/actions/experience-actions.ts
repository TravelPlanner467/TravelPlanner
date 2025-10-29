'use server'

import experiences from "@/public/experiences.json"
import {
    CreateExperienceProps,
    DeleteExperienceProps,
    ErrorResponse,
    Experience} from "@/lib/types";

export async function createExperience(formData: CreateExperienceProps) {
    console.log("Attempting to create experience");
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/py/experiences/create`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/py/experiences/user-experiences`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/py/experiences/delete/${formData.experience_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "X-User-id": formData.user_id,
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

export async function getExperienceDetails(experience_id: string): Promise<Experience | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/py/experiences/details/${experience_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`)
            console.log('message:', result);
            return result as Experience;

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

export async function getAllExperiences(): Promise<Experience[] | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/py/experiences/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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

export async function updateExperience(formData: Experience) {
    console.log("Attempting to edit experience");
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/py/experiences/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
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
export async function demoGetExperienceByID(experience_id: string): Promise<Experience | ErrorResponse> {
    const experiences = await demoGetExperiences();
    if ("error" in experiences) {
        return {
            error: "ExperiencesNotFound",
            message: `No Experiences Found`,
        };
    }

    // @ts-ignore
    const experience = experiences.find((exp: { experience_id: string; }) => exp.experience_id === experience_id);
    if (!experience) {
        return {
            error: "ExperienceNotFound",
            message: `No experience found with ID: ${experience_id}`,
        };
    }

    return experience as Experience;
}
export async function demoGetUserExperiences(user_id: string): Promise<Experience[] | ErrorResponse> {
    const experiences = await demoGetExperiences();
    if ("error" in experiences) {
        return {
            error: "ExperiencesNotFound",
            message: `No Experiences Found`,
        };
    }

    const matches = experiences.filter(
        (exp: { user_id: string }) => exp.user_id === user_id
    );

    if (matches.length === 0) {
        return {
            error: "ExperienceNotFound",
            message: `No experiences found associated with userID: ${user_id}`,
        };
    }

    return matches as Experience[];
}
