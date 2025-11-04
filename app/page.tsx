import SearchBar from "@/app/ui/experience/search/search-bar";
// import HomepageRecommendations from "@/app/ui/experience/recommendations/homepage-recommendations";
import {getTopExperiences} from "@/lib/actions/experience-actions";

export default function Page() {
    const topExperiences = getTopExperiences();

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
    <main className=" min-w-fit min-h-fit w-full flex flex-col p-4 mt-10 gap-12 text-center items-center">
        {/*TITLE*/}
        <div className="flex flex-col gap-4">
          <h1 className={'text-4xl font-bold'}>
            Crowd-Sourced Travel Planner
          </h1>
        </div>

        {/*Experiences Search Bar*/}
        <div className="flex w-full justify-center">
            <SearchBar/>
        </div>

        {/*<div className="flex flex-col items-center">*/}
        {/*    <HomepageRecommendations experiences={topExperiences}/>*/}
        {/*</div>*/}

    </main>
    );
}
