import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // 1. Si estamos en tu ordenador (localhost), NO pedir contraseña para que trabajes cómodo
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // 2. Comprobar si el usuario ha puesto la contraseña
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    // --- TUS CREDENCIALES ---
    // Puedes cambiar "admin" y "equily" por lo que quieras
    if (user === "admin" && pwd === "equily") {
      return NextResponse.next();
    }
  }

  // 3. Si no tiene contraseña, le mostramos la ventanita de bloqueo
  return new NextResponse("Área Restringida: Solo personal de Equily", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

// Esto evita que bloquee las imágenes o archivos internos, solo bloquea la web visible
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};