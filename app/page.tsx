import ComboSearchBar from "@/app/(ui)/experience/search/combo-search-bar";

export default async function Page() {
    return (
        <div className="flex flex-col w-full h-full justify-center items-center">
            {/*Site Title*/}
            <div className="mb-16 -mt-96 text-center">
                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6
                               tracking-tight">
                    Crowd-Sourced
                    <span className="block text-transparent bg-clip-text
                                   bg-gradient-to-r from-blue-500 to-blue-800">
                        Travel Planner
                    </span>
                </h1>
                <p className="text-xl text-gray-600 font-medium">
                    Plan your next adventure
                </p>
            </div>

            {/*Experiences Search Bar*/}
            <div className="flex w-3/4 max-w-5xl justify-center items-center">
                <ComboSearchBar />
            </div>


        </div>
    );
}
