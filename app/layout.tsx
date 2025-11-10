import '@/app/(ui)/global.css'
import { inter } from '@/app/(ui)/fonts';
import Navbar from "@/app/(ui)/components/navbar";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    return (
    <html lang="en" className="h-full">
        <body suppressHydrationWarning className={`${inter.className} antialiased h-full flex flex-col`}>
          <Navbar session={session}/>
          <main className="flex-1 min-h-0">
              {children}
          </main>
      </body>
    </html>
);
}




