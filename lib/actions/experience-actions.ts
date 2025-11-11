'use server'

import {
    CreateExperienceProps,
    DeleteExperienceProps, EditExperienceSendProps,
    ErrorResponse,
    Experience, getUserExperienceProps, RateExperienceProps
} from "@/lib/types";
import {PrismaClient} from "@/generated/prisma";

const prisma = new PrismaClient();

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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to create experience (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log(`upload OK: ${response.status}`);
        console.log('message:', result);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Upload failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        // Check for HTTP errors
        if (!response.ok) {
            // Parse the error message
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
            }

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to fetch experiences (${response.status})`,
                message: errorMessage,
            };
        }
        console.log(`OK: ${response.status}`)

        const result = await response.json();
        console.log('message:', result);

        return result as Experience[];

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Fetch failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to delete experience (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log('Delete Successful:', result);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Delete failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to fetch experience details (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log(`OK: ${response.status}`);
        console.log('message:', result);

        return result as Experience;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Fetch failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to fetch user experience details (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log(`OK: ${response.status}`);
        console.log('message:', result);

        return result as Experience;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Fetch failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to fetch all experiences (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log(`OK: ${response.status}`);
        console.log('# Fetched:', result.length);

        if (!Array.isArray(result)) {
            console.error('Invalid response format: expected array');
            return {
                error: "Invalid response format",
                message: "The server returned an unexpected response format",
            };
        }

        return result as Experience[];

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Fetch failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to update experience (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log(`upload OK: ${response.status}`);
        console.log('message:', result);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Upload failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to fetch top experiences (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log(`OK: ${response.status}`);
        console.log('message:', result);

        if (!Array.isArray(result)) {
            console.error('Invalid response format: expected array');
            return {
                error: "Invalid response format",
                message: "The server returned an unexpected response format",
            };
        }

        return result as Experience[];

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Fetch failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
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

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {}

            console.error(`HTTP error: ${response.status} - ${errorMessage}`);
            return {
                error: `Failed to rate experience (${response.status})`,
                message: errorMessage,
            };
        }

        const result = await response.json();
        console.log(`upload OK: ${response.status}`);
        console.log('message:', result);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Rating failed:', errorMessage, error);

        return {
            error: "Network Error",
            message: errorMessage,
        };
    }
}

// user userID to fetch username
export async function getUserByID(user_id: string): Promise<string> {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: user_id
            },
            select: {
                username: true,
            }
        });

        return user?.username || "Unknown"

    } catch (error) {
        console.error('Failed to fetch username:', error);
        return "Unknown"
    }
}