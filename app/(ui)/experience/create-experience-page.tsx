'use client'

import React, {useState} from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {XMarkIcon} from "@heroicons/react/24/outline";

import {SelectableRating} from "@/app/(ui)/experience/buttons/star-rating";
import {KeywordsAutocomplete} from "@/app/(ui)/experience/components/keywords-autocomplete";
import {FreeAddressSearch} from "@/app/(ui)/experience/components/free-address-search";
import {createExperience, fetchSuggestedKeywords} from "@/lib/actions/experience-actions";
import {PhotoUpload} from "@/app/(ui)/experience/components/photo-upload";
import {isValidLatitude, isValidLongitude, Location} from "@/lib/utils/nomatim-utils";
import {PhotoFile} from "@/lib/utils/photo-utils";

// ============================================================================
// TYPE
// ============================================================================
type ExperienceFormData = {
    title: string;
    description: string;
    experienceDate: string;
    rating: number;
    location: Location;
    uploadedPhotos: PhotoFile[];
    keywords: string[];
    currentKeywordInput: string;
};

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
    const {register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting }
    } = useForm<ExperienceFormData>({
        defaultValues: {
            title: '',
            description: '',
            experienceDate: '',
            rating: 0,
            location: {
                lat: MAP_CONFIG.defaultCenter.lat,
                lng: MAP_CONFIG.defaultCenter.lng,
                address: ''
            },
            uploadedPhotos: [],
            keywords: [],
            currentKeywordInput: ''
        }
    });

    // Watch values for updating individual form-fields
    const keywords = watch('keywords');
    const currentKeywordInput = watch('currentKeywordInput');
    const [title, description] = watch(['title', 'description']);

    // State for keyword generation
    const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
    const canGenerateKeywords = title.trim().length > 0 && description.trim().length > 0;

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================
    // Handle location selection from FreeAddressSearch
    const handleLocationSelect = (selectedLocation: Location) => {
        setValue('location', selectedLocation);
    };

    // Split keywords if input is CSVs
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
            setValue('keywords', [...keywords, ...newKeywords]);
            setValue('currentKeywordInput', '');
        }
    };

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            parseKeywords(currentKeywordInput);
        }
    };

    const handleRemoveKeyword = (indexToRemove: number) => {
        setValue('keywords', keywords.filter((_, index) => index !== indexToRemove));
    };

    // Handle keyword generation
    const handleGenerateKeywords = async () => {
        setIsGeneratingKeywords(true);
        try {
            const suggestedKeywords = await fetchSuggestedKeywords({title, description});

            // Merge suggested keywords with existing ones, avoiding duplicates
            const newKeywords = suggestedKeywords.filter(
                keyword => !keywords.some(k => k.toLowerCase() === keyword.toLowerCase())
            );

            setValue('keywords', [...keywords, ...newKeywords]);
        } catch (error) {
            console.error('Failed to generate keywords:', error);
            alert('Failed to generate keywords. Please try again.');
        } finally {
            setIsGeneratingKeywords(false);
        }
    };

    // ========================================================================
    // FORM SUBMISSION
    // ========================================================================
    const onSubmit: SubmitHandler<ExperienceFormData> = async (data) => {
        // Validate coordinates
        if (!isValidLatitude(data.location.lat) || !isValidLongitude(data.location.lng)) {
            return alert('Please enter valid coordinates');
        }

        // Validate rating
        if (data.rating <= 0 || data.rating > 5) {
            return alert('Please select a rating between 1 and 5.');
        }

        // Validate keywords
        if (data.keywords.length === 0 && !data.currentKeywordInput.trim()) {
            return alert('Please add at least one keyword.');
        }

        const finalKeywords = data.currentKeywordInput.trim()
            ? [...data.keywords, data.currentKeywordInput.trim()]
            : data.keywords;

        const formData = new FormData();

        formData.append('user_id', user_id);
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('experience_date', data.experienceDate);
        formData.append('address', data.location.address);
        formData.append('latitude', data.location.lat.toString());
        formData.append('longitude', data.location.lng.toString());
        formData.append('user_rating', data.rating.toString());
        formData.append('keywords', JSON.stringify(finalKeywords));

        data.uploadedPhotos.forEach(photo => {
            formData.append('photos', photo.file);
        });

        console.log(formData);

        try {
            await createExperience(formData);
            // Reset form or redirect
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
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
                            placeholder="Enter your experience title"
                            {...register('title', { required: 'Title is required' })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                                   bg-white transition-all duration-200
                                   focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                   hover:border-gray-400 shadow-sm"
                        />
                        {errors.title && (
                            <span className="text-sm text-red-500">{errors.title.message}</span>
                        )}
                    </div>

                    {/*Rating*/}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 tracking-wide">
                            Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="px-3 py-2 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <Controller
                                name="rating"
                                control={control}
                                rules={{ required: 'Rating is required', min: 1, max: 5 }}
                                render={({ field: { value, onChange } }) => (
                                    <SelectableRating
                                        value={value}
                                        onChange={onChange}
                                    />
                                )}
                            />
                        </div>
                        {errors.rating && (
                            <span className="text-sm text-red-500">{errors.rating.message}</span>
                        )}
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
                            placeholder="Share the details of your experience..."
                            rows={4}
                            {...register('description')}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                                bg-white transition-all duration-200 resize-y
                                focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                hover:border-gray-400 shadow-sm"
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
                            {...register('experienceDate', { required: 'Date is required' })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                                      bg-white transition-all duration-200
                                      focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                      hover:border-gray-400 shadow-sm"
                        />
                        {errors.experienceDate && (
                            <span className="text-sm text-red-500">{errors.experienceDate.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================================== LOCATION  ============================================== */}
            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/* Section Header */}
                <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Location</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                    <p className="text-sm text-gray-600">
                        Search, click the map, enter coordinates, or use your current location
                    </p>
                </div>

                <Controller
                    name="location"
                    control={control}
                    render={({ field: { value } }) => (
                        <FreeAddressSearch
                            onLocationSelect={handleLocationSelect}
                            location={value}
                            mapZoom={13}
                        />
                    )}
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

                <Controller
                    name="uploadedPhotos"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <PhotoUpload
                            photos={value}
                            onPhotosChange={onChange}
                            maxPhotos={10}
                            maxFileSizeMB={16}
                        />
                    )}
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

                <div className="flex w-full gap-2">
                    {/*Keywords Input Area*/}
                    <div onKeyDown={handleKeywordKeyDown}
                         className="flex-1"
                    >
                        <Controller
                            name="currentKeywordInput"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <KeywordsAutocomplete
                                    keywords={value}
                                    setKeywords={onChange}
                                />
                            )}
                        />
                    </div>

                    {/*Generate Keywords Button*/}
                    {canGenerateKeywords && (
                        <button
                            type="button"
                            onClick={handleGenerateKeywords}
                            disabled={isGeneratingKeywords}
                            className={`px-6 py-3 font-semibold text-sm rounded-lg 
                                    transition-all duration-200 shadow-md cursor-pointer
                                    ${isGeneratingKeywords
                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                : 'bg-blue-600 text-white hover:shadow-lg active:scale-95'
                            }`}
                        >
                            {isGeneratingKeywords ? (
                                <span className="flex items-center justify-center gap-2">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full
                                                animate-spin"
                                />
                                Generating Keywords...
                            </span>
                            ) : (
                                '✨ Generate Keywords'
                            )}
                        </button>
                    )}
                </div>


                {/*Entered Keywords Display*/}
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

            {/* ========================================  SUBMIT BUTTON ============================================ */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-4 px-8 py-4 font-bold text-lg rounded-xl 
                            transition-all duration-200 shadow-lg ${isSubmitting
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