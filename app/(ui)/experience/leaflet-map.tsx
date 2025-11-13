'use client'

import React, {useEffect} from 'react';
import {MapContainer, TileLayer, Marker, useMapEvents, useMap} from 'react-leaflet';
import L from 'leaflet';

// Leaflet Marker Icon Fix (specific to Next.js)
import 'leaflet/dist/leaflet.css';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ============================================================================
// MAP COMPONENTS
// ============================================================================

// Handle map clicks
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Update map center
function MapCenterController({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap();
    useEffect(() => {
        map.setView([center.lat, center.lng]);
    }, [center, map]);
    return null;
}

// ============================================================================
// MAIN MAP COMPONENT
// ============================================================================

interface InteractiveMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markerPosition?: { lat: number; lng: number } | null;
    onMapClick: (lat: number, lng: number) => void;
    height?: string;
    className?: string;
}

export function InteractiveMap({
                                   center,
                                   zoom = 13,
                                   markerPosition,
                                   onMapClick,
                                   height = '350px',
                                   className = ''
                               }: InteractiveMapProps) {
    return (
        <div className={`w-full border-2 border-gray-300 rounded-xl overflow-hidden shadow-md ${className}`} style={{ height }}>
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onClick={onMapClick} />
                <MapCenterController center={center} />
                {markerPosition && (
                    <Marker position={[markerPosition.lat, markerPosition.lng]} />
                )}
            </MapContainer>
        </div>
    );
}
