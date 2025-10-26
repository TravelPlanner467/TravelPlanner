import {DeleteExperienceProps} from "@/lib/types";
import {TrashIcon} from "@heroicons/react/24/outline";
import {deleteExperience} from "@/lib/actions/experience-actions";

export function DeleteExperienceButton({userID, experienceID}: DeleteExperienceProps) {
    const formData: DeleteExperienceProps = {userID, experienceID}

    function onDeleteClick() {
        const result = confirm("Are you sure you want to delete this experience?");
        if (result) {
            console.log(formData);
            deleteExperience(formData)
        }
    }

    return (
        <button
            onClick={onDeleteClick}
            className="bg-white rounded-lg p-3 border border-gray-200
            transition-all duration-200  hover:shadow-lg hover:scale-[1.01]"
        >
            <svg className={ "w-8 h-8"}>
                <TrashIcon />
            </svg>
        </button>
    )
}