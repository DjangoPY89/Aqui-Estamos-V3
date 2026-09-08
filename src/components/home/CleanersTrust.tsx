import React from "react";
import { ShieldCheck, Star, Sparkles, Heart } from "lucide-react";

export default function CleanersTrust() {
  const cleaners = [
    {
      name: "Carmen Benítez",
      role: "Especialista en Limpieza y Detalle",
      exp: "4 años alegrando hogares",
      rating: "5.0",
      servicesCount: "+420 servicios realizados",
      badges: ["Antecedentes Verificados", "IPS al Día", "Top Calificada ⭐"],
    },
    {
      name: "María González",
      role: "Especialista Residencial y Pisos",
      exp: "3 años en el equipo",
      rating: "4.9",
      servicesCount: "+380 servicios realizados",
      badges: ["Antecedentes Verificados", "IPS al Día", "Puntualidad 100% ⏰"],
    },
    {
      name: "Estela Ramírez",
      role: "Especialista en Mudanzas y Full Day",
      exp: "4 años en el equipo",
      rating: "5.0",
      servicesCount: "+460 servicios realizados",
      badges: ["Antecedentes Verificados", "IPS al Día", "Detalle Premium ✨"],
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Glow suave */}
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-50/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Cálido */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-4 shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Gente de confianza que te cuida</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Conoce a las profesionales que <br className="hidden sm:inline" />
            cuidarán tu hogar 🤝
          </h2>

          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Personas amables, puntuales y capacitadas. Cada colaboradora cuenta con antecedentes comprobados y seguro de IPS para que descanses con total tranquilidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cleaners.map((c, idx) => (
            <div
              key={idx}
              className="bg-neutral-50/70 hover:bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200 hover:border-electric-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-tr from-electric-600 to-electric-500 text-white font-black text-base flex items-center justify-center shadow-electric-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">{c.name}</h3>
                    <p className="text-xs text-neutral-500 font-medium">{c.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5 px-3.5 bg-white rounded-xl border border-neutral-200/70 mb-5 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-500 font-black">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-neutral-950">{c.rating} / 5.0</span>
                  </div>
                  <span className="text-neutral-500 font-semibold">{c.servicesCount}</span>
                </div>

                <div className="space-y-2">
                  {c.badges.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200/70 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>{c.exp}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Uniforme oficial
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
