import {auth} from "@/lib/auth";
import {LatLng} from "leaflet";

export type Session = typeof auth.$Infer.Session;

export interface Experience {
    userID: string;
    experienceID?: string;
    title: string;
    description?: string;
    experience_date: string;
    create_date: string;
    address: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    keywords: string[];
    imageURLs?: string[];
    images?:[];
    rating: number;
}

export interface CreateExperienceProps {
    userID: string;
    title: string;
    description?: string;
    experience_date: string;
    create_date: string;
    address: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    keywords: string[];
    imageURLs?: string[];
    images?:[];
    rating: number;
}

export interface Trip {
    userID: string;
    tripID: string;
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    experiences: string[];
}

export interface ErrorResponse {
    error: string;
    message?: string;
}

export interface DeleteTripsProps {
    tripID: string;
    userID: string
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