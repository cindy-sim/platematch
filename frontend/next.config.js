// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'http://192.168.5.104:3000', 
    'http://localhost:3000',     
  ],
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
}

module.exports = nextConfig

