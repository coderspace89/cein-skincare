/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // 1. Local Strapi Uploads
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      // 2. Production Strapi Cloud Uploads
      {
        protocol: "https",
        hostname: "**.media.strapiapp.com",
        pathname: "/uploads/**",
      },
      // 3. Shopify Product and Collection Images CDN
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
    ],
    // note: If you want Next.js to optimize Shopify/Strapi images for production,
    // consider setting unoptimized to false once you're out of initial dev phase.
    unoptimized: true,
  },
  async rewrites() {
    const strapiUrl =
      process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
      process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL;

    // If neither variable is available on Vercel, skip the rewrite rule entirely
    if (!strapiUrl) {
      return [];
    }

    const sanitizedUrl = strapiUrl.replace(/\/$/, "");

    return [
      {
        source: "/api/:path((?!auth).*)",
        destination: `${sanitizedUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
