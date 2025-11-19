import React, {useEffect, useState} from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {UploadedPhoto} from "@/lib/types";

interface PhotoUploadProps {
    maxPhotos: number;
    maxFileSizeMB: number;
    photos: UploadedPhoto[];
    onPhotosChange: (photos: UploadedPhoto[]) => void;
}

interface PhotoPreviewProps {
    photo: UploadedPhoto;
    onRemove: (id: string) => void;
}

export function PhotoUpload({
                                maxPhotos,
                                maxFileSizeMB,
                                photos,
                                onPhotosChange
}: PhotoUploadProps) {

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Check if adding these files would exceed max photos
        if (photos.length + files.length > maxPhotos) {
            alert(`You can only upload ${maxPhotos} photos. Currently have ${photos.length}.`);
            return;
        }

        // Validate and create photo objects
        const newPhotos: UploadedPhoto[] = [];

        for (const file of files) {
            // Check file size
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > maxFileSizeMB) {
                alert(`${file.name} is too large. Maximum size is ${maxFileSizeMB}MB.`);
                continue;
            }

            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file.`);
                continue;
            }

            // Create photo object
            newPhotos.push({
                id: crypto.randomUUID(),
                file: file,
                preview: URL.createObjectURL(file),
                caption: '',
                isExisting: false
            });
        }

        // Add new photos to existing ones
        if (newPhotos.length > 0) {
            onPhotosChange([...photos, ...newPhotos]);
        }

        // Reset input
        e.target.value = '';
    };

    const handleRemovePhoto = (photoId: string) => {
        // Find the photo to revoke its object URL (prevent memory leak)
        const photoToRemove = photos.find(p => p.id === photoId);
        if (photoToRemove && photoToRemove.preview && !photoToRemove.isExisting) {
            URL.revokeObjectURL(photoToRemove.preview);
        }

        onPhotosChange(photos.filter(p => p.id !== photoId));
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Upload Photos Button */}
            {photos.length < maxPhotos && (
                <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-2
                               px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                               rounded-xl transition-all duration-200 font-semibold
                               shadow-md hover:shadow-lg active:scale-95 w-fit"
                >
                    <PhotoIcon className="w-5 h-5" />
                    Choose Photos ({photos.length}/{maxPhotos})
                </label>
            )}

            <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
            />

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.length > 0 ? (
                    photos.map((photo) => (
                        <PhotoPreview
                            key={photo.id}
                            photo={photo}
                            onRemove={handleRemovePhoto}
                        />
                    ))
                ) : (
                    <EmptyPhotoState />
                )}
            </div>

            {/* Photo Count */}
            {photos.length > 0 && (
                <p className="text-sm text-gray-600">
                    {photos.length} / {maxPhotos} photos uploaded
                </p>
            )}
        </div>
    );
}

function PhotoPreview({ photo, onRemove }: PhotoPreviewProps) {
    // Get display name - either filename or URL
    const displayName = photo.file?.name || photo.photoUrl?.split('/').pop() || 'Existing photo';

    // Get file size if available
    const fileSize = photo.file?.size;
    const fileSizeDisplay = fileSize
        ? fileSize < 1024 * 1024
            ? `${(fileSize / 1024).toFixed(0)}KB`
            : `${(fileSize / (1024 * 1024)).toFixed(1)}MB`
        : null;

    return (
        <div
            className="relative group aspect-square rounded-xl overflow-hidden
                       border-2 border-gray-300 shadow-sm hover:shadow-md
                       transition-all duration-200"
        >
            <img
                src={photo.preview}
                alt={photo.caption || displayName}
                className="w-full h-full object-cover"
            />

            {/* Overlay with filename and remove button */}
            <div className="absolute inset-0 bg-black/50 opacity-0
                            group-hover:opacity-100 transition-opacity duration-200
                            flex flex-col items-center justify-center p-2"
            >
                <p className="text-white text-xs text-center mb-2 line-clamp-2">
                    {displayName}
                </p>
                <button
                    type="button"
                    onClick={() => onRemove(photo.id!)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-full
                               transition-colors shadow-lg active:scale-90"
                    aria-label={`Remove ${displayName}`}
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
                {/* Existing photo badge */}
                {photo.isExisting && (
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Existing
                    </div>
                )}

                {/* File size badge (only for new uploads) */}
                {fileSizeDisplay && (
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {fileSizeDisplay}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyPhotoState() {
    return (
        <div className="flex flex-col items-center justify-center py-6 px-12 bg-white/50 text-center
                        rounded-xl border-2 border-dashed border-gray-300
                        col-span-2 sm:col-span-3 md:col-span-4"
        >
            <PhotoIcon className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-1">
                No photos selected
            </p>
            <p className="text-sm text-gray-400">
                Click "Choose Photos" to add images
            </p>
        </div>
    );
}
