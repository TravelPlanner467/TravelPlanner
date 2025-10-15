import DisplayTrips from "@/app/ui/trip-planner/display-trips";
import NewTripButton from "@/app/ui/trip-planner/new-trip";
import SampleTrips from "@/app/ui/trip-planner/sample-trips";

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

export default function Page() {
    return (
        <div className="flex flex-col min-w-fit min-h-fit">
            <div className="-mb-20 mt-10 mr-10">
                <NewTripButton />
            </div>
            <div>
                <SampleTrips />
                {/*<DisplayTrips />*/}
            </div>
        </div>

    );
}
