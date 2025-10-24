import {auth} from "@/lib/auth";

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
    photos?: string[];
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

