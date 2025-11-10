import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import ProfileFeatures from "@/app/ui/account/profile-features";
import AccountSettings from "@/app/ui/account/account-settings";

export default async function Page() {
    // Validate User Session
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/account/login');}

    const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        username: session.user.username ?? undefined,
    }

    return (
        <div className="flex flex-col w-full justify-center items-center">
            <h2 className="text-4xl font-bold my-4"> Account Settings </h2>
            <AccountSettings user={user}/>
        </div>
    );
}