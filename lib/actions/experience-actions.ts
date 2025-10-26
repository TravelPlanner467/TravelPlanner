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

export async function createExperience(formData: Experience) {
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
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Upload failed:', error);
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
            return result as Experience[];
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