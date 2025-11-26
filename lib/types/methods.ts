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
    average_rating: number;
    rating_count: number;
    owner_rating?: number;
    photos: Photo[]
}

export interface Photo {
    caption: string;
    photo_id: string;
    photo_url: string;
    upload_date: string;
}

export interface UploadedPhoto {
    id?: string;
    file?: File;              // New uploads
    preview?: string;         // Preview URL
    photoId?: string;         // Existing photos from firebase
    photoUrl?: string;        // Existing photos from firebase
    caption?: string;
    isExisting?: boolean;
}

export interface EditExperienceSendProps {
    experience_id: string;
    session_user_id: string;
    user_id: string;
    title: string;
    description?: string;
    experience_date: string;
    last_updated: string;
    address: string;
    latitude: number;
    longitude: number;
    keywords: string[];
    user_rating: number;
    imageURLs?: string[];
}

export interface RateExperienceProps {
    experience_id: string;
    session_user_id: string;
    rating: number;
}

export interface DeleteExperienceProps {
    experience_id: string;
    user_id: string
}

export interface getUserExperienceProps {
    experience_id: string;
    session_user_id: string;
}

export interface getExperienceByLocationProps {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
}

export interface CreateExperienceResponse {
    experience_id: string;
    message: string;
};


//---------------------------------------------------------------------------------------------------------------------
// TRIP TYPE INTERFACES------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------
export interface Trip {
    user_id: string;
    trip_id: string;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    experiences: TripExperience[]
}

export interface TripExperience {
    experience_id: string;
    order: number;
    title: string;
    description?: string;
    location:{
        lat: number;
        lng: number;
        address: string;
    };
    average_rating: number;
}

export interface UserTripsProps {
    user_id: string;
    trip_id: string;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    experience_count: number;
}

export interface CreateTripProps {
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    user_id: string;
    create_date: string;
}

export interface EditTripProps {
    title: string;
    trip_id: string;
    user_id: string;
    session_user_id?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
}

export interface TripIDProps {
    trip_id: string;
    session_user_id: string;
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

// --------------------------------------------------------------------------------------------------------------------
// STANDARD COMPONENT PROPS -------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
export interface NavButtonProps {
    link: string
    text: string
    width: number
    height: number
}

// --------------------------------------------------------------------------------------------------------------------
// ERROR INTERFACE-----------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
export interface ErrorResponse {
    error: string;
    message?: string;
}