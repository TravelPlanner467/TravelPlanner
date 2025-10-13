'use client'

import React, { useState } from "react";
import { sendToTripServer } from "@/app/ui/trip-planner/trip-planner-actions";

interface CreateCalculationProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TripData {
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    location: string;
    budget: string;
}

export function CreateTrip({ isOpen, onClose }: CreateCalculationProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [tripData, setTripData] = useState<TripData>({
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        location: '',
        budget: ''
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
            // Upload to backend
            await sendToTripServer(tripData);
            setUploadStatus('Trip created successfully!');

            // Close after successful submission
            // setTimeout(() => onClose(), 2000);
        } catch (error) {
            setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsUploading(false);
        }
    };

    // If the modal is not open, don't render anything
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => onClose()}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                    aria-label="Close"
                >
                    <span className="text-2xl">×</span>
                </button>

                <h2 className="text-2xl font-bold mb-6">Create a Trip</h2>

                {/* Trip Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Trip Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={tripData.title}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Summer Vacation 2023"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={tripData.startDate}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={tripData.endDate}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Destination
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={tripData.location}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Paris, France"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Trip Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={tripData.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Describe your trip plans, activities, and notes..."
                        />
                    </div>

                    {/* Upload Status */}
                    {uploadStatus && (
                        <div className={`p-3 rounded-lg ${uploadStatus.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {uploadStatus}
                        </div>
                    )}

                    {/* Submit and Cancel Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isUploading ? 'Creating Trip...' : 'Create Trip'}
                        </button>
                    </div>
                </form>

                {/* Submit preview */}
                {uploadStatus.includes('✅') && (
                    <div className="bg-gray-100 p-4 rounded-lg mt-6">
                        <h3 className="text-lg font-semibold mb-3">Trip Details:</h3>
                        <pre className="bg-white p-4 rounded border overflow-auto text-sm">
                          {JSON.stringify(tripData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}