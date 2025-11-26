'use server'

import {NewTripButton} from "@/app/(ui)/trips/buttons/trip-buttons";
import DisplayTrips from "@/app/(ui)/trips/trips-list";
import {getUserTrips} from "@/lib/actions/trips-actions";
import {ErrorResponse, Trip, UserTripsProps} from "@/lib/types";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {GoBackButton} from "@/app/(ui)/general/buttons/nav-buttons";
import TripsList from "@/app/(ui)/trips/trips-list";


export default async function Page() {
    // Session Authentication
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/account/login');}
    const session_user_id = session.user.id;

    //Get User Trips
    const trips: UserTripsProps[] | ErrorResponse = await getUserTrips(session_user_id);
    // Early return for error in fetching trips
    if ("error" in trips) {
        return (
            <div className="p-10">
                <h1 className="text-lg font-bold text-red-500">
                    {trips.error}
                </h1>
                <p className="text-gray-600 mb-6">
                    {trips.message}
                </p>
                <GoBackButton text={"Return Home"} />
            </div>
        );
    }

    // const trips = [
    //     {
    //         "user_id": "A1B2XYZ",
    //         "trip_id": "1",
    //         "title": "California Coast Adventure",
    //         "description": "A scenic road trip along Highway 1 visiting Big Sur, Monterey, Santa Barbara, and area landmarks.",
    //         "start_date": "2025-08-14T10:00:00Z",
    //         "end_date": "2025-08-22T17:00:00Z",
    //         "experiences": [
    //             {
    //                 "experience_id": "101",
    //                 "title": "Golden Gate Bridge Walk",
    //                 "order": 1,
    //                 "location": {
    //                     "lat": 37.8199,
    //                     "lng": -122.4783,
    //                     "address": "Golden Gate Bridge, San Francisco, CA"
    //                 },
    //                 "description": "A scenic stroll across the iconic bridge with panoramic city and bay views.",
    //                 "average_rating": 4.9
    //             },
    //             {
    //                 "experience_id": "102",
    //                 "title": "Monterey Bay Aquarium",
    //                 "order": 2,
    //                 "location": {
    //                     "lat": 36.6181,
    //                     "lng": -121.9012,
    //                     "address": "886 Cannery Row, Monterey, CA 93940"
    //                 },
    //                 "description": "Exploring marine exhibits and interactive displays.",
    //                 "average_rating": 4.8
    //             },
    //         ]
    //     }
    // ]


    return (
        <div className="flex flex-col justify-center items-center p-4">
            <div className="flex flex-row w-3/5 justify-between py-3">
                <h1 className="text-4xl font-bold">My Trips</h1>
                <NewTripButton />
            </div>

            {trips.length === 0 ? (
                <h3 className="pt-12 text-xl font-medium text-gray-900">
                    No trips found. Create one now!
                </h3>
            ) : (
                <TripsList trips={trips} session_user_id={session_user_id}/>
            )}
        </div>

    );
}
