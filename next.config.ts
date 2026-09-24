import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Lets a phone on the same network load the dev JS bundles, otherwise the page never hydrates and buttons do nothing
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],
}

export default nextConfig

