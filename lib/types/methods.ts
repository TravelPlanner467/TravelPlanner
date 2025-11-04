import {auth} from "@/lib/auth";
import {LatLng} from "leaflet";

export type Session = typeof auth.$Infer.Session;

//---------------------------------------------------------------------------------------------------------------------
// EXPERIENCE TYPE INTERFACES------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------
export interface Experience {
    user_id: string;
    experience_id: string;
    title: string;
    description: string;
    experience_date: string;
    create_date: string;
    address: string;
    latitude: number;
    longitude: number;
    keywords: string[];
    imageURLs?: string[];
    images?:[];
    user_rating: number;
}

export interface CreateExperienceProps {
    user_id: string;
    title: string;
    description?: string;
    experience_date: string;
    create_date: string;
    address: string;
    latitude: number;
    longitude: number;
    keywords: string[];
    images?:[];
    imageURLs?: string[];
    user_rating: number;
}

export interface DeleteExperienceProps {
    experience_id: string;
    user_id: string
}

export interface EditExperienceProps {
    experience: Experience;
    session_user_id: string;
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

export interface ExperienceListProps {
    experiences: Experience[];
}


//---------------------------------------------------------------------------------------------------------------------
// TRIP TYPE INTERFACES------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------
export interface Trip {
    user_id: string;
    trip_id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    experiences?: string[];
}

export interface CreateTripProps {
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    user_id: string;
    create_date: string;
}

export interface UserTripsProps {
    user_id: string;
    trip_id: string;
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    experience_count: number;
}

export interface TripIDProps {
    trip_id: string;
    user_id: string;
}

export interface ExperienceToTripsProps {
    trip_id: string;
    experience_id: string;
    user_id: string;
}

export interface GetBatchExperiencesProps {
    experience_ids: string[] | undefined;
    user_id: string;
}

export interface AddExperienceToTripButtonProps {
    experience_id: string;
    user_id: string;
    trips?: UserTripsProps[] | ErrorResponse;
}

// --------------------------------------------------------------------------------------------------------------------
// STANDARD COMPONENT PROPS -------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
export interface ReturnButtonProps {
    link: string
    text: string
}

// --------------------------------------------------------------------------------------------------------------------
// ERROR INTERFACE-----------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
export interface ErrorResponse {
    error: string;
    message?: string;
}

