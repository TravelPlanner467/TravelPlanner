import {getTopExperiences} from "@/lib/actions/experience-actions";
import {ErrorResponse, Experience} from "@/lib/types";
import {HomepageRecommendations} from "@/app/(ui)/experience/recommendations/homepage-results";
import ErrorCard from "@/app/(ui)/general/error-display";
import ComboSearchBar from "@/app/(ui)/experience/search/combo-search-bar";

export default async function Page() {
    // // Fetch top 6 experiences from database
    // const topExperiences: Experience[] | ErrorResponse = await getTopExperiences();
    // if ("error" in topExperiences) {
    //     return (
    //         <ErrorCard error={topExperiences.error} message={topExperiences.message} />
    //     );
    // }

    return (
        <div className="flex flex-col w-full p-4 gap-24 text-center items-center">
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

            {/*/!*Recommended Experiences*!/*/}
            {/*<div className="w-3/4">*/}
            {/*    <HomepageRecommendations experiences={topExperiences}/>*/}
            {/*</div>*/}
        </div>
    );
}
