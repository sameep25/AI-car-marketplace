/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zafndavpzgpcbqgvosbt.supabase.co",
        pathname: "/storage/v1/object/public/**", // allow Supabase storage path
      },
    ],
  },
};

export default nextConfig;
