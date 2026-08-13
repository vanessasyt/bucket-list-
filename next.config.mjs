/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    // Photo uploads go through a server action, whose body limit is 1MB by
    // default. The browser shrinks photos first, but leave headroom.
    serverActions: { bodySizeLimit: "8mb" },
  },
};
export default nextConfig;
