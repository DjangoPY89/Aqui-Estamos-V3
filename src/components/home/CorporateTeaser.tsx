import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CorporateTeaser() {
  return (
    <section className="py-20 bg-navy-950 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-electric-400">
              Corporativo B2B
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Limpieza Profesional para Empresas y Oficinas
            </h2>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Mantenimiento integral para oficinas, showrooms y locales comerciales en Asunción. Facturación legal con RUC, personal con cobertura patronal de IPS y disponibilidad en horarios antes o después de la jornada laboral.
            </p>

            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                href="/corporativo"
                className="inline-flex items-center gap-2 px-5 py-3 bg-electric-600 hover:bg-electric-500 text-white font-medium text-xs rounded-xl shadow-electric transition-all active:scale-[0.98]"
              >
                <span>Solicitar Propuesta Comercial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/595983463553"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl border border-white/20 transition-colors"
              >
                <span>WhatsApp Corporativo</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-electric-400"></span>
              Ventajas Corporativas
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-electric-400 font-bold">•</span>
                <span>Factura crédito fiscal con RUC mensualizada.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-electric-400 font-bold">•</span>
                <span>100% de cumplimiento en normativas laborales IPS y MTESS.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-electric-400 font-bold">•</span>
                <span>Reemplazo garantizado de personal en caso de eventualidad.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-electric-400 font-bold">•</span>
                <span>Relevamiento técnico inicial sin costo.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
