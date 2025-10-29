'use client'

import {DeleteExperienceProps} from "@/lib/types";
import {deleteExperience} from "@/lib/actions/experience-actions";
import {TrashIcon} from "@heroicons/react/24/outline";
import Link from "next/link";

export function EditExperienceButton({user_id, experience_id}: DeleteExperienceProps) {
    return (
        <Link
            href={`/account/experiences/edit?q=${experience_id}`}
            className="bg-white rounded-lg px-3 py-2 text-sm border border-gray-200
            transition-all hover:shadow-lg hover:scale-[1.01]"
        >
                Edit
        </Link>
    )
}

export function DeleteExperienceButton({user_id, experience_id}: DeleteExperienceProps) {
    const formData: DeleteExperienceProps = {user_id, experience_id}

    function onDeleteClick() {
        const result = confirm("Are you sure you want to delete this experiences?");
        if (result) {
            console.log(formData);
            deleteExperience(formData)
        }
    }

    return (
        <button
            onClick={onDeleteClick}
            className="bg-white rounded-lg px-3 text-sm border border-gray-200
            transition-all hover:shadow-lg hover:scale-[1.01]"
        >
            <svg className="w-4 h-4">
                <TrashIcon />
            </svg>
        </button>
    )
}

export function NewExperienceButton() {
    return (
        <Link
            href={"/experience/create"}
            className="w-[200px] px-6 py-2 text-center
                  border border-blue-800 shadow-sm rounded-lg
                  hover:shadow-lg hover:scale-[1.01]"
        >
            + New Experience
        </Link>
    )
}