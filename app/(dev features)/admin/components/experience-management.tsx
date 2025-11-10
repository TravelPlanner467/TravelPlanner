'use client'

import {useState} from "react";

import {Experience} from "@/lib/types";

type experienceManagementProps = {
    experiences: Experience[]
}

export default function ExperienceManagement({experiences}: experienceManagementProps) {
    const [experienceList, setExperienceList] = useState(experiences);
    const [searchTerm, setSearchTerm] = useState("");

    // Client side filtering for experiences
    const filteredExperiences = experienceList.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exp.experience_id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="p-2">
                <input
                    type="text"
                    placeholder="Search experiences by title, description, address, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Experiences Table */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Experience
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Keywords
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExperiences.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No experiences found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredExperiences.map(experience => (
                                <tr key={experience.experience_id} className="hover:bg-gray-50 transition-colors">
                                    {/* Experience Column */}
                                    <td className="px-3 py-4">
                                        <div className="text-xs text-gray-400 font-mono mt-1">{experience.experience_id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col min-w-0">
                                            <div className="font-medium text-gray-900 truncate">{experience.title}</div>
                                            <div className="text-sm text-gray-500 line-clamp-2">{experience.description}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-1">{experience.experience_id}</div>
                                        </div>
                                    </td>

                                    {/* Location Column */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{experience.address}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {experience.latitude.toFixed(4)}, {experience.longitude.toFixed(4)}
                                        </div>
                                    </td>

                                    {/* Rating Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-900">
                                                    {experience.average_rating} / 5
                                                </span>
                                        </div>
                                        {experience.user_rating && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                User: {experience.user_rating} / 5
                                            </div>
                                        )}
                                    </td>

                                    {/* Date Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(experience.experience_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Created: {new Date(experience.create_date).toLocaleDateString()}
                                        </div>
                                    </td>

                                    {/* Keywords Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {experience.keywords.slice(0, 3).map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                                >
                                                        {keyword}
                                                    </span>
                                            ))}
                                            {experience.keywords.length > 3 && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        +{experience.keywords.length - 3}
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}