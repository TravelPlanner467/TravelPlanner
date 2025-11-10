import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {UserExperiences} from "@/app/(ui)/account/experiences/user-experiences";
import {getUserExperiences} from "@/lib/actions/experience-actions";
import {NewExperienceButton} from "@/app/(ui)/account/buttons/experience-buttons";
import {ErrorResponse, Experience} from "@/lib/types";
import ErrorCard from "@/app/(ui)/components/error-display";

export default async function Page() {
    // Session Validation
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/account/login');}

    // Get User Experiences
    const user_id = session.user.id;
    const experiences: Experience[] | ErrorResponse = await getUserExperiences(user_id);

    // Early return for experience fetch error
    if ("error" in experiences) {
        return (
            <ErrorCard error={experiences.error} message={experiences.message} />
        );
    }

    return (
        <div className="flex flex-col mx-auto p-4 justify-center items-center">
            <div className="flex flex-row justify-between w-3/5 py-3">
                <h1 className="text-4xl font-bold">My Experiences</h1>
                <NewExperienceButton />
            </div>

            {experiences.length === 0 ? (
                <h3 className="pt-12 text-xl font-medium text-gray-900">
                    No user experiences found. Create one now!
                </h3>
            ) : (
                <UserExperiences user_id={user_id} experiences={experiences} />
            )}
        </div>
    );
}