'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { Experience} from "@/app/experience/search/page";
import experiencesData from '@/public/experiences.json';
import { Suspense } from 'react';

function ExperienceDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const experienceId = searchParams.get('q');

    // @ts-ignore
    const experiences: Experience[] = experiencesData;
    const experience = experiences.find(exp => exp.id === experienceId);

    if (!experience) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Experience Not Found</h1>
                    <button
                        onClick={() => router.push('/experiences')}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Back to Experiences
                    </button>
                </div>
            </div>
        );
    }

    const experienceDate = new Date(experience.experience_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => router.push('/experiences')}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Experiences
                </button>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{experience.title}</h1>
                        <p className="text-gray-600">{experienceDate}</p>
                    </div>

                    <div className="prose max-w-none mb-6">
                        <p className="text-lg text-gray-700 leading-relaxed">{experience.description}</p>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
                        <div className="flex items-start text-gray-700">
                            <svg className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                                <p className="font-medium">{experience.address}</p>
                                <p className="text-sm text-gray-500">
                                    {experience.coordinates.latitude}, {experience.coordinates.longitude}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Keywords</h2>
                        <div className="flex flex-wrap gap-2">
                            {experience.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                                >
                  {keyword}
                </span>
                            ))}
                        </div>
                    </div>

                    {experience.photos.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Photos</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {experience.photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                                    >
                                        <span className="text-gray-500 text-sm">Photo {index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ExperienceDetailsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <ExperienceDetailsContent />
        </Suspense>
    );
}
