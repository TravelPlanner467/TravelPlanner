import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import CreateExperiencePage from "@/app/(ui)/experience/create-experience-page";

export default async function Page() {
    // Session Validation
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/login');}

    const user_id = session.user.id;

    return (
        <div className="flex flex-col w-full items-center justify-center p-4">
            <CreateExperiencePage user_id={user_id}/>
        </div>
    )
}