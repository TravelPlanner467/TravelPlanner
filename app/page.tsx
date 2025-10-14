import SearchBar from "@/app/ui/navigation/search-bar";

export default function Page() {
  return (
    <main className="flex flex-col p-4 mt-10 gap-12 min-w-fit min-h-fit">
        <div className="flex flex-col w-full text-center items-center">
        {/*TITLE / INFO TEXT*/}
        <div className="flex flex-col gap-4">
          <h1 className={'text-4xl font-bold'}>
            Crowd-Sourced Travel Planner
          </h1>
        </div>
        </div>

        <div className="flex flex-col items-center">
            <SearchBar />
        </div>

        <div className="flex flex-col items-center">
            Homepage Recommendations
        </div>

    </main>
  );
}
