// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Webhook de Stripe: SIEMPRE público, no pasar por auth (evita 307 a /login)
  if (pathname.startsWith("/api/webhooks") || pathname.includes("/api/webhooks")) {
    return NextResponse.next();
  }

  // 1. Definimos las rutas que DEBEN ser públicas (sin requerir auth)
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
  matcher: [
    // Excluir estáticos, imágenes y el webhook de Stripe (evita 307)
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};