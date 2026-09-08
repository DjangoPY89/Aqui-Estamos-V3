import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Heart } from "lucide-react";

export default function GuaranteeBanner() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-navy-950 via-electric-950 to-navy-950 text-white border-t border-neutral-800 relative overflow-hidden">
      
      {/* Glow suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-electric-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold text-electric-300">
              <ShieldCheck className="w-4 h-4 text-electric-400" />
              <span>Garantía de Satisfacción 200%</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <span>Tu tranquilidad y alegría están 100% aseguradas</span>
              <span className="inline-flex p-1.5 rounded-xl bg-white/10 text-electric-300 border border-white/20">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
              Si algún sector de tu hogar no queda exactamente como te gusta, volvemos a dejarlo perfecto en menos de 24 horas sin que pagues un solo Guaraní extra.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-electric-600 hover:bg-electric-500 text-white font-black text-sm rounded-2xl shadow-electric hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <span>¡Reservar mi Limpieza!</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
