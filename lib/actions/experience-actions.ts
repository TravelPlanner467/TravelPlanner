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
        // TODO: REPLACE URL WITH API ENDPOINT TO CREATE EXPERIENCES
        const response = await fetch('http://localhost:8001/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log("sent JSON: ", formData)
            const result = await response.json();
            console.log('Upload successful:', result);
            setTimeout(() => {}, 2000);

        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Upload failed:', error);
    }
}

export async function getUserExperiences(userID: string): Promise<Experience[] | ErrorResponse> {
    const formData = {userID: userID}

    try {
        // TODO: REPLACE URL WITH API ENDPOINT TO FETCH EXPERIENCES PER userID
        const response = await fetch('http://localhost:8001/FetchExperiencesByID', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log("sent JSON: ", formData)
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
        console.error('Upload failed:', error);
        return {
            error: "Unknown Error",
            message: `${error}`,
        };
    }

}