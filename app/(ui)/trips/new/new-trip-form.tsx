'use client'

import React, { useState } from "react";
import { createTrip } from "@/lib/actions/trips-actions";
import {CreateTripProps} from "@/lib/types";

interface NewTripFormProps {
    session_user_id: string
}

export function NewTripForm( {session_user_id}: NewTripFormProps) {
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
        <form onSubmit={handleSubmit}
              className="flex flex-col gap-3 max-w-2xl w-full mt-2 p-6 justify-center items-center
               border border-gray-300 rounded-lg bg-white shadow-md"
        >
            <div className="flex flex-col w-full">
                {/*Top Row*/}
                <label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1">
                    Trip Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={tripData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Trip Title"
                    className="rounded-md border-gray-300 shadow-sm focus:ring-blue-800"
                />
            </div>

            {/*Middle Row*/}
            <div className="flex flex-row gap-3 w-full">
                <div className="flex flex-col">
                    <label htmlFor="start_date" className="text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={tripData.start_date}
                        onChange={handleInputChange}
                        className="rounded-md border-gray-300 focus:ring-blue-800"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="start_date" className="text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={tripData.end_date}
                        onChange={handleInputChange}
                        className="rounded-md border-gray-300 focus:ring-blue-800"
                    />
                </div>
            </div>


            <div className="w-full">
                <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">
                    Trip Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={8}
                    value={tripData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your trip plans..."
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-800"
                />
            </div>



            {/* Upload Status */}
            {uploadStatus && (
                <div className={`p-3 rounded-lg ${uploadStatus === "Success" ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'}`}>
                    {uploadStatus}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isUploading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-[150px]
                hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                {isUploading ? 'Creating Trip...' : 'Create Trip'}
            </button>
        </form>
    );
}