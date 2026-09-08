import React from "react";

export default function WhyChooseUs() {
  const pillars = [
    {
      title: "Personal Asegurado en IPS",
      description: "Contratación formal y cumplimiento integral de normativas del MTESS. Cero contingencias para tu hogar.",
    },
    {
      title: "Filtro de Selección del 3%",
      description: "Verificación de antecedentes judiciales, policiales, referencias comprobadas y evaluación psicométrica.",
    },
    {
      title: "Garantía de Satisfacción 200%",
      description: "Si algún detalle no cumple con tus expectativas, lo corregimos en menos de 24 horas sin costo extra.",
    },
    {
      title: "Tarifas Transparentes",
      description: "Precios fijos en Guaraníes sin recargos sorpresa. Paga con efectivo, SIPAP o tarjeta.",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Valores
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Por qué elegir Aquí Estamos
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Estándares de calidad y legalidad diseñados para tu total tranquilidad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-electric-200 shadow-xs transition-all"
            >
              <span className="font-mono text-xs font-bold text-electric-600 block mb-3">
                0{idx + 1}
              </span>
              <h3 className="text-sm font-bold text-neutral-900 mb-2">{p.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
