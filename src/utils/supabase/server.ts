import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Nota: Ahora la función debe ser ASYNC
export async function createClient() {
  const cookieStore = await cookies(); // <--- Aquí estaba el cambio clave (await)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar errores en componentes de servidor
          }
        },
      },
    }
  );
}