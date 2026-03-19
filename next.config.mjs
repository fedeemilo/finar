/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    after: true, // enables unstable_after for post-response background work
  },
};

export default nextConfig;
