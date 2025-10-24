import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts';
import Navbar from "@/app/ui/components/navbar";
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
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.className} antialiased`}>
          <Navbar session={session}/>
          {children}
      </body>
    </html>
);
}




