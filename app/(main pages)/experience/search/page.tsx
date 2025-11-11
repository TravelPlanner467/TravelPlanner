import {searchByKeyword} from "@/lib/actions/search-actions";
import {SearchResults} from "@/app/(ui)/experience/search/search-results";
import ComboSearchBar from "@/app/(ui)/experience/search/combo-search-bar";
import {getAllExperiences} from "@/lib/actions/experience-actions";
import {ErrorResponse, Experience} from "@/lib/types";

export default async function SearchResultsPage(
    props: { searchParams?: Promise<{ keywords?: string; location?: string }> }
) {
    const searchParams = await props.searchParams;
    const keywords = searchParams?.keywords || '';
    const location = searchParams?.location || '';

    // If there's no query, show empty results
    // if (!keywords.trim() || !location.trim()) {
    //     return (
    //         <main className="flex flex-col min-w-fit min-h-fit">
    //             <div className="flex w-full justify-center pt-6">
    //                 <ComboSearchBar />
    //             </div>
    //             <div className="min-h-screen mx-auto p-10">
    //                 <p className="text-lg text-gray-600">
    //                     Enter a search to find experiences
    //                 </p>
    //             </div>
    //         </main>
    //     );
    // }

    const searchQuery = {
        keywords: keywords.trim(),
        location: location.trim(),
    }
    // TODO: USE searchQuery for combo search

    // // Use the search API to get filtered results
    // const searchResult = await searchByKeyword({ query: query.trim() });
    // const experiences: Experience[] = searchResult.results;

    // Show All Experiences (temporary solution)
    const experiences: Experience[] | ErrorResponse = await getAllExperiences();
    if ("error" in experiences) {
        return (
            <div className="min-h-screen mx-auto p-10">
                <p className="text-lg font-bold text-red-500">
                    Error fetching experiences
                </p>
            </div>
        )
    }

    return (
        <main className="h-full flex flex-col">
            <div className="flex w-full justify-center pt-6 px-12">
                <ComboSearchBar />
            </div>
            <div>
                <SearchResults keywords={keywords} location={location} experiences={experiences}/>
            </div>
        </main>
    );
}