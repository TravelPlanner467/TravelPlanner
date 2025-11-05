import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {UserExperiences} from "@/app/ui/account/experiences/user-experiences";
import {getUserExperiences} from "@/lib/actions/experience-actions";
import {NewExperienceButton} from "@/app/ui/account/buttons/experience-buttons";
import {ErrorResponse, Experience} from "@/lib/types";
import {GoBackButton} from "@/app/ui/components/buttons/nav-buttons";

export default async function Page() {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) {
        redirect('/account/login');
    }

    const user_id = session.user.id;
    const experiences: Experience[] | ErrorResponse = await getUserExperiences(user_id);

    // Early return for experience fetch error
    if ("error" in experiences) {
        return (
            <div className="min-h-screen mx-auto p-10">
                <h1 className="text-lg font-bold text-red-500">
                    {experiences.error}
                </h1>
                <p className="text-gray-600 mb-6">
                    {experiences.message}
                </p>
                <GoBackButton text={"Return Home"} />
            </div>
        );
    }

    // IF NO EXPERIENCES FOUND
    if (experiences.length === 0) {
        return (
            <div className="flex flex-col min-w-fit min-h-fit p-4">
                <div className="flex flex-row justify-start items-center gap-6">
                    <h1 className="text-4xl font-bold">My Experiences</h1>
                    <NewExperienceButton />
                </div>
                <div className="pt-4">
                    <p className="text-lg font-bold text-gray-500">
                        No user experiences found. Create one now!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col mx-auto p-4 justify-center items-center ">
            <div className="flex flex-row justify-between w-3/5 py-3">
                <h1 className="text-4xl font-bold">My Experiences</h1>
                <NewExperienceButton />
            </div>
            <div className="flex w-3/5 pt-4">
                <UserExperiences user_id={user_id} experiences={experiences}/>
            </div>
        </div>
    );
}