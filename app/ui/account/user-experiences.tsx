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