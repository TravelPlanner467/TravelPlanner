import {auth} from "@/lib/auth";
import {LatLng} from "leaflet";

export type Session = typeof auth.$Infer.Session;

// EXPERIENCE TYPE INTERFACES------------------------------------------------------------
export interface Experience {
    user_id: string;
    experience_id?: string;
    title: string;
    description?: string;
    experience_date: string;
    create_date: string;
    address: string;
    latitude: number;
    longitude: number;
    keywords: string[];
    // imageURLs?: string[];
    // images?:[];
    rating: number;
}

export interface DeleteExperienceProps {
    experience_id?: string;
    user_id: string
}

export interface EditExperienceProps {
    experience: Experience | ErrorResponse;
    user_id: string;
}

export interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

export interface MapClickHandlerProps {
    onMapClick: (latlng: LatLng) => void;
}

export interface ChangeMapViewProps {
    center: [number, number];
}

// TRIP TYPE INTERFACES------------------------------------------------------------
export interface Trip {
    userID: string;
    tripID: string;
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    experiences: string[];
}

export interface DeleteTripsProps {
    tripID: string;
    user_id: string
}


// ERROR INTERFACE------------------------------------------------------------------------
export interface ErrorResponse {
    error: string;
    message?: string;
}


// TESTER
export interface PythonTester {
    message: string;
}