import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import ProfileDisplayCard from "@/app/(ui)/account/profile-display-card";

export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/account/login');
    }

    return (
        <div className="flex flex-col mx-auto p-4 justify-center items-center">
            <div className="flex flex-col">
                <div className='text-4xl font-bold'>
                    User Profile
                </div>
                <div className="flex pt-12">
                    <ProfileDisplayCard session={session}/>
                </div>
            </div>
        </div>
    );
}