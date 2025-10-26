import { Suspense } from 'react';
import {ExperienceDetailsContent} from "@/app/ui/experience/experience-details";
import {getExperienceDetails} from "@/lib/actions/experience-actions";

export default async function ExperienceDetailsPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const experience = await getExperienceDetails(query);

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <ExperienceDetailsContent experience={experience}/>
        </Suspense>
    );
}
