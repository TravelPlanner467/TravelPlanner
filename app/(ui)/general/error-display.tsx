type ErrorCardProps = {
    error: string;
    message?: string;
};

export default function ErrorCard({ error, message }: ErrorCardProps) {
    return (
        <div className="w-full max-w-2xl mx-auto p-6 mt-6
                        bg-red-50 border border-red-200 rounded-lg shadow-sm"
        >
            <div className="flex items-start gap-3">
                {/* Error Icon */}
                <svg
                    className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800">
                        {error}
                    </h3>
                    {message && (
                        <p className="mt-1 text-sm text-red-700">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}