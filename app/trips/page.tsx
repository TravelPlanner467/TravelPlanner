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
    const userID = session.user.id;
    const trips: Trip[] | ErrorResponse = await demoGetTrips(userID);

    return (
        <div className="flex flex-col min-w-fit min-h-fit">
            <div>
                <h1 className="text-4xl font-bold mb-2">My Trips</h1>
                <div className="">
                    <NewTripButton />
                </div>
            </div>
            <div>
                <DisplayTrips trips={trips} />
            </div>
        </div>

    );
}
