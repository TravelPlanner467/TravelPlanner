import SearchBar from "@/app/ui/experience/search/search-bar";
import {getTopExperiences} from "@/lib/actions/experience-actions";
import {ErrorResponse, Experience} from "@/lib/types";
import {HomepageRecommendations} from "@/app/ui/experience/recommendations/homepage-results";
import ComboSearchBar from "@/app/ui/experience/search/combo-search-bar";

export default async function Page() {
    // Fetch top 6 experiences from database
    const topExperiences: Experience[] | ErrorResponse = await getTopExperiences();
    if ("error" in topExperiences) {
        return (
            <div className="min-h-screen mx-auto p-10">
                <p className="text-lg font-bold text-red-500">
                    Error fetching Popular Experiences
                </p>
            </div>
        );
    }

    return (
        <main className="min-w-fit min-h-fit w-full flex flex-col
                        p-4 gap-24 text-center items-center"
        >
            {/*Site Title*/}
            <div className="mt-12">
                <h1 className="text-4xl font-bold">
                    Crowd-Sourced Travel Planner
                </h1>
            </div>

            {/*Experiences Search Bar*/}
            <div className="w-3/4">
                <ComboSearchBar />
            </div>

            {/*Recommended Experiences*/}
            <div className="w-3/4">
                <HomepageRecommendations experiences={topExperiences}/>
            </div>
        </main>
    );
}
