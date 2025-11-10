// app/admin/manage-users/page.tsx
import {getAllUsers} from "@/lib/actions/auth-actions";
import {redirect} from "next/navigation";
import UserManagement from "@/app/ui/admin/user-management";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

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

    // Load user data
    const users = await getAllUsers();
    if (!users) {
        return (
            <div>
                Error loading users.
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
            <UserManagement users={users} session_user_id={session.user.id}/>
        </div>
    );
}
