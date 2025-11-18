// ============================================================================
// NOMINATIM CONFIGURATION & UTILITIES
// ============================================================================

export const NOMINATIM_CONFIG = {
    baseUrl: 'https://nominatim.openstreetmap.org/reverse',
    searchUrl: 'https://nominatim.openstreetmap.org/search',
    userAgent: 'YourTravelApp/1.0',
    referer: typeof window !== 'undefined' ? window.location.origin : '',
    minRequestInterval: 1000, // Rate Limit Value (1 second)
} as const;

let lastRequestTime = 0;

export interface NominatimAddress {
    house_number?: string;
    road?: string;
    street?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
}

export interface Location {
    lat: number;
    lng: number;
    address: string;
}

// ============================================================================
// REVERSE GEOCODING
// ============================================================================

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < NOMINATIM_CONFIG.minRequestInterval) {
        await new Promise(resolve =>
            setTimeout(resolve, NOMINATIM_CONFIG.minRequestInterval - timeSinceLastRequest)
        );
    }
    lastRequestTime = Date.now();

    try {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lon: lng.toString(),
            format: 'json',
            addressdetails: '1',
            namedetails: '0',
            extratags: '0',
        });

        const response = await fetch(
            `${NOMINATIM_CONFIG.baseUrl}?${params.toString()}`,
            {
                headers: {
                    'User-Agent': NOMINATIM_CONFIG.userAgent,
                    'Referer': NOMINATIM_CONFIG.referer,
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        const address = formatCleanAddress(data.address);
        return address;
    } catch (error) {
        console.error("Error fetching address from Nominatim:", error);
        return 'Error fetching address';
    }
};

export const formatCleanAddress = (addressData: NominatimAddress): string => {
    if (!addressData) return 'Address not found';

    const parts: string[] = [];
    const streetParts: string[] = [];

    if (addressData.house_number) streetParts.push(addressData.house_number);
    if (addressData.road || addressData.street) {
        streetParts.push(addressData.road || addressData.street || '');
    }
    if (streetParts.length > 0) {
        parts.push(streetParts.join(' '));
    }

    const locality = addressData.city ||
        addressData.town ||
        addressData.village ||
        addressData.suburb;
    if (locality) parts.push(locality);
    if (addressData.state) parts.push(addressData.state);
    if (addressData.postcode) parts.push(addressData.postcode);
    if (addressData.country) parts.push(addressData.country);

    return parts.length > 0 ? parts.join(', ') : 'Address not found';
};

// Coordinate Utilities
export function roundCoordinate(coord: number, decimals: number = 6): number {
    return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export const isValidLatitude = (lat: number): boolean => lat >= -90 && lat <= 90;
export const isValidLongitude = (lng: number): boolean => lng >= -180 && lng <= 180;

// ============================================================================
// CACHED REVERSE GEOCODING
// ============================================================================

/**
 * Cached reverse geocoding to reduce API calls
 * Cache key is rounded to ~100m precision (4 decimal places)
 */
const geocodeCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

export async function reverseGeocodeWithCache(
    lat: number,
    lng: number
): Promise<string | null> {
    // Round to 4 decimal places (~11m precision)
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

    // Check cache first
    if (geocodeCache.has(cacheKey)) {
        return geocodeCache.get(cacheKey) || null;
    }

    try {
        const address = await reverseGeocode(lat, lng);

        if (address && address !== 'Error fetching address') {
            geocodeCache.set(cacheKey, address);

            // Limit cache size to prevent memory issues
            if (geocodeCache.size > MAX_CACHE_SIZE) {
                const firstKey = geocodeCache.keys().next().value;
                if (firstKey) {
                    geocodeCache.delete(firstKey);
                }
            }
        }

        return address;
    } catch (error) {
        console.error('Cached reverse geocode failed:', error);
        return null;
    }
}