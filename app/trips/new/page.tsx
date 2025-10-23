import {NewTripForm} from "@/app/ui/trips/new-trip-form";

export default function Page() {
    return (
        <div className="min-h-screen min-w-screen">
            <div className="flex flex-col items-center justify-center gap-12 mt-4">
                <h2 className="text-4xl font-bold leading-tight">
                    New Trip
                </h2>
                <div className="flex flex-col gap-4">
                    <NewTripForm/>
                </div>
            </div>
        </div>

    );
}