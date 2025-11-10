'use server'

import {NewTripButton} from "@/app/(ui)/trips/buttons/trip-buttons";
import DisplayTrips from "@/app/(ui)/trips/trips-list";
import {getUserTrips} from "@/lib/actions/trips-actions";
import {ErrorResponse, Trip, UserTripsProps} from "@/lib/types";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {GoBackButton} from "@/app/(ui)/components/buttons/nav-buttons";
import {UserExperiences} from "@/app/(ui)/account/experiences/user-experiences";


export default async function Page() {
    // Session Authentication
    const session = await auth.api.getSession(
        {headers: await headers()}
    );
    if ( !session ) {
        redirect('/account/login');
    }

    //Get User Trips
    const user_id = session.user.id;
    const trips: UserTripsProps[] | ErrorResponse = await getUserTrips(user_id);

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
                <DisplayTrips trips={trips} />
            )}
        </div>

    );
}
