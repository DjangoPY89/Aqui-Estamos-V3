import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, MessageSquare, Check } from "lucide-react";

export default function CorporateTeaser() {
  return (
    <section className="py-20 sm:py-24 bg-navy-950 text-white border-b border-navy-900 relative overflow-hidden">
      
      {/* Glow suave */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-electric-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-electric-300 text-xs font-bold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-electric-400" />
              <span>Soluciones para Oficinas y Negocios</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight flex items-center flex-wrap gap-3">
              <span>Limpieza profesional para tu empresa o local</span>
              <span className="inline-flex p-1.5 rounded-xl bg-white/10 text-electric-300 border border-white/20">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </span>
            </h2>

            <p className="text-neutral-200 text-sm sm:text-base leading-relaxed font-normal">
              Cuidamos la imagen y desinfección de tus oficinas, locales comerciales y showrooms en Asunción. Personal 100% inscripto en IPS, facturación con crédito fiscal (RUC) y horarios flexibles antes o después de la jornada laboral.
            </p>

            <div className="pt-2 flex flex-wrap gap-3.5">
              <Link
                href="/corporativo"
                className="inline-flex items-center gap-2.5 px-6 py-4 bg-electric-600 hover:bg-electric-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-electric transition-all active:scale-[0.98]"
              >
                <span>Solicitar Propuesta a Medida</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/595983463553"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-electric-300" />
                <span>WhatsApp Corporativo</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-7 sm:p-9 rounded-3xl border border-white/20 space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-electric-400 animate-pulse"></span>
              <span>Ventajas que te dan tranquilidad:</span>
            </h3>
            
            <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Factura crédito fiscal con RUC mensualizada.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>100% cumplimiento laboral y cobertura de IPS.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Reemplazo garantizado ante cualquier eventualidad.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Relevamiento técnico inicial sin costo alguno.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
