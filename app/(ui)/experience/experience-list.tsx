'use client'
import { useState } from 'react';
import {ExperienceListCard} from "@/app/(ui)/experience/display/experience-list-card";
import {Experience} from "@/lib/types";
import {PaginatedList} from "@/app/(ui)/general/paginated-list";

interface ExperienceListProps {
    experiences: Experience[]
    session_user_id?: string;
    keywords?: string;
    location?: string
}

const ITEMS_PER_PAGE = 6;

export default function ExperiencesList({ keywords, location, experiences, session_user_id }: ExperienceListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return (
        <div className="flex flex-col w-full items-center px-4 py-3">
            <div className="w-full max-w-5xl">
                {/*User Experiences List*/}
                <PaginatedList
                    items={experiences}
                    itemsPerPage={6}
                    renderItem={(exp: Experience) => (
                        <ExperienceListCard
                            key={exp.experience_id}
                            experience={exp}
                            session_user_id={session_user_id}
                        />
                    )}
                />
            </div>
        </div>
    );
}