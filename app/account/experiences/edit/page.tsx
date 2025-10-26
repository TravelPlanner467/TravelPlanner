import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import EditExperienceWrapper from "@/app/ui/account/experiences/edit-experience-wrapper";
import {demoGetExperienceByID} from "@/lib/actions/experience-actions";

export default async function EditExperiencePage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    if ( !session ) { redirect('/login'); }

    // @ts-ignore
    const user_id = session.user.id;
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const experience = await demoGetExperienceByID(query);

    return (
        <div className="flex flex-col w-full text-center gap-2 items-center">
            <div className='text-4xl font-bold'>
                Edit Experience
            </div>
            <EditExperienceWrapper user_id={user_id} experience={experience}/>
        </div>
    )
}