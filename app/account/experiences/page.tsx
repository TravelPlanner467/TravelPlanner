import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

import {UserExperiences} from "@/app/ui/account/user-experiences";
import {demoGetUserExperiences} from "@/lib/actions/experience-actions";
import {ErrorResponse, Experience} from "@/lib/types";

export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/account/login');
    }

    const userID = session.user.id;
    const experiences: Experience[] | ErrorResponse = await demoGetUserExperiences(userID);

    return (
        <div className="flex flex-col w-full text-center gap-2.5 items-center">
            <div className="flex flex-col gap-12">
                <div className='text-4xl font-bold'>
                    My Experiences
                </div>
                <UserExperiences userID={userID} experiences={experiences}/>
            </div>
        </div>
    );
}