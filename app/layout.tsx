import '@/app/(ui)/global.css'
import { inter } from '@/app/(ui)/fonts';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Providers } from "@/app/(ui)/general/provider-wrapper";
import Navbar from "@/app/(ui)/general/navbar";


export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession(
        {headers: await headers()}
    );

    return (
    <html lang="en" className="h-full">
        <body suppressHydrationWarning className={`${inter.className} antialiased h-full flex flex-col`}>
          <Navbar session={session}/>
          <main className="flex-1 min-h-0">
              <Providers>
                  {children}
              </Providers>
          </main>
      </body>
    </html>
);
}




