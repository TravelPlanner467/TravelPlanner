'use server'

import { Experience, ErrorResponse } from "@/lib/types";

export interface SearchByKeywordParams {
    query: string;
    limit?: number;
    offset?: number;
}

export interface SearchByLocationParams {
    lat: number;
    lon: number;
    radius?: number;
    limit?: number;
    offset?: number;
}

export interface SearchCombinedParams {
    query: string;
    lat: number;
    lon: number;
    radius?: number;
    limit?: number;
    offset?: number;
}

export interface SearchResponse {
    query?: string;
    location?: { lat: number; lon: number };
    radius_km?: number;
    count: number;
    limit: number;
    offset: number;
    results: Experience[];
}

export interface SuggestionsResponse {
    query: string;
    suggestions: string[];
}

/**
 * Search experiences by keyword
 * Searches through titles, descriptions, and keywords
 */
export async function searchByKeyword(
    params: SearchByKeywordParams
): Promise<SearchResponse | ErrorResponse> {
    try {
        const queryParams = new URLSearchParams({
            q: params.query,
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/search/keyword?${queryParams}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store', // Disable caching for search results
            }
        );

        if (response.ok) {
            const result = await response.json();
            console.log(`Search OK: ${response.status}`);
            return result as SearchResponse;
        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Search Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Search failed:', error);
        return {
            error: "Error in: searchByKeyword",
            message: `${error}`,
        };
    }
}

/**
 * Search experiences by location
 * Finds experiences within a radius of given coordinates
 */
export async function searchByLocation(
    params: SearchByLocationParams
): Promise<SearchResponse | ErrorResponse> {
    try {
        const queryParams = new URLSearchParams({
            lat: params.lat.toString(),
            lon: params.lon.toString(),
            ...(params.radius && { radius: params.radius.toString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/search/location?${queryParams}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (response.ok) {
            const result = await response.json();
            console.log(`Location Search OK: ${response.status}`);
            return result as SearchResponse;
        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Location Search Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Location search failed:', error);
        return {
            error: "Error in: searchByLocation",
            message: `${error}`,
        };
    }
}

/**
 * Search experiences by both keyword and location
 * Combines keyword search with geographic filtering
 */
export async function searchCombined(
    params: SearchCombinedParams
): Promise<SearchResponse | ErrorResponse> {
    try {
        const queryParams = new URLSearchParams({
            q: params.query,
            lat: params.lat.toString(),
            lon: params.lon.toString(),
            ...(params.radius && { radius: params.radius.toString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/search/combined?${queryParams}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (response.ok) {
            const result = await response.json();
            console.log(`Combined Search OK: ${response.status}`);
            return result as SearchResponse;
        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Combined Search Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Combined search failed:', error);
        return {
            error: "Error in: searchCombined",
            message: `${error}`,
        };
    }
}

/**
 * Get search suggestions for autocomplete
 * Returns keywords and titles matching partial query
 */
export async function getSearchSuggestions(
    query: string,
    limit?: number
): Promise<SuggestionsResponse | ErrorResponse> {
    try {
        if (!query || query.length < 2) {
            return {
                query: query,
                suggestions: [],
            };
        }

        const queryParams = new URLSearchParams({
            q: query,
            ...(limit && { limit: limit.toString() }),
        });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/search/suggestions?${queryParams}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (response.ok) {
            const result = await response.json();
            return result as SuggestionsResponse;
        } else {
            console.error(`HTTP error: ${response.status}`);
            return {
                error: `Suggestions Error: ${response.status}`,
                message: `${response.statusText}`,
            };
        }
    } catch (error) {
        console.error('Get suggestions failed:', error);
        return {
            error: "Error in: getSearchSuggestions",
            message: `${error}`,
        };
    }
}
