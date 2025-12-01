import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {CodeBracketIcon} from "@heroicons/react/16/solid";


export default async function DevPage() {
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/account/login');}

    return (
        <div className="flex flex-col w-full h-screen">
            <div className="flex w-full items-center justify-center gap-2 p-2 border-b shrink-0" >
                <CodeBracketIcon className="w-8 h-8"/>
                <h1 className="text-xl font-bold">Dev Page</h1>
            </div>
            <div className="flex flex-1 justify-center w-full min-h-0 overflow-hidden">
                <h2 className="text-xl mt-12">No Features In Development</h2>
            </div>
        </div>
    )
}