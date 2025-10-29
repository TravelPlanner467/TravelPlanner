'use server'

import {NewTripButton} from "@/app/ui/trips/buttons/trip-buttons";
import DisplayTrips from "@/app/ui/trips/trips-list";
import {getUserTrips} from "@/lib/actions/trips-actions";
import {ErrorResponse, Trip, UserTripsProps} from "@/lib/types";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";


export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/account/login');
    }

    //@ts-ignore
    const user_id = session.user.id;
    const trips: UserTripsProps[] | ErrorResponse = await getUserTrips(user_id);

    // Early return for error
    if ("error" in trips) {
        return (
            <div className="min-h-screen mx-auto px-4">
                <p className="text-red-500">
                    Error fetching trips. Please try again later.
                </p>
            </div>
        );
    }

    // Early return for empty trips
    if (trips.length === 0) {
        return (
            <div className="flex flex-col min-w-fit min-h-fit">
                <div className="flex flex-row justify-between items-center my-6">
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
        <div className="flex flex-col min-w-fit min-h-fit">
            <div className="flex flex-row justify-between items-center my-6">
                <h1 className="text-4xl font-bold">My Trips</h1>
                <NewTripButton />
            </div>
            <div>
                <DisplayTrips trips={trips} />
            </div>
        </div>

    );
}
