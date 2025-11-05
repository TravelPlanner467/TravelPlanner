'use client'
import { useState } from 'react';

import Pagination from "@/app/ui/components/pagination";
import UserExperiencesCard from "@/app/ui/account/experiences/user-experiences-card";
import {Experience} from "@/lib/types";

interface UserExperienceProps {
    user_id: string;
    experiences: Experience[]
}

const ITEMS_PER_PAGE = 6;

export function UserExperiences({ user_id, experiences }: UserExperienceProps) {
    // Pagination calculations
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
        <div className="w-full flex flex-col">
            {/*User Experiences List*/}
            <div className="flex flex-col gap-4">
                {currentExperiences.map((exp: Experience) => (
                    <UserExperiencesCard key={exp.experience_id} experience={exp} user_id={user_id}/>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChangeAction={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}