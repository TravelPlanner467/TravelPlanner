'use server'

import experiences from "@/public/experiences.json"
import {Experience, ErrorResponse } from "@/lib/types";

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

export async function createExperience(formData: Experience): Promise<any | { error: string; message: string }> {
    console.log(formData);
    try {
        const base = process.env.EXPERIENCES_API_URL || 'http://localhost:5001';
        // Map client formData shape to microservice schema
        const payload = {
            title: (formData as any).title,
            description: (formData as any).description ?? '',
            date: (formData as any).experience_date,
            address: (formData as any).address ?? '',
            latitude: (formData as any).coordinates?.latitude,
            longitude: (formData as any).coordinates?.longitude,
        };
        const userIdForHeader = (formData as any).userID;

        const response = await fetch(`${base}/experiences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': String(userIdForHeader || ''),
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log("sent JSON: ", payload)
            const result = await response.json();
            console.log('Create experience successful:', result);
            return result;
        } else {
            const msg = `HTTP error! status: ${response.status}`;
            console.error(msg);
            return { error: 'HTTPError', message: msg };
        }

    } catch (error) {
        console.error('Upload failed:', error);
        return { error: 'UnknownError', message: String(error) };
    }
}

export async function getUserExperiences(userID: string): Promise<Experience[] | ErrorResponse> {
    try {
        const base = process.env.EXPERIENCES_API_URL || 'http://localhost:5001';
        const response = await fetch(`${base}/experiences/user/${encodeURIComponent(userID)}`, {
            cache: 'no-store',
        });

        if (response.ok) {
            const result = await response.json();
            // Map microservice rows to app Experience type shape expected by UI
            const mapped: Experience[] = (result as any[]).map((row: any) => ({
                experienceID: String(row.id),
                userID: String(row.creator_id),
                title: row.title ?? '',
                description: row.description ?? '',
                experience_date: row.date ?? '',
                address: row.address ?? '',
                coordinates: {
                    latitude: row.latitude ?? null,
                    longitude: row.longitude ?? null,
                },
                photos: row.photos ?? [],
                keywords: row.keywords ?? [],
                imageURL: row.imageURL ?? [],
                create_date: row.created_at ?? '',
                rating: row.rating ?? 0,
            }));
            return mapped;
        } else {
            console.error(`HTTP response error! status: ${response.status}`);
            return {
                error: "HTTP response error",
                message: `${response.status}`,
            };
        }

    } catch (error) {
        console.error('Fetch failed:', error);
        return {
            error: "Unknown Error",
            message: `${error}`,
        };
    }

}