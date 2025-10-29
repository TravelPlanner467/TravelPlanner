'use client'

import React, { useState } from "react";
import { createTrip } from "@/lib/actions/trips-actions";
import {CreateTripProps, EditTripProps} from "@/lib/types";

interface EditTripFormProps {
    user_id: string
    trip: EditTripProps
}

export function EditTripFormProps( {user_id, trip}: EditTripFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [tripData, setTripData] = useState<CreateTripProps>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        user_id: user_id,
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
            await createTrip(tripData);
            setUploadStatus('Trip created successfully!');
            window.location.reload();
        } catch (error) {
            setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="">
            <div
                className=""
                onClick={(e) => e.stopPropagation()}
            >

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
                            placeholder="Trip Title"
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
                            placeholder="Describe your trip plans..."
                        />
                    </div>

                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={tripData.start_date}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={tripData.end_date}
                            onChange={handleInputChange}
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
                        {/*<button*/}
                        {/*    type="button"*/}
                        {/*    onClick={() => onClose()}*/}
                        {/*    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"*/}
                        {/*>*/}
                        {/*    Cancel*/}
                        {/*</button>*/}
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isUploading ? 'Creating Trip...' : 'Create Trip'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}