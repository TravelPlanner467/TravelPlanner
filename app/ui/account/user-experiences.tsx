'use client'
import { useState } from 'react';

import Pagination from "@/app/ui/components/pagination";
import UserExperiencesCard from "@/app/ui/account/user-experiences-card";
import {ErrorResponse, Experience} from "@/lib/types";

interface UserExperienceProps {
    userID: string;
    experiences: Experience[] | ErrorResponse
}

const ITEMS_PER_PAGE = 6;

export function UserExperiences({ userID, experiences }: UserExperienceProps) {
    if ("error" in experiences) {
        return (
            <div className="min-h-[40vh] w-full flex items-center justify-center">
                <div className="max-w-xl w-full border border-red-200 bg-red-50 text-red-700 rounded-md p-4 flex flex-col gap-3">
                    <div className="text-lg font-semibold">Failed to load experiences</div>
                    <div className="text-sm break-words">
                        {experiences.message || 'An unknown error occurred while fetching your experiences.'}
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                        <a
                            href="/experience/create"
                            className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                        >
                            Create Experience
                        </a>
                    </div>
                </div>
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
        <div className="min-h-screen mx-auto px-4 py-10">
            {/*Experience display List*/}
            <div className="space-y-2">
                {currentExperiences.map((exp: Experience) => (
                    <UserExperiencesCard key={exp.experienceID} experience={exp} userID={userID}/>
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