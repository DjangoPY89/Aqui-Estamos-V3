import React from "react";
import Image from "next/image";
import { Sparkles, Heart, ShieldCheck, Home } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="nosotros" className="py-20 sm:py-24 bg-gradient-to-b from-white via-blue-50/20 to-white border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Glow decorativo */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Imagen Cálida y Hogareña */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200 aspect-[4/3] shadow-lg group">
              <Image
                src="https://images.squarespace-cdn.com/content/v1/6453d23ab5f3007cff4aa827/08837366-0985-4699-927e-b1f1d8dd6b10/sobre-casa-clean.jpg"
                alt="Personal profesional de Aquí Estamos en un hogar reluciente"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-3">
                <span className="text-xl">🏡</span>
                <p className="text-xs font-bold text-neutral-900">
                  Devolviéndote tiempo libre y tranquilidad cada semana.
                </p>
              </div>
            </div>
          </div>

          {/* Texto y Propósito Amistoso */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-electric-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-electric-600" />
              <span>Nuestra Misión y Corazón</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
              Cuidamos tu hogar <br className="hidden sm:inline" />
              como si fuera el nuestro 💙
            </h2>

            <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                En <strong>Aquí Estamos</strong> creemos que llegar a casa y encontrarla impecable es uno de los mejores placeres de la vida. Por eso creamos una experiencia donde la limpieza profesional es accesible, puntual y completamente libre de estrés.
              </p>
              <p>
                Cuidamos tanto a las familias que nos abren sus puertas como a nuestras colaboradoras, garantizando un trato humano, digno y <strong>100% formal bajo normativas de IPS y MTESS</strong>.
              </p>
            </div>

            {/* Estadísticas Cálidas en Tarjetas */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200/80">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-black text-neutral-950">+1.500</p>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Hogares felices ✨</p>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-black text-neutral-950">4.9 / 5.0</p>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Reseñas 5 estrellas ⭐</p>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-black text-emerald-600">100%</p>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Personal con IPS 🛡️</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
