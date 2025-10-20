import { Suspense } from 'react';
import {ExperienceDetailsContent} from "@/app/ui/experience/experience-details";

export default function ExperienceDetailsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <ExperienceDetailsContent />
        </Suspense>
    );
}
