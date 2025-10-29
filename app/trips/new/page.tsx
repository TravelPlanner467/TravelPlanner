import {NewTripForm} from "@/app/ui/trips/new/new-trip-form";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {ErrorResponse, Trip} from "@/lib/types";
import {demoGetTrips} from "@/lib/actions/trips-actions";

export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/account/login');
    }

    //@ts-ignore
    const user_id = session.user.id;

    return (
        <div className="min-h-screen min-w-screen">
            <div className="flex flex-col items-center justify-center gap-12 mt-4">
                <h2 className="text-4xl font-bold leading-tight">
                    New Trip
                </h2>
                <div className="flex flex-col gap-4">
                    <NewTripForm user_id={user_id}/>
                </div>
            </div>
        </div>

    );
}