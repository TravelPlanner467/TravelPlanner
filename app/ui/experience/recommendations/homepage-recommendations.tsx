import {ExperienceListProps} from "@/lib/types";
import {HomepageResults} from "@/app/ui/experience/recommendations/homepage-results";


export default function HomepageRecommendations({experiences}: ExperienceListProps) {
    return (
        <div>
            Homepage Recommendations
            <HomepageResults experiences={experiences}/>
        </div>
    )
}