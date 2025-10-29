import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {UserExperiences} from "@/app/ui/account/experiences/user-experiences";
import {getUserExperiences} from "@/lib/actions/experience-actions";
import {NewExperienceButton} from "@/app/ui/account/buttons/experience-buttons";
import {ErrorResponse, Experience} from "@/lib/types";

export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/account/login');
    }

    const user_id = session.user.id;
    const experiences: Experience[] | ErrorResponse = await getUserExperiences(user_id);

    // Early return on error
    if ("error" in experiences) {
        return (
            <div>
                TODO: IMPLEMENT EXPERIENCES FEsadfadsaTCH ERROR
                {experiences.message}
            </div>
        );
    }

    // IF NO EXPERIENCES FOUND
    if (experiences.length === 0) {
        return (
            <div>
                TODO: NO EXPERIENCES FOUND FOR THIS USER
            </div>
        )
    }

    return (
        <div className="flex flex-col min-w-fit min-h-fit">
            <div className="flex flex-row justify-between items-center my-6">
                <h1 className="text-4xl font-bold">My Experiences</h1>
                <NewExperienceButton />
            </div>
            <div>
                <UserExperiences user_id={user_id} experiences={experiences}/>
            </div>
        </div>
    );
}