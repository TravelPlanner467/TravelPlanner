'use client'

import React, {useEffect} from 'react';
import {MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap} from 'react-leaflet';
import L, {Icon} from 'leaflet';

// Leaflet Marker Icon Fix (specific to Next.js)
import 'leaflet/dist/leaflet.css';
import {roundCoordinate} from "@/lib/utils/nomatim-utils";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MarkerData {
    lat: number;
    lng: number;
    id: string;
    title: string;
}

interface InteractiveMapProps {
    center: { lat: number; lng: number };
    zoom: number;
    height?: string;
    selectedMarker?: { lat: number; lng: number } | null;
    markers?: MarkerData[];
    onMapClick?: (lat: number, lng: number) => void;
    onBoundsChange?: (bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    }) => void;
    onMarkerHover?: (experienceId: string | null) => void;
    onMarkerClick?: (experienceId: string) => void;
}

interface OnMapClickProps {
    onClick?: (lat: number, lng: number) => void;
    onBoundsChange?: (bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    }) => void;
}

// Custom icon for experience markers
const experienceIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for selected location
const selectedIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Handle map clicks
function MapClickHandler({ onClick, onBoundsChange }: OnMapClickProps) {
    const map = useMapEvents({
        click: (e) => {
            if (onClick) {
                // Round to 6 decimal places
                const lat = roundCoordinate(e.latlng.lat, 6);
                const lng = roundCoordinate(e.latlng.lng, 6);
                onClick(lat, lng);
            }
        },
        dragend: () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                const northEast = bounds.getNorthEast();
                const southWest = bounds.getSouthWest();

                onBoundsChange({
                    northEast: { lat: northEast.lat, lng: northEast.lng },
                    southWest: { lat: southWest.lat, lng: southWest.lng }
                });
            }
        },
        zoomend: () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                const northEast = bounds.getNorthEast();
                const southWest = bounds.getSouthWest();

                onBoundsChange({
                    northEast: { lat: northEast.lat, lng: northEast.lng },
                    southWest: { lat: southWest.lat, lng: southWest.lng }
                });
            }
        }
    });
    return null;
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1.5 });
    }, [center.lat, center.lng, map]);

    return null;
}

export function InteractiveMap({center, zoom, height = '400px', selectedMarker,
                                   markers = [], onMapClick, onBoundsChange
                                , onMarkerHover, onMarkerClick = () => { }}
                               : InteractiveMapProps) {
    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height, width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onClick={onMapClick} onBoundsChange={onBoundsChange} />
            <RecenterMap center={center} />

            {/* Selected location marker */}
            {selectedMarker && (
                <Marker
                    position={[selectedMarker.lat, selectedMarker.lng]}
                    icon={selectedIcon} zIndexOffset={-1000}
                >
                    <Popup autoPan={false}>Selected Location</Popup>
                </Marker>
            )}

            {/* Experience markers */}
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={[marker.lat, marker.lng]}
                    icon={experienceIcon}
                    zIndexOffset={1000}
                    eventHandlers={{
                        click: () => onMarkerClick?.(marker.id),
                        mouseover: () => onMarkerHover?.(marker.id),
                        mouseout: () => onMarkerHover?.(null)
                    }}
                >
                    <Popup autoPan={false} autoClose={true} closeButton={true}>
                        <div className="text-lg font-semibold">{marker.title}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
