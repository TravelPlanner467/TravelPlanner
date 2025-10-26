'use client'
import { useState } from 'react';
import SearchResultsCard from "@/app/ui/experience/search/search-results-card";
import Pagination from "@/app/ui/components/pagination";
import {ErrorResponse, Experience} from "@/lib/types";

interface SearchResultsProps {
    query: string;
    experiences: Experience[] | ErrorResponse
}

const ITEMS_PER_PAGE = 6;

export function SearchResults({ query, experiences }: SearchResultsProps) {
    if ("error" in experiences) {
        return (
            <div>
                TODO: IMPLEMENT EXPERIENCES FETCH ERROR
            </div>
        );
    }

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(experiences.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentExperiences = experiences.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col p-4">
            {/*Search Results Header*/}
            <div className="mb-4">
                <h1 className="text-4xl font-bold mb-2">Search Results</h1>
                <p className="text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, experiences.length)} of {experiences.length} results for {JSON.stringify(query)}
                </p>
            </div>

            {/*Experience display List*/}
            <div className="space-y-2">
                {currentExperiences.map((exp: Experience) => (
                    <SearchResultsCard key={exp.experience_id} experience={exp} />
                ))}
            </div>

            {/*Pagination*/}
            <div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChangeAction={handlePageChange}
                />
            </div>

        </div>
    );
}