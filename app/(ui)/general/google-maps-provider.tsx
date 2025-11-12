'use client'

import { createContext, useContext, ReactNode } from "react";
import { useLoadScript } from "@react-google-maps/api";

const googleLibraries: ("places" | "marker")[] = ['places', 'marker'];

type GoogleMapsContextType = {
    isLoaded: boolean;
    loadError: Error | undefined;
};

const GoogleMapsContext = createContext<GoogleMapsContextType>({
    isLoaded: false,
    loadError: undefined,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: googleLibraries,
    });

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
            {children}
        </GoogleMapsContext.Provider>
    );
}
