import React from "react";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {GoBackButton} from "@/app/(ui)/general/buttons/nav-buttons";
import {getTripDetails} from "@/lib/actions/trips-actions";
import {EditTripForm} from "@/app/(ui)/trips/edit/edit-trip-form";
import {ErrorResponse, Trip} from "@/lib/types";

export default async function EditTripPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    // Session Authentication
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) { redirect('/account/login'); }
    const session_user_id = session.user.id;

    // Fetch Experience Details
    const searchParams = await props.searchParams;
    const trip_id = searchParams?.q || '';
    const formData = {
        trip_id: trip_id,
        session_user_id: session_user_id,
    }
    const trip: Trip | ErrorResponse = await getTripDetails(formData);

    // Early return for experience fetch error
    if ("error" in trip) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Trip not found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        The experience you're looking for doesn't exist or has been removed.
                    </p>
                    <GoBackButton text={"My Experience"} />
                </div>
            </div>
        );
    }

    // Early return if session user_id doesn't match loaded experience user_id
    if (trip.user_id !== session_user_id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Invalid User
                    </h1>
                    <p className="text-gray-600 mb-6">
                        You do not own this experience
                    </p>
                    <GoBackButton text={"My Experiences"} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full items-center justify-center p-4">
            <EditTripForm trip={trip} session_user_id={session_user_id}/>
        </div>
    )
}