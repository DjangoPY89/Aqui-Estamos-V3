"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

export default function RoomChecklist() {
  const [activeTab, setActiveTab] = useState<"BATH" | "KITCHEN" | "BEDROOM" | "FLOORS">("BATH");

  const checklist = {
    BATH: {
      title: "Baños y Sanitarios",
      items: [
        "Desinfección profunda de inodoro, bidet y lavatorio",
        "Limpieza y descalcificación de mamparas y azulejos",
        "Pulido de griferías y espejos",
        "Vaciado y desinfección de papeleros",
        "Lavado y desinfección total de pisos",
      ],
    },
    KITCHEN: {
      title: "Cocina y Comedor",
      items: [
        "Limpieza y desengrase de hornallas y mesadas",
        "Lavado y desinfección de bacha y grifería",
        "Limpieza exterior de electrodomésticos (heladera, microondas)",
        "Limpieza de frentes de gabinetes y cajones",
        "Barrido y trapeado profundo de pisos",
      ],
    },
    BEDROOM: {
      title: "Dormitorios y Living",
      items: [
        "Tendido y recambio de sábanas según indicación",
        "Sacudido y desempolvado de mesas de luz y cómodas",
        "Limpieza de pantallas, escritorios y mesas ratonas",
        "Organización y acomodo de cojines y mantas",
        "Aspirado y trapeado de pisos",
      ],
    },
    FLOORS: {
      title: "Pisos y Áreas Generales",
      items: [
        "Barrido y aspirado minucioso de partículas y pelos",
        "Trapeado con fragancias y desinfectante",
        "Limpieza de zócalos y marcos de puertas",
        "Vaciado general de basureros",
        "Ventanales y vidrios interiores accesibles",
      ],
    },
  };

  const current = checklist[activeTab];

  return (
    <section className="py-20 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Alcance del Servicio
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Protocolo de Limpieza
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Detalle de las tareas realizadas en cada ambiente de tu hogar.
          </p>
        </div>

        <div className="max-w-4xl bg-neutral-50 rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-xs">
          
          {/* Segmented Control */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-neutral-200/70 p-1 rounded-xl">
            {(Object.keys(checklist) as (keyof typeof checklist)[]).map((key) => {
              const item = checklist[key];
              const isSelected = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-electric-600 text-white shadow-electric-sm font-semibold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {item.title.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Checklist */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
              Tareas incluidas en <span className="text-electric-600">{current.title}</span>:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-neutral-200/80 text-xs text-neutral-700 hover:border-electric-200 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-electric-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
