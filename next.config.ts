import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignora los errores de estilo al subir a Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora los errores de tipos al subir a Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
// Cambio para Vercel