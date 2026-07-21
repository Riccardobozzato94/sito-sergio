/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/sito-sergio/admin',
  assetPrefix: '/sito-sergio/admin/',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;