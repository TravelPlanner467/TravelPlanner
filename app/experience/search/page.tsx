import {searchByKeyword} from "@/lib/actions/search-actions";
import {SearchResults} from "@/app/ui/experience/search/search-results";
import {Experience} from "@/lib/types";
import SearchBar from "@/app/ui/experience/search/search-bar";

export default async function SearchResultsPage(
    props: { searchParams?: Promise<{ q?: string }> }
) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';

    // If there's no query, show empty results
    if (!query.trim()) {
        return (
            <main className="flex flex-col min-w-fit min-h-fit">
                <div className="flex w-full justify-center pt-6">
                    <SearchBar />
                </div>
                <div className="min-h-screen mx-auto p-10">
                    <p className="text-lg text-gray-600">
                        Enter a search query to find experiences
                    </p>
                </div>
            </main>
        );
    }

    // Use the search API to get filtered results
    const searchResult = await searchByKeyword({ query: query.trim() });

    if ("error" in searchResult) {
        return (
            <main className="flex flex-col min-w-fit min-h-fit">
                <div className="flex w-full justify-center pt-6">
                    <SearchBar />
                </div>
                <div className="min-h-screen mx-auto p-10">
                    <p className="text-lg font-bold text-red-500">
                        Error searching experiences: {searchResult.message}
                    </p>
                </div>
            </main>
        );
    }

    const experiences: Experience[] = searchResult.results;

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