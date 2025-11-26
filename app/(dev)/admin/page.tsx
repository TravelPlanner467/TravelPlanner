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
      <div className="flex flex-col justify-center items-center gap-6 p-8">
          <h1 className="text-4xl font-bold">Admin Page</h1>
          <Link href="/dev"
                className="w-72 h-20 flex justify-center items-center
                        text-lg font-medium text-blue-900 underline
                        border border-gray-900 shadow-md rounded-lg
                        hover:shadow-lg hover:bg-gray-100"
          >
              Dev Page
          </Link>
          <Link href="/admin/user-management"
                className="w-72 h-20 flex justify-center items-center
                        text-lg font-medium text-blue-900 underline
                        border border-gray-900 shadow-md rounded-lg
                        hover:shadow-lg hover:bg-gray-100"
          >
              Users & Roles
          </Link>
          <Link href="/admin/experiences"
                className="w-72 h-20 flex justify-center items-center
                        text-lg font-medium text-blue-900 underline
                        border border-gray-900 shadow-md rounded-lg
                        hover:shadow-lg hover:bg-gray-100"
          >
              All Experiences (Table)
          </Link>
          <Link href="/admin/experiences-map"
                className="w-72 h-20 flex justify-center items-center
                        text-lg font-medium text-blue-900 underline
                        border border-gray-900 shadow-md rounded-lg
                        hover:shadow-lg hover:bg-gray-100"
          >
              All Experiences (Map)
          </Link>
      </div>
  )
}