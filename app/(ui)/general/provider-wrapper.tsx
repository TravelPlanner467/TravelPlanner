'use client'

import { ReactNode } from "react";
import { GoogleMapsProvider } from "@/app/(ui)/general/google-maps-provider";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <GoogleMapsProvider>
            {children}
        </GoogleMapsProvider>
    );
}
