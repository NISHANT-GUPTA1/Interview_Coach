/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Updated serverExternalPackages configuration
  ...(process.env.NODE_ENV === 'development' && {
    serverExternalPackages: [],
  }),
}

export default nextConfig
