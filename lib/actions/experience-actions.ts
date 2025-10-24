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

export async function createExperience(formData: Experience) {
    console.log(formData);
}