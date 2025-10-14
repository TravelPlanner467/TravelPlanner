import CreateExperience from "@/app/experience/create/create-experience";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export default async function CreateExperiencePage() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/');
    }

    return (
        <div className="flex flex-col w-full text-center gap-2.5 items-center">
            <div className='text-4xl font-bold'>
                Create Experience
            </div>
            <CreateExperience session={session}/>
        </div>
    )
}