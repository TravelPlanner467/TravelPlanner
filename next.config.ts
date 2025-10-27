module.exports = {
    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/py/:path*',
                    destination: 'http://127.0.0.1:5328/:path*',
                },
            ]
        }
        return [
        ]
    },
}