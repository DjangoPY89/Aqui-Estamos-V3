import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { formatGs } from "@/lib/pricing";

export default function ServicesGrid() {
  const plans = [
    {
      hours: 4,
      name: "Express (4 Horas)",
      tagline: "Departamentos de 1-2 ambientes",
      price: 145000,
      description: "Ideal para mantenimiento esencial de superficies, cocina, baños y pisos.",
      features: [
        "Mantenimiento esencial y desinfección",
        "Espacios de 1-2 ambientes",
        "Limpieza profunda de baño y cocina",
        "Aspirado y trapeado de pisos",
        "Sacudido de superficies principales",
      ],
      popular: false,
    },
    {
      hours: 6,
      name: "Integral (6 Horas)",
      tagline: "Casas medianas (2-3 habitaciones)",
      price: 185000,
      description: "Nuestra opción más equilibrada para una limpieza profunda y detallada.",
      features: [
        "Todo lo incluido en el plan Express",
        "Limpieza profunda de 2 a 3 habitaciones",
        "Desinfección integral de azulejos y griferías",
        "Organización general y cambio de sábanas",
        "Limpieza exterior de electrodomésticos",
      ],
      popular: true,
    },
    {
      hours: 8,
      name: "Full Day (8 Horas)",
      tagline: "Residencias amplias o mudanzas",
      price: 245000,
      description: "Jornada completa para limpiezas profundas de fin de obra o reseteo total.",
      features: [
        "Jornada exhaustiva de 8 horas de trabajo",
        "Limpieza de mudanza o post-obra",
        "Interior de vidrios y ventanales",
        "Desinfección profunda de gabinetes",
        "Lavado y doblado de prendas incluido",
      ],
      popular: false,
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Planes y Tarifas
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Servicios de Limpieza por Horas
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Tarifas planas y transparentes en Guaraníes. Sin cargos ocultos ni sorpresas.
          </p>
        </div>

        {/* Grid de Planes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.hours}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all ${
                plan.popular
                  ? "bg-navy-950 text-white border-2 border-electric-500 shadow-electric relative"
                  : "bg-white text-neutral-900 border border-neutral-200 hover:border-electric-200 shadow-xs"
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-electric-600 text-white rounded-full shadow-electric-sm">
                      Más Elegido
                    </span>
                  )}
                </div>

                <p className={`text-xs mb-6 ${plan.popular ? "text-neutral-400" : "text-neutral-500"}`}>
                  {plan.tagline}
                </p>

                {/* Precio */}
                <div className="mb-6 pb-6 border-b border-neutral-200/20">
                  <div className={`text-3xl font-bold tracking-tight ${plan.popular ? "text-white" : "text-neutral-900"}`}>
                    {formatGs(plan.price)}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${plan.popular ? "text-emerald-400" : "text-emerald-600"}`}>
                    15% de descuento en planes recurrentes
                  </p>
                </div>

                <p className={`text-xs leading-relaxed mb-6 ${plan.popular ? "text-neutral-300" : "text-neutral-600"}`}>
                  {plan.description}
                </p>

                {/* Features */}
                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.popular ? "text-electric-400" : "text-electric-600"}`} />
                      <span className={plan.popular ? "text-neutral-300" : "text-neutral-700"}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón */}
              <Link
                href={`/reservar?hours=${plan.hours}`}
                className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  plan.popular
                    ? "bg-electric-600 hover:bg-electric-500 text-white font-semibold shadow-electric-sm"
                    : "bg-neutral-900 hover:bg-electric-600 text-white"
                }`}
              >
                <span>Reservar ({plan.hours} Horas)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
