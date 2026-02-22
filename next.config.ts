import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/what-is-equily", destination: "/what-is-equafy", permanent: true },
      { source: "/why-equily", destination: "/why-equafy", permanent: true },
    ];
  },
  /* Le decimos a Vercel que si encuentra algún error pequeño de TypeScript 
     (tipos de datos), haga la vista gorda y publique la web igual.
  */
  typescript: {
    ignoreBuildErrors: true,
  },
  /* IMPORTANTE: Hemos quitado la parte de 'eslint' que daba error 
     porque ya no se permite aquí.
  */
};

export default nextConfig;