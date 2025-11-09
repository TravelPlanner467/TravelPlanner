import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {TripDetailsCard} from "@/app/ui/trips/trip-details-card";
import {getTripDetails, getTripExperienceDetails} from "@/lib/actions/trips-actions";
import {ErrorResponse, Experience, GetBatchExperiencesProps, TripIDProps, Trip} from "@/lib/types";
import {NavButton} from "@/app/ui/components/buttons/nav-buttons";
import {Suspense} from "react";


export default async function Page(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    // Authentication check
    const session = await auth.api.getSession({headers: await headers()});
    if (!session) {
        redirect('/account/login');
    }

    // Extract query params and user ID
    const searchParams = await props.searchParams;
    const trip_id = searchParams?.q || '';
    const user_id = session.user.id;

    // Fetch Trip Details
    const tripFormData: TripIDProps = {
        trip_id: trip_id,
        user_id: user_id,
    }
    const trip: Trip | ErrorResponse = await getTripDetails(tripFormData);

    // ERROR PAGE IF TRIP IS NOT FOUND
    if ("error" in trip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">
                    Error loading trip details.
                </p>
            </div>
        );
    }

    // Load experiences associated with the trip
    const tripExperienceIDs: GetBatchExperiencesProps = {
        experience_ids: trip.experiences,
        user_id: user_id,
    };
    const tripExperiences: Experience[] | ErrorResponse = await getTripExperienceDetails(tripExperienceIDs);

    return (
        <main className="">
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
                <div className="flex flex-col gap-4 items-center justify-center">
                    <TripDetailsCard
                        trip={trip}
                        tripExperiences={tripExperiences}
                        session_user_id={user_id}
                    />
                </div>
            </Suspense>
        </main>

    );
}