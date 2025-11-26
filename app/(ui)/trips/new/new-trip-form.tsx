'use client'

import React, { useState } from "react";
import {useRouter} from "next/navigation";
import { MapPinIcon, CalendarDaysIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

import { createTrip } from "@/lib/actions/trips-actions";
import {CreateTripProps} from "@/lib/types";
import AddExperiencesSearch from "@/app/(dev)/dev/components/add-experiences-search";

interface NewTripFormProps {
    session_user_id: string
}

export function NewTripForm( {session_user_id}: NewTripFormProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [tripData, setTripData] = useState<CreateTripProps>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        user_id: session_user_id,
        create_date: new Date().toISOString(),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTripData({
            ...tripData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const createdTrip = await createTrip(tripData);
            setUploadStatus('Success');
            router.push(`/trips/details?q=${createdTrip.trip_id}`);
        } catch (error) {
            setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsUploading(false);
        }
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
                <h2 className="text-3xl font-bold text-gray-900">Plan a Trip</h2>
            </div>

            <div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">
                {/* Section Header */}
                <div className="flex flex-wrap items-baseline gap-3 border-b border-gray-200 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">Trip Information</h3>
                    <div className="hidden sm:block h-5 w-px bg-gray-300" />
                    <p className="text-sm text-gray-600">
                        Give your trip a clear name, timeframe, and overview.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-6">
                    {/* Title + Dates row */}
                    <div className="flex flex-col items-start md:flex-row md:items-center gap-6">
                        {/* Title */}
                        <div className="flex-1 flex flex-col gap-5">
                            <label
                                htmlFor="title"
                                className="text-md font-semibold text-gray-800 tracking-wide -mt-5"
                            >
                                Trip title <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={tripData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Summer road trip through the Pacific Northwest"
                                    className="w-full p-3 rounded-xl border-2 border-gray-300
                                             bg-white text-gray-900 placeholder:text-gray-400
                                             transition-all duration-200
                                             focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                             hover:border-gray-400 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="w-full md:w-[320px] flex flex-col gap-2 md:self-end">
                            <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                <span className="text-sm font-semibold text-gray-800 tracking-wide">
                                    Dates
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="start_date"
                                        className="text-xs font-medium text-gray-600 uppercase tracking-wide"
                                    >
                                        Start
                                    </label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        name="start_date"
                                        value={tripData.start_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-300
                                                   bg-white text-gray-900 text-sm
                                                   focus:ring-2 focus:ring-blue-100 focus:border-blue-500
                                                   hover:border-gray-400 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="end_date"
                                        className="text-xs font-medium text-gray-600 uppercase tracking-wide"
                                    >
                                        End
                                    </label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        name="end_date"
                                        value={tripData.end_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-300
                                                   bg-white text-gray-900 text-sm
                                                   focus:ring-2 focus:ring-blue-100 focus:border-blue-500
                                                   hover:border-gray-400 shadow-sm"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">
                                You can leave dates blank if your trip is still flexible.
                            </p>
                        </div>
                    </div>

                    {/* Description row */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="description"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-800 tracking-wide"
                        >
                            <PencilSquareIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                            Trip description
                        </label>
                        <div className="relative">
                              <textarea
                                  id="description"
                                  name="description"
                                  rows={5}
                                  value={tripData.description}
                                  onChange={handleInputChange}
                                  placeholder="Describe your itinerary, goals, or anything your future self should remember about this trip..."
                                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300
                                           bg-white text-gray-900 placeholder:text-gray-400
                                           transition-all duration-200 resize-y
                                           focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                                           hover:border-gray-400 shadow-sm"
                              />
                                <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-gray-400">
                                    Optional
                                </span>
                        </div>
                    </div>
                </div>
            </div>


            {/*<div className="flex flex-col w-full gap-4 p-6 bg-blue-50/50 rounded-xl border-2 border-blue-100">*/}
            {/*    /!*Section Header*!/*/}
            {/*    <div className="flex flex-wrap items-baseline gap-3">*/}
            {/*        <h3 className="text-lg font-bold text-gray-900">Trip Experiences</h3>*/}
            {/*        <div className="hidden sm:block h-5 w-px bg-gray-300"></div>*/}
            {/*        <p className="text-sm text-gray-600">*/}
            {/*            Search for some experiences to add to your trip.*/}
            {/*        </p>*/}
            {/*    </div>*/}

            {/*    /!*Search Bar*!/*/}
            {/*    <AddExperiencesSearch />*/}
            {/*</div>*/}


            {/* Upload Status */}
            {uploadStatus && (
                <div className={`p-3 rounded-lg ${uploadStatus === "Success" 
                    ? 'bg-green-50 text-green-900 border border-green-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}>
                    {uploadStatus}
                </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
                type="submit"
                disabled={isUploading}
                className={`mt-4 px-8 py-4 font-bold text-lg rounded-xl 
                            transition-all duration-200 shadow-lg
                    ${isUploading
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-blue-700 hover:to-blue-800 text-white hover:shadow-xl active:scale-95'
                }`}
            >
                {isUploading ? (
                    <p className="flex items-center justify-center gap-3">
                        Creating Trip...
                    </p>
                ) : (
                    'Create Trip'
                )}
            </button>

        </form>
    );
}