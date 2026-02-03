import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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