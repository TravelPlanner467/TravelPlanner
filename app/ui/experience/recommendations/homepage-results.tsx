'use client'
import { useState } from 'react';
import SearchResultsCard from "@/app/ui/experience/search/search-results-card";
import Pagination from "@/app/ui/components/pagination";
import {Experience, ExperienceListProps} from "@/lib/types";

const ITEMS_PER_PAGE = 6;

export function HomepageResults({experiences}: ExperienceListProps) {
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
                <h1 className="text-4xl font-bold mb-2">Popular Experiences</h1>
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