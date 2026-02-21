"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-40 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/legal"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Legal Center
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 print:hidden"
              aria-label="Imprimir esta página"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>

          <article className="prose prose-slate max-w-3xl mx-auto py-12 text-slate-700 leading-relaxed">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-12">
              Aviso Legal
            </h1>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Información General</h2>
              <p className="mb-4">
                En cumplimiento de lo dispuesto en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de que el titular de este sitio web y de la plataforma comercial es:
              </p>
              <ul className="list-none pl-0 space-y-2">
                <li><strong>Titular:</strong> Pablo Alfaya Fernandez (operando bajo el nombre comercial EQUILY)</li>
                <li><strong>NIF:</strong> 29514449K</li>
                <li><strong>Domicilio:</strong> Calle La Santa Maria 86, España</li>
                <li><strong>Email de contacto:</strong> <a href="mailto:info@getequily.com" className="text-emerald-600 font-semibold hover:underline">info@getequily.com</a></li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Objeto</h2>
              <p>
                El presente Aviso Legal regula el acceso, navegación y uso de la plataforma web. El uso de la web implica la aceptación expresa y sin reservas de todas las advertencias legales y términos de uso vigentes.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Propiedad Intelectual e Industrial</h2>
              <p>
                El titular es propietario o tiene las licencias correspondientes sobre los derechos de explotación de propiedad intelectual e industrial de la plataforma EQUILY, incluyendo el código fuente, diseño, algoritmos, logotipos y textos. Queda expresamente prohibida la reproducción, distribución o modificación sin autorización.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Exclusión de Responsabilidad</h2>
              <p>
                El titular no garantiza la inexistencia de errores en el acceso a la web. EQUILY es una herramienta tecnológica para la gestión de la parte de la empresa, pero su uso no sustituye el asesoramiento legal profesional en la redacción de contratos para empresas emergentes.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
