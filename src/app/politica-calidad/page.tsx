import React from "react";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle } from "lucide-react";

export default function PoliticaCalidadPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Excelencia Operativa</span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Políticas de Calidad y Estándar de Servicio</h1>
            <p className="text-xs text-slate-500 mt-2">Compromiso de Excelencia • Aquí Estamos</p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Reclutamiento y Calificación Continua</h2>
              <p>
                Todo nuestro personal es sometido a un riguroso proceso de verificación que incluye antecedentes policiales y judiciales, chequeo domiciliario y test psicológico. Además, reciben capacitaciones constantes en técnicas de desinfección, ergonomía y uso eficiente de insumos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Protocolo de Limpieza Detallada</h2>
              <p>
                Seguimos un protocolo sistemático de limpieza por ambientes (baños, cocinas, dormitorios, áreas sociales) para garantizar que ningún rincón quede sin atender durante el bloque de tiempo contratado.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Control de Calidad y Retroalimentación</h2>
              <p>
                Monitoreamos activamente las calificaciones de nuestros clientes en cada servicio. Cualquier puntaje inferior a 4 estrellas es auditado inmediatamente por nuestro equipo de supervisión para garantizar la satisfacción total.
              </p>
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}
