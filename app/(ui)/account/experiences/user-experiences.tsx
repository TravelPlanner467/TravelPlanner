'use client'
import { useState } from 'react';

import Pagination from "@/app/(ui)/general/pagination";
import UserExperiencesCard from "@/app/(ui)/account/experiences/user-experiences-card";
import {Experience} from "@/lib/types";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {PaginatedList} from "@/app/(ui)/general/paginated-list";

interface UserExperienceProps {
    session_user_id?: string;
    experiences: Experience[]
}

const ITEMS_PER_PAGE = 6;

export default function UserExperiences({ session_user_id, experiences }: UserExperienceProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get current page from URL, default to 1
    const currentPage = Number(searchParams.get('page')) || 1;

    // Pagination calculations
    const totalPages = Math.ceil(experiences.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentExperiences = experiences.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        // Create new URLSearchParams from current params
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());

        // Update URL without full page reload
        router.push(`${pathname}?${params.toString()}`);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!session_user_id) return (
        <div className="w-full flex flex-col">
            <p className="text-center text-gray-600">User Authentication Issue. Please try again</p>
        </div>
    )

    return (
        <div className="flex max-w-2/3 h-full justify-center p-3">
            {/*User Experiences List*/}
            <PaginatedList
                items={experiences}
                itemsPerPage={6}
                renderItem={(exp: Experience) => (
                    <UserExperiencesCard
                        key={exp.experience_id}
                        experience={exp}
                        user_id={session_user_id}
                    />
                )}
            />
        </div>
    );
}