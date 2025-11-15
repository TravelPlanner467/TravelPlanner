import React, {useEffect} from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {PhotoFile, usePhotoUpload} from "@/lib/utils/photo-utils";

interface PhotoUploadProps {
    maxPhotos?: number;
    maxFileSizeMB?: number;
    onPhotosChange?: (photos: PhotoFile[]) => void; // Optional callback to parent
}

interface PhotoPreviewProps {
    photo: PhotoFile;
    onRemove: (id: string) => void;
}

export function PhotoUpload({maxPhotos = 10, maxFileSizeMB = 5, onPhotosChange}: PhotoUploadProps) {
    const {
        photos,
        handlePhotoUpload,
        handleRemovePhoto,
        photoCount,
    } = usePhotoUpload({ maxPhotos, maxFileSizeMB });

    // Notify parent when photos change (if callback provided)
    useEffect(() => {
        onPhotosChange?.(photos);
    }, [photos, onPhotosChange]);

    return (
        <div className="flex flex-col gap-4">
            {/* Upload Photos Button */}
            <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex items-center justify-center gap-2
                           px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white
                           rounded-xl transition-all duration-200 font-semibold
                           shadow-md hover:shadow-lg active:scale-95 w-fit"
            >
                <PhotoIcon className="w-5 h-5" />
                Choose Photos
            </label>
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
            <p className="text-sm text-gray-600">
                {photoCount} / {maxPhotos} photos uploaded
            </p>
        </div>
    );
}

function PhotoPreview({ photo, onRemove }: PhotoPreviewProps) {
    return (
        <div
            className="relative group aspect-square rounded-xl overflow-hidden
                       border-2 border-gray-300 shadow-sm hover:shadow-md
                       transition-all duration-200"
        >
            <img
                src={photo.preview}
                alt={photo.file.name}
                className="w-full h-full object-cover"
            />

            {/* Overlay with filename and remove button */}
            <div className="absolute inset-0 bg-black/50 opacity-0
                            group-hover:opacity-100 transition-opacity duration-200
                            flex flex-col items-center justify-center p-2"
            >
                <p className="text-white text-xs text-center mb-2 line-clamp-2">
                    {photo.file.name}
                </p>
                <button
                    type="button"
                    onClick={() => onRemove(photo.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-full
                               transition-colors shadow-lg active:scale-90"
                    aria-label={`Remove ${photo.file.name}`}
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Photo size badge */}
            <div className="absolute top-2 right-2 bg-black/70 text-white
                            text-xs px-2 py-1 rounded-full"
            >
                {photo.file.size < 1024 * 1024
                    ? `${(photo.file.size / 1024).toFixed(0)}KB`
                    : `${(photo.file.size / (1024 * 1024)).toFixed(1)}MB`
                }
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
