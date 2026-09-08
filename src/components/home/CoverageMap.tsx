import React from "react";
import { MapPin } from "lucide-react";

export default function CoverageMap() {
  const zones = [
    { city: "Asunción", neighborhoods: "Villa Morra, Ykua Satî, Carmelitas, Mcal. López, Centro, Sajonia, Los Laureles, Mburucuyá, Las Lomas" },
    { city: "Luque", neighborhoods: "Centro, Aeropuerto, Rincón, Zárate Isla, Tarumandy" },
    { city: "San Lorenzo", neighborhoods: "Centro, Reducto, Barcequillo, Villa Amelia" },
    { city: "Lambaré", neighborhoods: "Centro, Valle Ybaté, Mbachió, Villa Virginia" },
    { city: "Fernando de la Mora", neighborhoods: "Zona Norte, Zona Sur, Tres Bocas" },
    { city: "Mariano Roque Alonso", neighborhoods: "Centro, Universo, San Jorge" },
  ];

  return (
    <section className="py-20 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Cobertura
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Zonas de Atención
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Servicio a domicilio sin costo de traslado adicional en las principales zonas de Gran Asunción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((z, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-electric-200 shadow-xs transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-electric-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-electric-600" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{z.city}</h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed pl-9">
                {z.neighborhoods}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
