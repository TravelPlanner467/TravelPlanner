import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {getUserExperiences} from "@/lib/actions/experience-actions";
import {NewExperienceButton} from "@/app/(ui)/account/buttons/experience-buttons";
import ErrorCard from "@/app/(ui)/general/error-display";
import ExperiencesDisplay from "@/app/(ui)/experience/experiences-display";
import {ErrorResponse, Experience} from "@/lib/types";

export default async function Page() {
    // Session Validation
    const session = await auth.api.getSession({headers: await headers()});
    if ( !session ) {redirect('/account/login');}
    const session_user_id = session.user.id;

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
        <div className="flex flex-col w-full h-full">
            <div className="flex w-3/5 gap-4 py-3 items-center justify-between mx-auto mb-3">
                <h1 className="text-4xl font-bold">My Experiences</h1>
                <NewExperienceButton />
            </div>

            {experiences.length === 0 ? (
                <h3 className="pt-12 text-xl font-medium text-gray-900">
                    No user experiences found. Create one now!
                </h3>
            ) : (
                <div className="flex-1 min-h-0">
                    <ExperiencesDisplay
                        experiences={experiences}
                        session_user_id={session_user_id}
                        default_view_mode={'list'}
                    />
                </div>
            )}
        </div>
    );
}