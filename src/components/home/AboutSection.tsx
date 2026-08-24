import React from "react";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="nosotros" className="py-20 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Imagen Minimalista */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 aspect-[4/3]">
              <Image
                src="https://images.squarespace-cdn.com/content/v1/6453d23ab5f3007cff4aa827/08837366-0985-4699-927e-b1f1d8dd6b10/sobre-casa-clean.jpg"
                alt="Personal profesional de Aquí Estamos"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Texto y Propósito */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Nosotros
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
              Bienestar y tranquilidad para tu hogar y oficina.
            </h2>

            <div className="space-y-3.5 text-neutral-600 text-sm sm:text-base leading-relaxed">
              <p>
                En <strong>Aquí Estamos</strong> transformamos el servicio de limpieza en Paraguay combinando puntualidad, rigurosidad en la selección del personal y contratación 100% formal bajo normativas de IPS y MTESS.
              </p>
              <p>
                Sin trámites engorrosos ni incertidumbre: reserva tu bloque de tiempo online y nuestro equipo se encarga de dejar cada ambiente impecable.
              </p>
            </div>

            {/* Estadísticas Sobrias */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
              <div>
                <p className="text-2xl font-bold text-neutral-900">+1.500</p>
                <p className="text-xs text-neutral-500 mt-0.5">Servicios realizados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">4.9 / 5.0</p>
                <p className="text-xs text-neutral-500 mt-0.5">Calificación promedio</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">100%</p>
                <p className="text-xs text-neutral-500 mt-0.5">Personal con IPS</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
