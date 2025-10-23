'use client'

import Link from "next/link";
import {Experience, ErrorResponse} from "@/lib/types";
import {MapPinIcon} from "@heroicons/react/16/solid";

interface ExperienceDetailsProps {
    experience: Experience | ErrorResponse;
}

export function ExperienceDetailsContent({ experience }: ExperienceDetailsProps) {
    if ("error" in experience) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        TODO: Create "No Experience Found" component
                    </h1>
                    <Link
                        href={`/`}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Return to Search (TODO)
                    </Link>
                </div>
            </div>
        );
    }

    // Convert date string to displayable date
    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12">

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/*Top Row*/}
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{experience.title}</h1>
                        <p className="text-gray-600">{experienceDate}</p>
                    </div>

                    {/*Description*/}
                    <div className="prose max-w-none mb-6">
                        <p className="text-lg text-gray-700 leading-relaxed">{experience.description}</p>
                    </div>

                    {/*Location*/}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
                        <div className="flex items-start text-gray-700">
                            <svg className="w-5 h-5 mt-2 mr-2">
                                <MapPinIcon/>
                            </svg>
                            <div>
                                <p className="font-medium">{experience.address}</p>
                                <p className="text-sm text-gray-500">
                                    {experience.coordinates.latitude}, {experience.coordinates.longitude}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/*Keywords*/}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Keywords</h2>
                        <div className="flex flex-wrap gap-2">
                            {experience.keywords.map((keyword, index) => (
                                <p key={index}
                                      className="px-2 py-1 bg-blue-100 text-xs font-medium"
                                >
                                    {keyword}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/*Photos*/}
                    {experience.photos.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Photos</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {experience.photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-gray-200 flex items-center justify-center"
                                    >
                                        <span className="text-gray-500 text-sm">Photo {index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <Link
                    href={`/`}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                    Return to Search (TODO)
                </Link>
            </div>
        </div>
    );
}