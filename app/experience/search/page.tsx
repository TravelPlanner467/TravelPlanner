import {getAllExperiences} from "@/lib/actions/experience-actions";
import {SearchResults} from "@/app/ui/experience/search/search-results";
import {ErrorResponse, Experience} from "@/lib/types";
import SearchBar from "@/app/ui/experience/search/search-bar";

export default async function SearchResultsPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const experiences: Experience[] | ErrorResponse = await getAllExperiences();

    if ("error" in experiences) {
        return (
            <div className="min-h-screen mx-auto p-10">
                <p className="text-lg font-bold text-red-500">
                    Error fetching experiences
                </p>
            </div>
        );
    }

    return (
        <main className="flex flex-col min-w-fit min-h-fit">
            <div className="flex w-full justify-center pt-6">
                <SearchBar />
            </div>
            <div>
                <SearchResults query={query} experiences={experiences}/>
            </div>
        </main>
    );
}