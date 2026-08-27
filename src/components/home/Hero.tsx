import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[620px] sm:min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden bg-neutral-950 text-white border-b border-neutral-900">
      
      {/* Background Image Full-Width */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src="/images/hero-bg.jpg"
          alt="Departamento moderno limpio y ordenado - Aquí Estamos"
          fill
          priority
          quality={95}
          className="object-cover object-center"
        />
        {/* Capas de Degradado para Luminosidad Natural y Legibilidad */}
        <div className="absolute inset-0 bg-neutral-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/15 to-neutral-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/20 to-transparent" />
      </div>

      {/* Contenido Hero Superpuesto */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-36 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6 sm:space-y-8 animate-in fade-in duration-500">
          
          {/* Tagline con toque de azul eléctrico y fondo blur */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-electric-400 animate-pulse"></span>
            <span>Servicio profesional en Asunción y Gran Asunción</span>
          </div>

          {/* Titular */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.12]">
            Cuidado profesional y confiable para tu <span className="text-electric-400">hogar.</span>
          </h1>

          {/* Bajada */}
          <p className="text-base sm:text-lg lg:text-xl text-neutral-200 leading-relaxed font-normal max-w-2xl">
            Servicios de limpieza por horas con personal rigurosamente verificado y contratado formalmente bajo normativas de IPS. Reserva online en 60 segundos con tarifa plana en Guaraníes y garantía total.
          </p>

          {/* Botones de Acción */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href="/reservar"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-electric-600 hover:bg-electric-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-electric transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-electric-600/30"
            >
              <span>Reservar Limpieza</span>
              <ArrowRight className="w-4 h-4 text-white/90" />
            </Link>

            <Link
              href="/corporativo"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm sm:text-base rounded-2xl border border-white/25 transition-all"
            >
              <span>Soluciones para Empresas</span>
            </Link>
          </div>

          {/* Indicadores de Confianza */}
          <div className="pt-6 sm:pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="flex items-center sm:block gap-3">
              <div className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white font-bold">4.9 / 5.0</span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">Google Reviews (+1.5k servicios)</p>
            </div>

            <div className="flex items-center sm:block gap-3">
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="text-electric-400 font-bold">✓</span> 100% Legal
              </p>
              <p className="text-xs text-neutral-300 mt-0.5">Inscripción formal en IPS</p>
            </div>

            <div className="flex items-center sm:block gap-3">
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="text-electric-400 font-bold">✓</span> Garantía 200%
              </p>
              <p className="text-xs text-neutral-300 mt-0.5">Satisfacción asegurada</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
