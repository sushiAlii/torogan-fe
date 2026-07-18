/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/rpc/:path*',
        destination: `${process.env.BACKEND_ORIGIN ?? 'http://localhost:8080'}/:path*`,
      },
    ]
  },
}

export default nextConfig
