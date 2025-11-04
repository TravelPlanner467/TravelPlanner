import {auth} from "@/lib/auth";
import { Suspense } from 'react';
import {headers} from "next/headers";
import {ExperienceDetailsContent} from "@/app/ui/experience/experience-details";
import {getExperienceDetails} from "@/lib/actions/experience-actions";
import {getUserTrips} from "@/lib/actions/trips-actions";
import {GoBackButton} from "@/app/ui/components/buttons/nav-buttons";
import {ErrorResponse, Trip, UserTripsProps} from "@/lib/types";

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

    // Authentication Check for "Add Trips" button
    const session = await auth.api.getSession({ headers: await headers() });
    let trips: UserTripsProps[] | ErrorResponse | undefined;
    let session_user_id: string | undefined;

    // If session exists, fetch user trips and load user_id
    if (session) {
        session_user_id = session.user.id;
        trips = await getUserTrips(session_user_id);
    }

    return (
        <main className="min-h-screen min-w-screen">
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
                <div className="flex flex-col gap-4 items-center justify-center">
                    <ExperienceDetailsContent
                        experience={experience}
                        trips={trips}
                        user_id={session_user_id}
                    />
                    <GoBackButton text={"Search Results"} />
                </div>
            </Suspense>
        </main>

    );
}
