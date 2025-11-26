import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {CodeBracketIcon} from "@heroicons/react/16/solid";

import {getAllExperiences} from "@/lib/actions/experience-actions";
import ExperiencesDisplay from "@/app/(ui)/experience/experiences-display";

export default async function Page() {
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/account/login');}
    const session_user_id = session.user.id;

    // Check if user has admin role from database
    if (session.user.role !== 'admin') {
        return (
            <div>
                Unauthorized Access. Please login with an admin account.
            </div>
        )
    }

    // Fetch all experiences
    const experiences = await getAllExperiences()
    if ( "error" in experiences ) {
        return (
            <div>ERROR FETCHING ALL EXPERIENCES</div>
        )
    }

    return (
        <div className="flex flex-col w-full h-screen">
            <div className="flex w-full items-center justify-center gap-2 p-2 border-b shrink-0" >
                <CodeBracketIcon className="w-8 h-8"/>
                <h1 className="text-xl font-bold">Dev Page</h1>
            </div>
            <div className="flex-1 min-h-0">
                <ExperiencesDisplay
                    experiences={experiences}
                    session_user_id={session_user_id}
                    default_view_mode={'map'}
                />
            </div>
        </div>
    )
}