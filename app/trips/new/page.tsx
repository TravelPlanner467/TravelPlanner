import {NewTripForm} from "@/app/ui/trips/new/new-trip-form";
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
    const session_user_id = session.user.id;

    return (
        <div className="flex flex-col w-full gap-2 items-center">
            <div className='text-4xl font-bold'>
                Create Trip
            </div>
            <NewTripForm session_user_id={session_user_id}/>
        </div>
    );
}