'use client'

import React, {useState} from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";

import {SelectableRating} from "@/app/(ui)/experience/buttons/star-rating";
import {KeywordsAutocomplete} from "@/app/(ui)/experience/components/keywords-autocomplete";
import {FreeAddressSearch} from "@/app/(ui)/experience/components/free-address-search";
import {createExperience} from "@/lib/actions/experience-actions";
import {PhotoUpload} from "@/app/(ui)/experience/components/photo-upload";
import {isValidLatitude, isValidLongitude, Location} from "@/lib/utils/nomatim-utils";
import {PhotoFile} from "@/lib/utils/photo-utils";

// ============================================================================
// MAP CONFIG
// ============================================================================
const MAP_CONFIG = {
    defaultCenter: { lat: 44.5618, lng: -123.2823 },
    defaultZoom: 13,
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CreateExperiencePage({ user_id }: { user_id: string }) {
    // formData States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [experienceDate, setExperienceDate] = useState('');
    const [rating, setRating] = useState(0);
    const [uploadedPhotos, setUploadedPhotos] = useState<PhotoFile[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);

    // Page states
    const [currentKeywordInput, setCurrentKeywordInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Location State
    const [location, setLocation] = useState<Location>({
        lat: MAP_CONFIG.defaultCenter.lat,
        lng: MAP_CONFIG.defaultCenter.lng,
        address: ''
    });

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================
    // Handle location selection from FreeAddressSearch
    const handleLocationSelect = (selectedLocation: Location) => {
        setLocation(selectedLocation);
    };

    const parseKeywords = (input: string) => {
        if (!input.trim()) return;

        const newKeywords = input
            .split(',')
            .map(keyword => keyword.trim())
            .filter(keyword => {
                const exists = keywords.some(k => k.toLowerCase() === keyword.toLowerCase());
                return keyword && !exists;
            });

        if (newKeywords.length > 0) {
            setKeywords([...keywords, ...newKeywords]);
            setCurrentKeywordInput('');
        }
    }

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            parseKeywords(currentKeywordInput);
        }
    };

    const handleKeywordInputChange = (value: string) => {
        setCurrentKeywordInput(value);
    };

    const handleRemoveKeyword = (indexToRemove: number) => {
        setKeywords(keywords.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate coordinates
        if (!isValidLatitude(location.lat) || !isValidLongitude(location.lng)) {
            setIsSubmitting(false);
            return alert('Please enter valid coordinates');
        }

        // Validate rating
        if (rating <= 0 || rating > 5) {
            setIsSubmitting(false);
            return alert('Please select a rating between 1 and 5.');
        }

        // Validate keywords
        if (keywords.length === 0 && !currentKeywordInput.trim()) {
            setIsSubmitting(false);
            return alert('Please add at least one keyword.');
        }

        const finalKeywords = currentKeywordInput.trim()
            ? [...keywords, currentKeywordInput.trim()]
            : keywords;

        const formData = {
            user_id: user_id,
            title: title,
            description: description,
            experience_date: experienceDate,
            latitude: location.lat,
            longitude: location.lng,
            address: location.address,
            create_date: new Date().toISOString(),
            user_rating: rating,
            keywords: finalKeywords,
            photos: uploadedPhotos.map(p => p.file),
        };
        console.log(formData);

        // Submit form
        createExperience(formData);
        // TODO: after submit actions
        setIsSubmitting(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-4xl w-full mx-auto p-10
                bg-gradient-to-br from-white to-gray-50
                rounded-2xl shadow-2xl border border-gray-200"
        >
            {/* Form Header */}
            <div className="flex items-center pb-4 gap-3 border-b-2 border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900">Create an Experience</h2>
            </div>
            {/* ========================================= EXPERIENCE INFO  =============================================== */}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Experience Information</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Share your experience with others
                    </p>
                </div>

                {/*Title & Rating*/}
                <div className="flex flex-col md:flex-row w-full gap-6 items-start">
                    {/*Title*/}
                    <div className="flex flex-col flex-1 gap-2 group">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-700 tracking-wide">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                                   bg-white transition-all duration-200
                                   focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                   hover:border-gray-400 shadow-sm"
                            placeholder="Enter your experience title"
                        />
                    </div>

                    {/*Rating*/}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 tracking-wide">
                            Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="px-3 py-2 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <SelectableRating experience_rating={rating} onRatingChange={setRating}/>
                        </div>
                    </div>
                </div>

                {/* Description & Date */}
                <div className="flex flex-col md:flex-row w-full gap-6 items-start">
                    {/*Description*/}
                    <div className="flex flex-col flex-1 gap-2">
                        <label htmlFor="description" className="text-sm font-semibold text-gray-700 tracking-wide">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                                bg-white transition-all duration-200 resize-y
                                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                hover:border-gray-400 shadow-sm"
                            placeholder="Share the details of your experience..."
                        />
                    </div>

                    {/*Date*/}
                    <div className="flex flex-col gap-2 min-w-[180px]">
                        <label htmlFor="experienceDate" className="text-sm font-semibold text-gray-700 tracking-wide">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="experienceDate"
                            type="date"
                            value={experienceDate}
                            onChange={(e) => setExperienceDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}  // Max date == today
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                            bg-white transition-all duration-200
                            focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                            hover:border-gray-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* =========================================== LOCATION  ============================================== */}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Location</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Search, click the map, enter coordinates, or use your current location
                    </p>
                </div>

                <FreeAddressSearch
                    onLocationSelect={handleLocationSelect}
                    initialLocation={location}
                    mapZoom={13}
                />
            </div>

            {/*=========================================== PHOTOS ===================================================*/}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/* Section Header */}
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Photos</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Upload up to 10 photos of your experience (max 5MB each)
                    </p>
                </div>

                <PhotoUpload
                    maxPhotos={10}
                    maxFileSizeMB={5}
                    onPhotosChange={setUploadedPhotos}
                />
            </div>

            {/*============================================ KEYWORDS ================================================*/}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/*Section Header*/}
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Keywords</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Press Enter to add keywords (comma-separated values supported)
                    </p>
                </div>

                <div onKeyDown={handleKeywordKeyDown}>
                    <KeywordsAutocomplete
                        keywords={currentKeywordInput}
                        setKeywords={handleKeywordInputChange}
                    />
                </div>

                {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                        {keywords.map((keyword, index) => (
                            <span
                                key={`keyword-${index}`}
                                className="inline-flex items-center gap-2 px-3 py-1.5
                                           text-md font-medium text-white bg-blue-600
                                           rounded-lg shadow-sm"
                            >
                                {keyword}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveKeyword(index)}
                                    className="hover:bg-white/20 rounded-full p-1
                                        transition-colors active:scale-90"
                                    aria-label={`Remove ${keyword}`}
                                >
                                    <XMarkIcon className="w-4 h-4"/>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-4 px-8 py-4 font-bold text-lg rounded-xl 
                            transition-all duration-200 shadow-lg
                            ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-blue-700 hover:to-blue-800 text-white hover:shadow-xl active:scale-95'
                }`}
            >
                {isSubmitting ? (
                    <p className="flex items-center justify-center gap-3">
                        Creating Experience...
                    </p>
                ) : (
                    'Create Experience'
                )}
            </button>
        </form>
    )
}