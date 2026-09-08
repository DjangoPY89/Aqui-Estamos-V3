"use client";

import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";

export default function RoomChecklist() {
  const [activeTab, setActiveTab] = useState<"BATH" | "KITCHEN" | "BEDROOM" | "FLOORS">("BATH");

  const checklist = {
    BATH: {
      emoji: "🛁",
      title: "Baños y Sanitarios",
      badge: "Desinfección profunda",
      items: [
        "Desinfección profunda y sarricida de inodoro, bidet y lavatorio",
        "Limpieza y descalcificación de mamparas, azulejos y griferías",
        "Pulido brillante de espejos y superficies de vidrio",
        "Vaciado, desinfección y cambio de bolsas de papeleros",
        "Lavado total y desinfección de pisos con aroma fresco",
      ],
    },
    KITCHEN: {
      emoji: "🍳",
      title: "Cocina y Comedor",
      badge: "Cero grasa y desinfección",
      items: [
        "Desengrase profundo de hornallas, extractor y mesadas",
        "Lavado y desinfección de bacha, pileta y canillas",
        "Limpieza exterior minuciosa de electrodomésticos (heladera, microondas)",
        "Limpieza de frentes de gabinetes, alacenas y manijas",
        "Barrido y trapeado con desengrasante en todos los pisos",
      ],
    },
    BEDROOM: {
      emoji: "🛏️",
      title: "Dormitorios y Living",
      badge: "Orden y frescura",
      items: [
        "Tendido y cambio de sábanas frescas a tu gusto",
        "Sacudido y desempolvado de mesas de luz, cómodas y estantes",
        "Limpieza cuidadosa de escritorios, pantallas y mesas",
        "Acomodo amoroso y organización de almohadones y mantas",
        "Aspirado minucioso de polvo y trapeado completo",
      ],
    },
    FLOORS: {
      emoji: "🧹",
      title: "Pisos y Áreas Generales",
      badge: "Brillo y rica fragancia",
      items: [
        "Aspirado y barrido profundo eliminando pelos de mascotas y pelusas",
        "Trapeado con fragancias aromáticas de larga duración",
        "Limpieza de zócalos, marcos de puertas y manijas",
        "Vaciado y orden general de basureros del hogar",
        "Limpieza de vidrios y ventanales interiores accesibles",
      ],
    },
  };

  const current = checklist[activeTab];

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-white via-neutral-50/70 to-white border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Glow suave */}
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Amistoso */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cuidamos cada rincón de tu hogar</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            ¿Qué incluye tu limpieza? <br className="hidden sm:inline" />
            ¡Dejamos todo reluciente! ✨
          </h2>

          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Nos ocupamos de los detalles más difíciles en cada ambiente para que disfrutes de un espacio fresco, ordenado y perfumado.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-md">
          
          {/* Segmented Control con Emojis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8 bg-neutral-100 p-1.5 rounded-2xl">
            {(Object.keys(checklist) as (keyof typeof checklist)[]).map((key) => {
              const item = checklist[key];
              const isSelected = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`py-3 px-3.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSelected
                      ? "bg-white text-electric-600 shadow-sm border border-neutral-200/80 scale-[1.02]"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Checklist */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-neutral-100">
              <h3 className="text-base sm:text-lg font-black text-neutral-900 flex items-center gap-2">
                <span>{current.emoji}</span>
                <span>Tareas incluidas en <span className="text-electric-600">{current.title}</span>:</span>
              </h3>
              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full w-fit">
                {current.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {current.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50/80 hover:bg-blue-50/40 border border-neutral-200/70 hover:border-electric-200 text-xs sm:text-sm text-neutral-800 transition-all duration-200"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span className="leading-relaxed font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
