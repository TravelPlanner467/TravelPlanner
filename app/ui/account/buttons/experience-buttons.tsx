'use client'

import {DeleteExperienceProps} from "@/lib/types";
import {deleteExperience} from "@/lib/actions/experience-actions";
import {TrashIcon} from "@heroicons/react/24/outline";
import Link from "next/link";


export function NewExperienceButton() {
    return (
        <Link
            href={"/experience/create"}
            className={`w-48 h-10 flex justify-center items-center
                border-2 border-blue-800 rounded-lg
                hover:shadow-lg hover:scale-[1.1]`}
        >
            + New Experience
        </Link>
    )
}

export function EditExperienceButton({experience_id}: {experience_id: string}) {
    return (
        <Link
            href={`/account/experiences/edit?q=${experience_id}`}
            className={`w-16 h-10 flex justify-center items-center
                border-2 border-gray-900 rounded-lg
                hover:shadow-lg hover:scale-[1.1]`}
        >
            <p className="text-center text-sm font-medium">
                Edit
            </p>
        </Link>
    )
}

export function ViewExperienceButton({experience_id}: {experience_id: string}) {
    return (
        <Link
            href={`/experience/details?q=${experience_id}`}
            className={`w-16 h-10 flex justify-center items-center
                border-2 border-gray-900 rounded-lg
                hover:shadow-lg hover:scale-[1.1]`}
        >
            <p className="text-center text-sm font-medium">
                View
            </p>
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
            className={`w-10 h-10 flex justify-center items-center
                border-2 border-red-900 rounded-lg
                hover:shadow-lg hover:scale-[1.1]`}
        >
            <TrashIcon className="w-4 h-4 text-red-900"/>
        </button>
    )
}
