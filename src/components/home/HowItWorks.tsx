import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Reserva Online",
      description: "Elige la duración (4h, 6h u 8h), extras requeridos y la fecha que prefieras. Sin tarjeta por adelantado.",
    },
    {
      step: "02",
      title: "Llegada Puntual",
      description: "Un profesional verificado llega a tu domicilio puntualmente en el turno seleccionado (08:00 AM o 13:00 PM).",
    },
    {
      step: "03",
      title: "Revisa y Abona",
      description: "Verifica el resultado de tu hogar reluciente. Paga en efectivo, SIPAP o tarjeta con nuestra Garantía de Satisfacción 200%.",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Proceso
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Cómo funciona
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Un proceso simple y transparente de 3 pasos para el cuidado de tu espacio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-2xl p-7 border border-neutral-200 hover:border-electric-200 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-electric-600 px-2.5 py-1 bg-electric-50 rounded-md border border-electric-100 inline-block mb-4">
                  Paso {s.step}
                </span>
                <h3 className="text-base font-bold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
