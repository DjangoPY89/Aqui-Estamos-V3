import React from "react";
import { ShieldCheck, Star } from "lucide-react";

export default function CleanersTrust() {
  const cleaners = [
    {
      name: "Carmen Benítez",
      role: "Limpieza Integral y Detalle",
      exp: "4 años en el equipo",
      rating: "5.0",
      servicesCount: "+420 servicios",
      badges: ["Antecedentes Verificados", "IPS al Día", "Top Calificada"],
    },
    {
      name: "María González",
      role: "Limpieza Residencial y Pisos",
      exp: "3 años en el equipo",
      rating: "4.9",
      servicesCount: "+380 servicios",
      badges: ["Antecedentes Verificados", "IPS al Día", "Puntualidad 100%"],
    },
    {
      name: "Estela Ramírez",
      role: "Especialista en Mudanzas y Full Day",
      exp: "4 años en el equipo",
      rating: "5.0",
      servicesCount: "+460 servicios",
      badges: ["Antecedentes Verificados", "IPS al Día", "Detalle Premium"],
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Equipo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Personal Verificado y de Confianza
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Cada profesional cuenta con antecedentes judiciales comprobados, seguro de IPS y capacitación continua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cleaners.map((c, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-electric-200 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-full bg-electric-600 text-white font-bold text-sm flex items-center justify-center shadow-electric-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{c.name}</h3>
                    <p className="text-xs text-neutral-500">{c.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-neutral-200/60 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-neutral-900">{c.rating} / 5.0</span>
                  </div>
                  <span className="text-neutral-500">{c.servicesCount}</span>
                </div>

                <div className="space-y-1.5">
                  {c.badges.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2 text-xs text-neutral-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-electric-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-200/60 text-[11px] text-neutral-400">
                {c.exp} • Uniforme oficial
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
