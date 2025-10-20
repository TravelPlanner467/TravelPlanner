'use server'
import experiences from "@/public/experiences.json"
import {Experience} from "@/app/experience/search/page";

export async function demoGetExperience() {
    return experiences as unknown as Experience[];
}
