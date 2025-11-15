import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {CodeBracketIcon} from "@heroicons/react/16/solid";

import {getAllExperiences} from "@/lib/actions/experience-actions";
import MapPageClient from "@/app/(dev)/dev/old/map-display-client";

export default async function DevPage() {
    // Session Validation
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/account/login');}
    // Get User ID
    const session_user_id = session.user.id;

    const experiences = await getAllExperiences()
    if ( "error" in experiences ) {
        return (
            <div>ERROR</div>
        )
    }

    return (
        <div className="flex flex-col w-full h-screen">
            <div className="flex w-full items-center justify-center gap-2 p-2 border-b shrink-0" >
                <CodeBracketIcon className="w-8 h-8"/>
                <h1 className="text-xl font-bold">Dev Page</h1>
            </div>
            <div className="flex flex-1 w-full min-h-0 overflow-hidden">
                <MapPageClient
                    initialExperiences={experiences}
                    session_user_id={session_user_id}
                />
            </div>
        </div>
    )
}