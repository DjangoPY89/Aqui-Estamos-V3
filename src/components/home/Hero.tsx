import React from "react";
import Link from "next/link";
import { Star, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-white pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Columna de Texto */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline con toque de azul eléctrico */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-50 text-electric-800 text-xs font-semibold border border-electric-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse"></span>
              <span>Servicio profesional en Asunción y Gran Asunción</span>
            </div>

            {/* Titular */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-[1.12]">
              Cuidado profesional y confiable para tu <span className="text-electric-600">hogar.</span>
            </h1>

            {/* Bajada */}
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl font-normal">
              Servicios de limpieza por horas con personal rigurosamente verificado y contratado formalmente bajo normativas de IPS. Reserva online en 60 segundos con tarifa plana en Guaraníes y garantía total.
            </p>

            {/* Botones de Acción con Azul Eléctrico */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/reservar"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-electric-600 hover:bg-electric-700 text-white font-medium text-sm rounded-xl shadow-electric transition-all active:scale-[0.98]"
              >
                <span>Reservar Limpieza</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </Link>

              <Link
                href="/corporativo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-electric-50 text-neutral-800 hover:text-electric-700 font-medium text-sm rounded-xl border border-neutral-300 hover:border-electric-200 transition-colors"
              >
                <span>Soluciones para Empresas</span>
              </Link>
            </div>

            {/* Indicadores de Confianza */}
            <div className="pt-6 border-t border-neutral-100 grid grid-cols-3 gap-6 text-left">
              <div>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-neutral-900">4.9 / 5.0</span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">Google Reviews (+1.5k servicios)</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1">
                  <span className="text-electric-600">✓</span> 100% Legal
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">Inscripción formal en IPS</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1">
                  <span className="text-electric-600">✓</span> Garantía 200%
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">Satisfacción asegurada</p>
              </div>
            </div>

          </div>

          {/* Columna Visual con Video Hero */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-neutral-200/90 bg-neutral-950 shadow-2xl group">
              <video
                src="/videos/hero-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Degradado sutil superpuesto */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-black/10 pointer-events-none" />
              
              {/* Badge flotante inferior */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 text-xs text-neutral-700 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-electric-500 animate-pulse"></span>
                  <span className="font-semibold text-neutral-900">Personal verificado con IPS</span>
                </div>
                <span className="text-[11px] font-bold text-electric-600 bg-electric-50 px-2 py-0.5 rounded-md border border-electric-100">
                  Tarifa fija en Gs.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
