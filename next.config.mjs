import fs from 'fs'
import { config as dotenvConfig } from 'dotenv'

if (fs.existsSync('./config.env')) {
  dotenvConfig({ path: './config.env' })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
