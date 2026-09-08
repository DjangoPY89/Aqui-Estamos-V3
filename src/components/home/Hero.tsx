import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[620px] sm:min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden bg-white text-neutral-950 border-b border-neutral-200">
      
      {/* Background Image Full-Width con SEO Especializado */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        itemScope
        itemType="https://schema.org/ImageObject"
      >
        <Image
          src="/images/hero-limpieza-hogar-asuncion.jpg"
          alt="Servicio profesional de limpieza de casas, departamentos y oficinas por horas en Asunción y Gran Asunción Paraguay - Aquí Estamos Limpieza"
          title="Empresa de Limpieza Profesional en Asunción - Aquí Estamos"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          itemProp="contentUrl"
        />
        <meta itemProp="name" content="Servicio de Limpieza Profesional en Hogares - Aquí Estamos" />
        <meta itemProp="description" content="Personal capacitado y formalmente contratado en IPS para la limpieza profunda de casas y departamentos en Asunción." />
        {/* Capa de fondo blanco aumentada al 50% */}
        <div className="absolute inset-0 bg-white/50" />
      </div>

      {/* Contenido Hero Superpuesto */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-36 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6 sm:space-y-8 animate-in fade-in duration-500">
          
          {/* Tagline con toque de azul eléctrico y fondo blur */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-950 text-xs font-bold border border-neutral-300 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-electric-600 animate-pulse"></span>
            <span>Servicio profesional en Asunción y Gran Asunción</span>
          </div>

          {/* Titular con letras negras y "hogar" en Azul Eléctrico animado */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-neutral-950 tracking-tight leading-[1.12]">
            Cuidado profesional y confiable para tu{" "}
            <span className="inline-block text-electric-600 animate-pulse drop-shadow-[0_2px_12px_rgba(34,100,246,0.35)] transition-transform hover:scale-105">
              hogar.
            </span>
          </h1>

          {/* Bajada en color negro */}
          <p className="text-base sm:text-lg lg:text-xl text-neutral-900 leading-relaxed font-semibold sm:font-medium max-w-2xl">
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
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/90 hover:bg-white backdrop-blur-md text-neutral-950 font-bold text-sm sm:text-base rounded-2xl border border-neutral-300 shadow-sm transition-all"
            >
              <span>Soluciones para Empresas</span>
            </Link>
          </div>

          {/* Indicadores de Confianza en color negro */}
          <div className="pt-6 sm:pt-8 border-t border-neutral-300/80 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="flex items-center sm:block gap-3">
              <div className="flex items-center gap-1.5 text-amber-500 text-sm font-bold">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-label="Google logo">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-neutral-950 font-black">4.9 / 5.0</span>
              </div>
              <p className="text-xs text-neutral-800 font-semibold mt-0.5">Google Reviews (+1.5k servicios)</p>
            </div>

            <div className="flex items-center sm:block gap-3">
              <p className="text-sm font-black text-neutral-950 flex items-center gap-1.5">
                <span className="text-electric-600 font-black">✓</span> 100% Legal
              </p>
              <p className="text-xs text-neutral-800 font-semibold mt-0.5">Inscripción formal en IPS</p>
            </div>

            <div className="flex items-center sm:block gap-3">
              <p className="text-sm font-black text-neutral-950 flex items-center gap-1.5">
                <span className="text-electric-600 font-black">✓</span> Garantía 200%
              </p>
              <p className="text-xs text-neutral-800 font-semibold mt-0.5">Satisfacción asegurada</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
