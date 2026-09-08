import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function GuaranteeBanner() {
  return (
    <section className="py-16 bg-navy-950 text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-electric-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía de Servicio</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Satisfacción 200% Garantizada
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
              Si algún sector de tu hogar no queda conforme a tus requerimientos, enviamos a un profesional a corregirlo en menos de 24 horas sin costo alguno.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-electric-600 hover:bg-electric-500 text-white font-semibold text-xs rounded-xl shadow-electric transition-all active:scale-[0.98]"
            >
              <span>Reservar Limpieza</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
