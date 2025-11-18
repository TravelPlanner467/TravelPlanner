import ComboSearchBar from "@/app/(ui)/experience/search/combo-search-bar";
import {searchCombined, searchByKeyword, searchByLocation} from "@/lib/actions/search-actions";
import {Experience} from "@/lib/types";
import ExperiencesDisplay from "@/app/(ui)/experience/experiences-display";

export default async function SearchResultsPage(
    props: { searchParams?: Promise<{ keywords?: string; latitude?: string; longitude?: string; address?: string }> }
) {
    const searchParams = await props.searchParams;
    const keywords = searchParams?.keywords || '';
    const latitude = searchParams?.latitude;
    const longitude = searchParams?.longitude;
    const address = searchParams?.address || '';

    let experiences: Experience[] = [];
    let location = '';

    // Case 1: Both keywords and location provided - use combined search
    if (keywords.trim() && latitude && longitude) {
        const searchResult = await searchCombined({
            query: keywords.trim(),
            lat: parseFloat(latitude),
            lon: parseFloat(longitude),
            radius: 50 // 50km radius, configurable if needed
        });

        if ('results' in searchResult) {
            experiences = searchResult.results;
            location = `${latitude}, ${longitude}`;
        } else {
            console.error('Combined search error:', searchResult);
        }
    }
    // Case 2: Only keywords - use keyword search
    else if (keywords.trim()) {
        const searchResult = await searchByKeyword({
            query: keywords.trim()
        });

        if ('results' in searchResult) {
            experiences = searchResult.results;
            location = 'Everywhere';
        } else {
            console.error('Keyword search error:', searchResult);
        }
    }
    // Case 3: Only location - use location search
    else if (latitude && longitude) {
        const searchResult = await searchByLocation({
            lat: parseFloat(latitude),
            lon: parseFloat(longitude),
            radius: 50
        });

        if ('results' in searchResult) {
            experiences = searchResult.results;
            location = `${latitude}, ${longitude}`;
        } else {
            console.error('Location search error:', searchResult);
        }
    }
    // Case 4: No search params - show empty state
    else {
        return (
            <div className="flex flex-col w-full h-full">
                <div className="w-screen">
                    <ComboSearchBar />
                </div>
                <div className="min-h-screen mx-auto p-10">
                    <p className="text-lg text-gray-600">
                        Enter keywords or a location to find experiences
                    </p>
                </div>
            </div>
        );
    }

    // Parse coordinates once and create structured object for map center
    const initialCenter = latitude && longitude ? {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        address: address || `${latitude}, ${longitude}`
    } : null;

    return (
        <div className="flex flex-col w-full h-full">
            <div className="w-screen">
                <ComboSearchBar />
            </div>
            <div className="flex-1 min-h-0">
                <ExperiencesDisplay
                    keywords={keywords}
                    location={location}
                    initialCenter={initialCenter}
                    experiences={experiences}
                />
            </div>
        </div>
    );
}