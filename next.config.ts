/** @type {import('next').NextConfig} */
const nextConfig = {
    // Redirect to access flask microservice locally
    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/:path*',
                    destination: 'http://127.0.0.1:5328/:path*',
                },
            ]
        }
        return []
    },
    // Metadata to supress Google Maps API CORS error
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
                            "connect-src 'self' https://maps.googleapis.com https://*.googleapis.com",
                            "img-src 'self'  https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com"
                        ].join('; ')
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig
