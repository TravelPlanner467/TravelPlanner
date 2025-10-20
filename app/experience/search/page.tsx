import {demoGetExperience} from "@/lib/actions/experience-actions";
import {SearchResults} from "@/app/ui/experience/search-results";

export interface Experience {
    id: string;
    title: string;
    create_date: string;
    experience_date: string;
    description: string;
    userID: string;
    address: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    keywords: string[];
    photos: string[];
}


// TODO: FETCH DATA AND RETURN RESULTS
// TODO: USE TEMPORARY JSON FILE UNTIL EXPERIENCES DATA IS READY

export default async function SearchResultsPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const experiences: Experience[] = await demoGetExperience();

    return (
        <main className="flex flex-col min-w-fit min-h-fit">
            <SearchResults query={query} experienceData={experiences}/>
        </main>
    );
}