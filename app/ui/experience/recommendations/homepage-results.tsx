'use client'

import {Experience, ExperienceListProps} from "@/lib/types";
import RecommendationsCard from "@/app/ui/experience/recommendations/recommendations-card";

export function HomepageRecommendations({experiences}: ExperienceListProps) {
    return (
        <div className="flex flex-col border border-gray-400 rounded-lg px-12 py-8">
            {/*Top Row*/}
            <div className="mb-4">
                <h2 className="text-2xl font-bold">Popular Experiences</h2>
            </div>

            {/* Top Experiences Grid */}
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
                {experiences.map((exp: Experience) => (
                    <RecommendationsCard key={exp.experience_id} experience={exp} />
                ))}
            </div>
        </div>
    );
}