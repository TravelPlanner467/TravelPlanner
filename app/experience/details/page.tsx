import {auth} from "@/lib/auth";
import { Suspense } from 'react';
import {headers} from "next/headers";
import {ExperienceDetailsContent} from "@/app/ui/experience/experience-details";
import {getExperienceDetails} from "@/lib/actions/experience-actions";
import {getUserTrips} from "@/lib/actions/trips-actions";
import {GoBackButton} from "@/app/ui/components/buttons/nav-buttons";
import {ErrorResponse, Trip} from "@/lib/types";

export default async function ExperienceDetailsPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    const searchParams = await props.searchParams;
    const experience_id = searchParams?.q || '';

    // Fetch Experience Details
    const experience = await getExperienceDetails(experience_id);

    // Early return for experience fetch error
    if ("error" in experience) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Experience not found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        The experience you're looking for doesn't exist or has been removed.
                    </p>
                    <GoBackButton text={"Search Results"} />
                </div>
            </div>
        );
    }

    // Authentication Check for "Add Trips" button
    const session = await auth.api.getSession({ headers: await headers() });
    let trips: Trip[] | ErrorResponse | undefined;
    let user_id: string | undefined;

    if (session) {
        user_id = session.user.id;
        trips = await getUserTrips(user_id);
    }

    return (
        <main className="min-h-screen min-w-screen">
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
                <div className="flex flex-col gap-4 items-center justify-center">
                    <ExperienceDetailsContent
                        experience={experience}
                        trips={trips}
                        user_id={user_id}
                    />
                    <GoBackButton text={"Search Results"} />
                </div>
            </Suspense>
        </main>

    );
}
