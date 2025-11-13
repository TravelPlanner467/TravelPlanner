import { useState, useEffect } from 'react';

export interface PhotoFile {
    id: string;
    file: File;
    preview: string;
}

interface UsePhotoUploadOptions {
    maxPhotos?: number;
    maxFileSizeMB?: number;
}

export const usePhotoUpload = (options: UsePhotoUploadOptions = {}) => {
    const { maxPhotos = 10, maxFileSizeMB = 5 } = options;
    const [photos, setPhotos] = useState<PhotoFile[]>([]);

    // Cleanup photo previews when component unmounts
    useEffect(() => {
        return () => {
            photos.forEach(photo => URL.revokeObjectURL(photo.preview));
        };
    }, [photos]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newPhotos: PhotoFile[] = [];
        const remainingSlots = maxPhotos - photos.length;

        if (remainingSlots <= 0) {
            alert(`Maximum of ${maxPhotos} photos allowed`);
            return;
        }

        const filesToProcess = Math.min(files.length, remainingSlots);
        const maxSize = maxFileSizeMB * 1024 * 1024;

        for (let i = 0; i < filesToProcess; i++) {
            const file = files[i];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                continue;
            }

            // Validate file size
            if (file.size > maxSize) {
                alert(`${file.name} is too large. Maximum size is ${maxFileSizeMB}MB`);
                continue;
            }

            const photoFile: PhotoFile = {
                id: `${Date.now()}-${i}`,
                file: file,
                preview: URL.createObjectURL(file)
            };

            newPhotos.push(photoFile);
        }

        setPhotos(prev => [...prev, ...newPhotos]);

        // Reset input
        e.target.value = '';
    };

    const handleRemovePhoto = (id: string) => {
        setPhotos(prev => {
            const photoToRemove = prev.find(p => p.id === id);
            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.preview);
            }
            return prev.filter(p => p.id !== id);
        });
    };

    const clearAllPhotos = () => {
        photos.forEach(photo => URL.revokeObjectURL(photo.preview));
        setPhotos([]);
    };

    return {
        photos,
        handlePhotoUpload,
        handleRemovePhoto,
        clearAllPhotos,
        photoCount: photos.length,
        maxPhotos,
    };
};
