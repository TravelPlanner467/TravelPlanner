'use client'

import {DeleteExperienceProps} from "@/lib/types";
import {useRouter} from "next/navigation";
import {deleteExperience} from "@/lib/actions/experience-actions";
import {TrashIcon} from "@heroicons/react/24/outline";

export function EditExperienceButton({user_id, experience_id}: DeleteExperienceProps) {
    const router = useRouter();

    function onEditClick() {
        router.push(`/account/experiences/edit?q=${experience_id}`);
    }

    return (
        <button
            onClick={onEditClick}
            className="bg-white rounded-lg px-3 py-2 text-sm border border-gray-200
            transition-all hover:shadow-lg hover:scale-[1.01]"
        >
                Edit
        </button>
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
    const router = useRouter();
    return (
        <button
            onClick={() => router.push("/experience/create")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
            + New Experience
        </button>
    )
}