import CreateExperience from "@/app/ui/experience/create-experience";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export default async function CreateExperiencePage() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    const userID = session.user.id;

    if ( !session ) {
        redirect('/');
    }

    return (
        <div className="flex flex-col w-full text-center gap-2.5 items-center">
            <div className='text-4xl font-bold'>
                Create Experience
            </div>
            <CreateExperience userID={userID}/>
        </div>
    )
}