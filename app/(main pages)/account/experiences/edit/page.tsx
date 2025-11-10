import React from "react";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import EditExperienceWrapper from "@/app/(ui)/account/experiences/edit-experience-wrapper";
import {getUserExperiencesDetails} from "@/lib/actions/experience-actions";
import {GoBackButton} from "@/app/(ui)/components/buttons/nav-buttons";

export default async function EditExperiencePage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    //Session Authentication
    const session = await auth.api.getSession(
        {headers: await headers()}
    );
    if ( !session ) { redirect('/account/login'); }

    //Fetch User Experience Details
    const searchParams = await props.searchParams;
    const experience_id = searchParams?.q || '';
    const session_user_id = session.user.id;
    const formData = {
        experience_id: experience_id,
        session_user_id: session_user_id,
    }
    const experience = await getUserExperiencesDetails(formData);


    // Early return for experience fetch error
    if ("error" in experience) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Experience not found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        The experience you're looking for doesn't exist or has been removed.
                    </p>
                    <GoBackButton text={"My Experience"} />
                </div>
            </div>
        );
    }

    // Early return if session user_id doesn't match loaded experience user_id
    if (experience.user_id !== session_user_id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Invalid User
                    </h1>
                    <p className="text-gray-600 mb-6">
                        You do not own this experience
                    </p>
                    <GoBackButton text={"My Experiences"} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full text-center gap-2 items-center">
            <div className='text-4xl font-bold'>
                Edit Experience
            </div>
            <EditExperienceWrapper session_user_id={session_user_id} experience={experience}/>
        </div>
    )
}