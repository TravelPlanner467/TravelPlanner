'use client'

import dynamic from 'next/dynamic';

// dynamic wrapper for handling "leaflet"
const CreateExperienceClient = dynamic(
    () => import('./create-experience'),
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

export default function CreateExperienceWrapper({ user_id }: { user_id: string }) {
    return <CreateExperienceClient user_id={user_id} />;
}
