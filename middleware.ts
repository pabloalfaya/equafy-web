// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Stripe webhook: NUNCA ejecutar auth. Retorno inmediato para que Stripe no reciba 307 a /login.
  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  // Rutas públicas (sin requerir auth)
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/models") ||
    pathname.startsWith("/guide") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/what-is-equily") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/legal");

  // 2. Si es pública, dejamos que Next.js maneje la petición normalmente
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. Para el resto de rutas (dashboard, etc.), ejecutamos la protección de sesión
  return await updateSession(request);
}

export const config = {
  // No ejecutar middleware en webhooks, estáticos ni favicon (Stripe debe poder llamar /api/webhooks sin auth)
  matcher: ["/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)"],
};