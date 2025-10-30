'use server'

import {NewTripButton} from "@/app/ui/trips/buttons/trip-buttons";
import DisplayTrips from "@/app/ui/trips/trips-list";
import {getUserTrips} from "@/lib/actions/trips-actions";
import {ErrorResponse, Trip, UserTripsProps} from "@/lib/types";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {GoBackButton} from "@/app/ui/components/buttons/nav-buttons";


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
            <div className="min-h-screen mx-auto p-10">
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

    // Early return for empty trips
    if (trips.length === 0) {
        return (
            <div className="flex flex-col min-w-fit min-h-fit p-4">
                <div className="flex flex-row justify-start items-center gap-6">
                    <h1 className="text-4xl font-bold">My Trips</h1>
                    <NewTripButton />
                </div>
                <div className="min-h-screen mx-auto px-4">
                    <p className="text-gray-500">
                        No user trips. Create one now!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-w-fit min-h-fit p-4">
            <div className="flex flex-row justif-start items-center gap-6">
                <h1 className="text-4xl font-bold">My Trips</h1>
                <NewTripButton />
            </div>
            <div className="pt-4">
                <DisplayTrips trips={trips} />
            </div>
        </div>

    );
}
