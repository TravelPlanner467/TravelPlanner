import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import ProfileFeatures from "@/app/profile/profile-features";

export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/login');
    }
    return (
        <div className="flex flex-col w-full text-center gap-2.5 items-center">
            <div className="flex flex-col gap-12">
                <div className='text-4xl font-bold'>
                    User Profile
                </div>
                <ProfileFeatures session={session}/>
            </div>
        </div>
    );
}