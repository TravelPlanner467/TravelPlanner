import {getAllExperiences} from "@/lib/actions/experience-actions";
import {SearchResults} from "@/app/ui/experience/search/search-results";
import {ErrorResponse, Experience} from "@/lib/types";

export default async function SearchResultsPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const experiences: Experience[] | ErrorResponse = await getAllExperiences();

    return (
        <main className="flex flex-col min-w-fit min-h-fit">
            <SearchResults query={query} experiences={experiences}/>
        </main>
    );
}