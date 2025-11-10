import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import Link from "next/link";

export default async function Page() {
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

  return (
      <div className="flex flex-col justify-center items-center gap-4 p-8">
          <h1>Admin Page</h1>
          <Link href="/admin/user-management"
                className="text-blue-500 underline">
              Manage Users & Roles
          </Link>
      </div>
  )
}