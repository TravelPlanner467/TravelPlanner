import SignupForm from "@/app/signup/signup-form";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( session ) {
        redirect('/profile');
    }

    return (
        <div className="flex flex-col w-full text-center gap-2.5 items-center">
            <div className="flex flex-col gap-12">
                <div className='text-4xl font-bold'>
                    Sign Up
                </div>
                <SignupForm />
            </div>
        </div>
    );
}