'use server'

import {
    CreateExperienceProps,
    DeleteExperienceProps, EditExperienceSendProps,
    ErrorResponse,
    Experience, getExperienceByLocationProps, getUserExperienceProps, RateExperienceProps
} from "@/lib/types";
import {PrismaClient} from "@/generated/prisma";

// Prisma handler - Prevent multiple instances from forming
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Fetch URL configurations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const FETCH_TIMEOUT = 5000; // 5 seconds

// Helper for calling URLs & returning error messages
// T: a generic type variable
async function handleApiRequest<T>(url: string, options: RequestInit, errorContext: string):
    Promise<T extends void ? ErrorResponse | undefined : T | ErrorResponse>
{
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            cache: 'no-store',
        });
        clearTimeout(timeout);

        // If no response, return data = {}
        const data = await response.json().catch(() => ({}));

        // Parse error messages
        if (!response.ok) {
            return {
                error: `Error ${response.status}`,
                message: data.message || response.statusText,
            } as any;
        }
        console.log('Data:', data);

        // Return data
        return (data || undefined) as any;

    } catch (error) {
        clearTimeout(timeout);
        if (error instanceof Error) {
            // Timeout Error
            return {
                error: error.name === 'AbortError' ? "Request Timeout" : "Network Error",
                message: error.message,
            } as any;
        }
        // Unknown Network error
        return {
            error: "Network Error",
            message: {errorContext},
        } as any;
    }
}

// CREATE ====================================================================
export async function createExperience(formData: CreateExperienceProps): Promise<ErrorResponse | undefined> {
    const result = await handleApiRequest<void>(
        `${API_BASE_URL}/experiences/create`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.user_id,
            },
            body: JSON.stringify(formData),
        },
        'Failed to create experience'
    );

    if (result) return result;
    console.log('Experience created successfully');
}

// READ ======================================================================
export async function getUserExperiences(userID: string): Promise<Experience[] | ErrorResponse> {
    const result = await handleApiRequest<Experience[]>(
        `${API_BASE_URL}/experiences/user-experiences`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": userID,
            },
        },
        'Failed to fetch experiences'
    );

    if ('error' in result) return result;
    return result;
}

export async function getExperienceDetails(experience_id: string): Promise<Experience | ErrorResponse> {
    return handleApiRequest<Experience>(
        `${API_BASE_URL}/experiences/details/${experience_id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        'Failed to fetch experience details'
    );
}

// UPDATE ========================================================================
export async function updateExperience(formData: EditExperienceSendProps): Promise<void | ErrorResponse> {
    const result = await handleApiRequest<void>(
        `${API_BASE_URL}/experiences/update`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.session_user_id,
            },
            body: JSON.stringify(formData),
        },
        'Failed to update experience'
    );

    if (result) return result;
    console.log('Experience updated successfully');
}

// DELETE ========================================================================
export async function deleteExperience(formData: DeleteExperienceProps): Promise<ErrorResponse | undefined> {
    const result = await handleApiRequest<void>(
        `${API_BASE_URL}/experiences/delete/${formData.experience_id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "X-User-id": formData.user_id,
            },
        },
        'Failed to delete experience'
    );

    if (result) return result;
    console.log('Experience deleted successfully');
}


export async function getUserExperiencesDetails(formData: getUserExperienceProps): Promise<Experience | ErrorResponse> {
    return handleApiRequest<Experience>(
        `${API_BASE_URL}/experiences/user_details/${formData.experience_id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-User-id": formData.session_user_id,
            },
        },
        'Failed to fetch user experience details'
    );
}

export async function getAllExperiences(): Promise<Experience[] | ErrorResponse> {
    const result = await handleApiRequest<Experience[]>(
        `${API_BASE_URL}/experiences/all`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        'Failed to fetch all experiences'
    );

    if ('error' in result) return result;
    return result;
}

export async function getExperiencesByLocation(formData: getExperienceByLocationProps) {
    console.log("Getting experiences by location: ", formData);
}

export async function getTopExperiences(): Promise<Experience[] | ErrorResponse> {
    const result = await handleApiRequest<Experience[]>(
        `${API_BASE_URL}/experiences/top_experiences`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        'Failed to fetch top experiences'
    );

    if ('error' in result) return result;
    return result;
}

export async function rateExperience(formData: RateExperienceProps): Promise<ErrorResponse | undefined> {
    const result = await handleApiRequest<void>(
        `${API_BASE_URL}/experiences/rate`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-User-Id": formData.session_user_id,
            },
            body: JSON.stringify(formData),
        },
        'Failed to rate experience'
    );

    if (result) return result;
    console.log('Experience rated successfully');
}

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

        return user?.username || "Unknown";

    } catch (error) {
        console.error('Failed to fetch username:', error);
        return "Unknown";
    }
}
