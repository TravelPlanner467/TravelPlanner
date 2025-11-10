'use server'

import {
    CreateExperienceProps,
    DeleteExperienceProps, EditExperienceSendProps,
    ErrorResponse,
    Experience, getUserExperienceProps, RateExperienceProps
} from "@/lib/types";

export async function createExperience(formData: CreateExperienceProps) {
    console.log("createExperience: ", formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/create`, {
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
                error: `Microservice Error: ${response.status}`,
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/user-experiences`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": userID,
            },
        });

        if (response.ok) {
            console.log(`OK: ${response.status}`)
            const result = await response.json();
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
            error: "Error in: getUserExperiences",
            message: `${error}`,
        };
    }
}

export async function deleteExperience(formData: DeleteExperienceProps) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/delete/${formData.experience_id}`, {
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
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Delete failed:', error);
        return {
            error: "Error in: deleteExperience",
            message: `${error}`,
        };
    }
}

export async function getExperienceDetails(experience_id: string): Promise<Experience | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/details/${experience_id}`, {
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
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Fetch failed: ', error);
        return {
            error: "Error in: getExperienceDetails",
            message: `${error}`,
        };
    }
}

export async function getUserExperiencesDetails(formData: getUserExperienceProps): Promise<Experience | ErrorResponse> {
    try {
            const response =
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/user_details/${formData.experience_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-id": formData.session_user_id,
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`)
            console.log('# Fetched:', result.length);
            return result as Experience;

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
            error: "Error in: getExperienceDetails",
            message: `${error}`,
        };
    }
}

export async function getAllExperiences(): Promise<Experience[] | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`OK: ${response.status}`)
            console.log('# Fetched:', result.length);
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
            error: "Error in: getAllExperiences",
            message: `${error}`,
        };
    }
}

export async function updateExperience(formData: EditExperienceSendProps) {
    console.log("Attempting to edit experience");
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.session_user_id,
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
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Upload failed:', error);
        return {
            error: "Error in: updateExperience",
            message: `${error}`,
        };
    }
}

export async function getTopExperiences(): Promise<Experience[] | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/top_experiences`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            console.log(`OK: ${response.status}`)
            const result = await response.json();
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
            error: "Error in: getTopExperiences",
            message: `${error}`,
        };
    }
}

export async function rateExperience(formData: RateExperienceProps) {
    console.log(formData);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.session_user_id,
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
                error: `Microservice Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }

    } catch (error) {
        console.error('Rating failed:', error);
        return {
            error: "Error in: rateExperience",
            message: `${error}`,
        };
    }
}
