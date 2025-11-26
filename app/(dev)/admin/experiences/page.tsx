import dynamic from 'next/dynamic'

import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import { getAllExperiences } from '@/lib/actions/experience-actions';

export default async function ManageUsersPage() {
    // Validate user session
    const session = await auth.api.getSession({headers: await headers()});
    if (!session) {redirect('/account/login');}

    // Check if user has admin role from database
    if (session.user.role !== 'admin') {
        return (
            <div>
                Unauthorized Access. Please login with an admin account.
            </div>
        )
    }

    // Fetch all experiences
    const experiences = await getAllExperiences()
    if ( "error" in experiences ) {
        return (
            <div>ERROR</div>
        )
    }

    // Dynamically import UserManagement if user is general
    const ExperienceManagement = dynamic(
        () => import("@/app/(dev)/admin/components/experience-management"),
        {
            loading: () => (
                <div className="flex items-center justify-center p-8">
                    <div className="text-gray-600">Loading experience management...</div>
                </div>
            ),
            ssr: true
        }
    );


    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Manage Experiences</h1>
            <ExperienceManagement experiences={experiences}/>
        </div>
    );
}
