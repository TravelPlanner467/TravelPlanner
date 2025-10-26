'use server'

import NewTripButton from "@/app/ui/trips/buttons/new-trip-button";
import DisplayTrips from "@/app/ui/trips/trips-list";
import {demoGetTrips} from "@/lib/actions/trips-actions";
import {ErrorResponse, Trip} from "@/lib/types";
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
    const trips: Trip[] | ErrorResponse = await demoGetTrips(user_id);

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
