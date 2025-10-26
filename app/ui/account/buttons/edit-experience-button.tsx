import {DeleteExperienceProps} from "@/lib/types";
import {useRouter} from "next/navigation";

export function EditExperienceButton({userID, experienceID}: DeleteExperienceProps) {
    const router = useRouter();

    function editExperience() {
        router.push(`/account/experiences/edit?q=${experienceID}`);
    }

    return (
        <button
            onClick={editExperience}
            className="bg-white rounded-lg p-3 border border-gray-200
            transition-all duration-200  hover:shadow-lg hover:scale-[1.01]"
        >
                Edit
        </button>
    )
}