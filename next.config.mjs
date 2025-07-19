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
  // Add HTTPS support for development
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      serverComponentsExternalPackages: [],
    },
  }),
}

export default nextConfig
