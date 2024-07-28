import dotenv from "dotenv";
dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "./dist",
  images: { unoptimized: true },
  env: {
    DOMAIN: `${process.env.NEXT_PUBLIC_API_PATH}`,
  },
};

export default nextConfig;
