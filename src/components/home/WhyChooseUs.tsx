import React from "react";
import { Sparkles, ShieldCheck, Heart, Award, Wallet } from "lucide-react";

export default function WhyChooseUs() {
  const pillars = [
    {
      emoji: "🛡️",
      iconBg: "bg-blue-50 text-electric-600 border-blue-100",
      title: "Personal con IPS y 100% Legal",
      description: "Contratación formal bajo normativas del MTESS. Cero riesgos legales ni contingencias para tu hogar.",
    },
    {
      emoji: "🔍",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      title: "Filtro Riguroso del 3%",
      description: "Verificamos antecedentes judiciales, policiales y referencias personales para garantizarte total confianza.",
    },
    {
      emoji: "⭐",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "Garantía de Satisfacción 200%",
      description: "Si algún sector no queda como te gusta, volvemos a dejarlo perfecto en menos de 24 horas sin costo extra.",
    },
    {
      emoji: "🏷️",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      title: "Tarifas Claras y Sin Sorpresas",
      description: "Precios fijos en Guaraníes. Pagas recién al finalizar el servicio con transferencia SIPAP o tarjeta.",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Glow suave */}
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Cálido */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-electric-700 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-electric-600" />
            <span>Tu tranquilidad en primer lugar</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            ¿Por qué elegir Aquí Estamos? 💖
          </h2>

          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Nos preocupamos por cada detalle para brindarte una experiencia segura, humana y con garantía de calidad total.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-neutral-50/70 hover:bg-white rounded-3xl p-7 border border-neutral-200 hover:border-electric-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl ${p.iconBg} border flex items-center justify-center mb-5 text-xl shadow-xs group-hover:scale-110 transition-transform`}>
                  <span>{p.emoji}</span>
                </div>

                <h3 className="text-base font-extrabold text-neutral-900 mb-2.5">
                  {p.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {p.description}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-neutral-200/60 flex items-center gap-1.5 text-xs font-bold text-electric-600">
                <span>0{idx + 1}. Beneficio garantizado</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
