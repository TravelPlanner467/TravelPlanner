import {CreateTrip} from "@/app/ui/trip-planner/create-trip";

export default function Page() {
    return (
        <div className="min-h-screen min-w-screen">
            <div className="flex flex-col items-center justify-center gap-12 mt-4">
                <h2 className="text-4xl font-bold leading-tight">
                    New Trip
                </h2>
                <div className="flex flex-col gap-4">
                    <CreateTrip/>
                </div>
            </div>
        </div>

    );
}