'use client'

import dynamic from 'next/dynamic';
import {EditExperienceLoadProps} from "@/lib/types";

// dynamic wrapper for handling "leaflet"
const EditExperienceClient = dynamic(
    () => import('./edit-experience'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-lg font-medium">Loading map...</div>
                </div>
            </div>
        )
    }
);

export default function EditExperienceWrapper({ session_user_id, experience }: EditExperienceLoadProps) {
    return <EditExperienceClient session_user_id={session_user_id} experience={experience}/>;
}
