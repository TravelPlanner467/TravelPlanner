import {auth} from "@/lib/auth";
import { Suspense } from 'react';
import {headers} from "next/headers";
import {ExperienceDetailsContent} from "@/app/(ui)/experience/display/experience-details-card";
import {getExperienceDetails, getUserByID} from "@/lib/actions/experience-actions";
import {GoBackButton} from "@/app/(ui)/general/buttons/nav-buttons";
import {ErrorResponse} from "@/lib/types";

export default async function ExperienceDetailsPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    // Get search parameters from URL
    const searchParams = await props.searchParams;
    const experience_id = searchParams?.q || '';

    // Fetch Experience Details
    const experience = await getExperienceDetails(experience_id);

    // Early return for experience fetch error
    if ("error" in experience) {
        return (
            <div className="min-h-screen mx-auto p-10">
                <h1 className="text-lg font-bold text-red-500">
                    {experience.error}
                </h1>
                <p className="text-gray-600 mb-6">
                    {experience.message}
                </p>
                <GoBackButton text={"Return to Search"} />
            </div>
        );
    }

    // Get the username of the experience author
    const experienceAuthor = await getUserByID(experience.user_id);

    // Authentication Check - just get user_id
    const session = await auth.api.getSession({ headers: await headers() });
    const session_user_id = session?.user?.id;

    return (
        <main className="">
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
                <div className="flex flex-col gap-4 items-center justify-center">
                    <ExperienceDetailsContent
                        experience={experience}
                        user_id={session_user_id}
                        experienceAuthor={experienceAuthor}
                    />
                </div>
            </Suspense>
        </main>
    );
}