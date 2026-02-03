import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // 1. Si estamos en desarrollo (localhost), pasamos
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // 2. Comprobar la contraseña Basic Auth
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    // TUS CREDENCIALES
    if (user === "admin" && pwd === "equily") {
      return NextResponse.next();
    }
  }

  // 3. Si falla, mostramos el bloqueo
  return new NextResponse("Área Restringida: Solo personal de Equily", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

// --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
export const config = {
  // Ahora el candado SOLO salta si la ruta empieza por "/dashboard"
  matcher: ["/dashboard/:path*"],
};