import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import DegoogledCreatePage from "@/app/(ui)/experience/create/degoogled-create-page";

export default async function CreateExperiencePage() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/login');
    }

    // @ts-ignore
    const user_id = session.user.id;

    return (
        <div className="flex flex-col w-full items-center justify-center p-4">
            <DegoogledCreatePage user_id={user_id}/>
        </div>
    )
}