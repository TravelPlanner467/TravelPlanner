import '@/app/(ui)/global.css'
import { inter } from '@/app/(ui)/fonts';
import Navbar from "@/app/(ui)/general/navbar";
import {auth} from "@/lib/auth";
import {GoogleMapsProvider} from "@/app/(ui)/general/google-maps-provider";
import {headers} from "next/headers";


export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    return (
    <html lang="en" className="h-full">
        <body suppressHydrationWarning className={`${inter.className} antialiased h-full flex flex-col`}>
          <Navbar session={session}/>
          <main className="flex-1 min-h-0">
              <GoogleMapsProvider>
              {children}
              </GoogleMapsProvider>
          </main>
      </body>
    </html>
);
}




