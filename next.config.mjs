/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  distDir: "./dist",
  images: { unoptimized: true },
  env: {
    DOMAIN: "http://localhost:8000",
  },
};

export default nextConfig;
