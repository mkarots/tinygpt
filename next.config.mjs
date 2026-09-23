/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hostnames only. localhost is already allowed. 0.0.0.0 is a bind address, not a browser origin.
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;

