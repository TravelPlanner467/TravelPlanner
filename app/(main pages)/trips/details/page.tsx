import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {TripDetailsCard} from "@/app/(ui)/trips/trip-details-card";
import {getTripDetails, getTripExperienceDetails} from "@/lib/actions/trips-actions";
import {ErrorResponse, Experience, GetBatchExperiencesProps, TripIDProps, Trip} from "@/lib/types";
import {Suspense} from "react";


export default async function Page(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    // Authentication check
    const session = await auth.api.getSession({headers: await headers()});
    if (!session) {redirect('/account/login');}

    // Extract query params and user ID
    const searchParams = await props.searchParams;
    const trip_id = searchParams?.q || '';
    const session_user_id = session.user.id;

    // Fetch Trip Details
    const tripFormData: TripIDProps = {
        trip_id: trip_id,
        session_user_id: session_user_id,
    }
    // const trip: TripDetails | ErrorResponse = await getTripDetails(tripFormData);
    // ERROR PAGE IF TRIP IS NOT FOUND
    // if ("error" in trip) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <p className="text-red-500">
    //                 Error loading trip details.
    //             </p>
    //         </div>
    //     );
    // }

    const tempTrips = [
        {
            "user_id": "xJTNqVqSrdy675MwCupDbEjjFMrC4AuV",
            "trip_id": "1",
            "title": "California Coast Adventure",
            "description": "A scenic road trip along Highway 1 visiting Big Sur, Monterey, Santa Barbara, and area landmarks.",
            "start_date": "2025-08-14T10:00:00Z",
            "end_date": "2025-08-22T17:00:00Z",
            "experiences": [
                {
                    "experience_id": "101",
                    "title": "Golden Gate Bridge Walk",
                    "order": 1,
                    "location": {
                        "lat": 37.8199,
                        "lng": -122.4783,
                        "address": "Golden Gate Bridge, San Francisco, CA"
                    },
                    "description": "A scenic stroll across the iconic bridge with panoramic city and bay views.",
                    "average_rating": 4.9
                },
                {
                    "experience_id": "102",
                    "title": "Monterey Bay Aquarium",
                    "order": 2,
                    "location": {
                        "lat": 36.6181,
                        "lng": -121.9012,
                        "address": "886 Cannery Row, Monterey, CA 93940"
                    },
                    "description": "Exploring marine exhibits and interactive displays.",
                    "average_rating": 4.8
                },
                {
                    "experience_id": "103",
                    "title": "17-Mile Drive Tour",
                    "order": 3,
                    "location": {
                        "lat": 36.5668,
                        "lng": -121.9485,
                        "address": "17 Mile Dr, Pebble Beach, CA 93953"
                    },
                    "description": "Driving past famous golf courses and ocean viewpoints.",
                    "average_rating": 4.7
                },
                {
                    "experience_id": "104",
                    "title": "Big Sur Hike",
                    "order": 0,
                    "location": {
                        "lat": 36.2704,
                        "lng": -121.8081,
                        "address": "Big Sur, CA 93920"
                    },
                    "description": "Coastal hiking through redwoods and cliffs.",
                    "average_rating": 4.6
                },
                {
                    "experience_id": "105",
                    "title": "Santa Barbara Beach Day",
                    "order": 0,
                    "location": {
                        "lat": 34.4208,
                        "lng": -119.6982,
                        "address": "Santa Barbara Beach, Santa Barbara, CA"
                    },
                    "description": "Relaxing at the beachfront and touring the pier.",
                    "average_rating": 4.8
                }
            ]
        }
    ]




    return (
        <main className="">
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
                <div className="flex flex-col gap-4 items-center justify-center">
                    <TripDetailsCard
                        trip={tempTrips[0]}
                        session_user_id={session_user_id}
                    />
                </div>
            </Suspense>
        </main>

    );
}