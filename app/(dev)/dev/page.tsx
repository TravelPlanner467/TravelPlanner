import CreateExperienceGoogle from "@/app/(dev)/dev/components/create-experience-google";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import HybridCreatePage from "@/app/(dev)/dev/components/hybrid-create-page";
import CreateExperiencePage from "@/app/(ui)/experience/create-experience-page";

export default async function DevPage() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );
    if ( !session ) {
        redirect('/account/login');
    }
    const user_id = session.user.id;

    return (
        <div className="flex flex-col w-full text-center gap-2 items-center">
            <h1 className="text-4xl font-bold">Dev Page</h1>
            <CreateExperiencePage user_id={user_id}/>
        </div>
    )
}