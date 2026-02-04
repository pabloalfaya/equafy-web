import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- LÓGICA DE PROTECCIÓN ---
  // Si NO hay usuario logueado...
  if (!user) {
    // ... y NO estás intentando ir a una de estas páginas públicas:
    if (
      !request.nextUrl.pathname.startsWith("/login") && // Página de entrar
      !request.nextUrl.pathname.startsWith("/auth") &&  // Rutas internas de auth
      request.nextUrl.pathname !== "/" &&               // La Home
      !request.nextUrl.pathname.startsWith("/what-is-equily") && // PÚBLICA
      !request.nextUrl.pathname.startsWith("/how-it-works") &&   // PÚBLICA
      !request.nextUrl.pathname.startsWith("/pricing") &&        // PÚBLICA
      !request.nextUrl.pathname.startsWith("/contact")           // PÚBLICA
    ) {
      // ENTONCES: Te mando al login (porque intentas entrar al dashboard u otro sitio privado)
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
};