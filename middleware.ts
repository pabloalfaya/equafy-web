import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Permitir siempre los Webhooks de Stripe sin autenticación (prioridad máxima)
  if (request.nextUrl.pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // Rutas públicas (sin requerir auth)
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/models") ||
    pathname.startsWith("/guide") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/apis") ||
    pathname.startsWith("/what-is-equily") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Resto: protección de sesión (dashboard, etc.)
  return await updateSession(request);
}

export const config = {
  // Ejecutar middleware en todas las rutas; los webhooks salen en la primera línea sin auth
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
