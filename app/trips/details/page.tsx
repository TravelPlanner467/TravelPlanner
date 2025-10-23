import {TripDetails} from "@/app/ui/trips/trip-details";
import {demoGetTripByID, demoGetTripExperiences, demoGetTrips} from "@/lib/actions/trips-actions";
import {ErrorResponse, Experience, Trip} from "@/lib/types";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export default async function Page(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    // GET USER SESSIONS DATA
    const session = await auth.api.getSession(
        {headers: await headers()}
    );
    //@ts-ignore
    const userID = session.user.id;

    // get search parameters from URL
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';

    // use server actions to get Trip Details Data
    const trip: Trip | ErrorResponse = await demoGetTripByID(query, userID);

    // ERROR PAGE IF TRIP IS NOT FOUND
    if ("error" in trip) {
        return (
            <div>
                TODO: IMPLEMENT TRIP DETAILS FETCH ERROR CARD
            </div>
        )}

    // Load experiences associated with the trip
    const tripExpIDs = trip.experiences
    const tripExperiences: Experience[] | ErrorResponse = await demoGetTripExperiences(tripExpIDs);

    return (
        <div className="min-h-screen min-w-screen">
            <div className="flex flex-col items-center justify-center gap-12 mt-4">
                <h2 className="text-4xl font-bold leading-tight">
                    Trip Details
                </h2>
                <div className="flex flex-col gap-4">
                    <TripDetails query={query}
                                 trip={trip}
                                 tripExperiences={tripExperiences}
                    />
                </div>
            </div>
        </div>

    );
}