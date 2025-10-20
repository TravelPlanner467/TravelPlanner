'use server'

import NewTripButton from "@/app/ui/trip-planner/new-trip";
import SampleTrips from "@/app/ui/trip-planner/sample-trips";
import {demoGetTrips} from "@/lib/actions/trip-planner-actions";

export interface Trip {
    id: number;
    title: string;
    dates: {
        start: string;
        end: string;
    } | null;
    description: string | null;
    userID: string;
    experiences: number[];
}

export default async function Page({searchParams}: {searchParams?: {q?: string}}) {
    // const query = searchParams?.q || '';
    const trips: Trip[] = await demoGetTrips();

    return (
        <div className="flex flex-col min-w-fit min-h-fit">
            <div>
                <h1 className="text-4xl font-bold mb-2">My Trips</h1>
                <div className="">
                    <NewTripButton />
                </div>
            </div>
            <div>
                <SampleTrips tripsData={trips}/>
                {/*<DisplayTrips />*/}
            </div>
        </div>

    );
}
