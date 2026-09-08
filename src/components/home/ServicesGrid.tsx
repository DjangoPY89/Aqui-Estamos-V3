import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, Clock, Star, Zap, Home, Tag } from "lucide-react";
import { formatGs, SERVICE_PACKAGES } from "@/lib/pricing";

export default function ServicesGrid() {
  const plans = [
    {
      hours: 4,
      icon: Zap,
      iconBg: "bg-blue-100 text-electric-600",
      name: `${SERVICE_PACKAGES[4].name} (4 Horas)`,
      badge: "Ideal departamentos",
      tagline: "Para 1 o 2 ambientes que necesitan mantenimiento",
      price: SERVICE_PACKAGES[4].basePrice,
      description: "La solución rápida para dejar baño, cocina y pisos frescos y relucientes.",
      features: [
        "Mantenimiento esencial y desinfección",
        "Espacios de 1 a 2 ambientes",
        "Limpieza profunda de baño y cocina",
        "Aspirado y trapeado con rica fragancia",
        "Sacudido de muebles y superficies",
      ],
      popular: false,
    },
    {
      hours: 6,
      icon: Sparkles,
      iconBg: "bg-amber-100 text-amber-700",
      name: `${SERVICE_PACKAGES[6].name} (6 Horas)`,
      badge: "El favorito de las familias",
      tagline: "Casas medianas de 2 a 3 habitaciones",
      price: SERVICE_PACKAGES[6].basePrice,
      description: "El equilibrio perfecto para una limpieza profunda y con mucha atención a los detalles.",
      features: [
        "Todo lo incluido en el plan Express",
        "Limpieza profunda de 2 a 3 dormitorios",
        "Desinfección total de azulejos y griferías",
        "Organización de camas y cambio de sábanas",
        "Limpieza exterior de heladera y microondas",
      ],
      popular: true,
    },
    {
      hours: 8,
      icon: Home,
      iconBg: "bg-emerald-100 text-emerald-700",
      name: `${SERVICE_PACKAGES[8].name} (8 Horas)`,
      badge: "Reseteo total",
      tagline: "Casas grandes, mudanzas o post-evento",
      price: SERVICE_PACKAGES[8].basePrice,
      description: "Jornada completa para cuando tu casa necesita un reseteo absoluto de punta a punta.",
      features: [
        "Jornada completa de 8 horas dedicadas",
        "Ideal para mudanzas o limpiezas profundas",
        "Limpieza minuciosa de vidrios y ventanales",
        "Desinfección interior de muebles y placares",
        "Lavado y doblado de prendas incluido",
      ],
      popular: false,
    },
  ];

  return (
    <section id="servicios" className="py-20 sm:py-24 bg-white border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Glow suave decorativo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Amistoso */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-electric-700 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-electric-600" />
            <span>Tarifas fijas, claras y sin vueltas</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Elige el plan perfecto para tu hogar
          </h2>

          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Sin cargos ocultos ni sorpresas. Todo nuestro personal cuenta con seguro de IPS para que descanses con total tranquilidad.
          </p>
        </div>

        {/* Grid de Planes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.hours}
                className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative group ${
                  plan.popular
                    ? "bg-navy-950 text-white border-2 border-electric-500 shadow-xl lg:-translate-y-2"
                    : "bg-white text-neutral-900 border border-neutral-200 hover:border-electric-300 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div>
                  {/* Header Card con Icono y Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${plan.iconBg} flex items-center justify-center font-bold`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className={`text-lg font-black ${plan.popular ? "text-white" : "text-neutral-900"}`}>
                        {plan.name}
                      </h3>
                    </div>

                    {plan.popular ? (
                      <span className="text-[11px] font-extrabold px-3 py-1 bg-electric-600 text-white rounded-full shadow-electric-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Más Elegido</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mb-6 font-medium ${plan.popular ? "text-neutral-300" : "text-neutral-500"}`}>
                    {plan.tagline}
                  </p>

                  {/* Precio */}
                  <div className={`mb-6 pb-6 border-b ${plan.popular ? "border-neutral-800" : "border-neutral-100"}`}>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl sm:text-4xl font-black tracking-tight ${plan.popular ? "text-white" : "text-neutral-950"}`}>
                        {formatGs(plan.price)}
                      </span>
                    </div>
                    <p className={`text-xs mt-2 font-bold flex items-center gap-1.5 ${plan.popular ? "text-emerald-400" : "text-emerald-600"}`}>
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      <span>10% OFF en servicios semanales o recurrentes</span>
                    </p>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${plan.popular ? "text-neutral-300" : "text-neutral-600"}`}>
                    {plan.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.popular ? "bg-electric-500/20 text-electric-400" : "bg-electric-50 text-electric-600"
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={plan.popular ? "text-neutral-200" : "text-neutral-700"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón */}
                <Link
                  href={`/reservar?hours=${plan.hours}`}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    plan.popular
                      ? "bg-electric-600 hover:bg-electric-500 text-white shadow-electric"
                      : "bg-neutral-900 hover:bg-electric-600 text-white shadow-sm"
                  }`}
                >
                  <span>Reservar este plan ({plan.hours} Horas)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

