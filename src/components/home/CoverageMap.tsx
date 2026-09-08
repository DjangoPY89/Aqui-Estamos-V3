import React from "react";
import { MapPin, Navigation, Building2, Plane, GraduationCap, Anchor, Trees, ShoppingBag } from "lucide-react";

export default function CoverageMap() {
  const zones = [
    { city: "Asunción", icon: Building2, badge: "Cobertura Total", neighborhoods: "Villa Morra, Ykua Satî, Carmelitas, Mcal. López, Centro, Sajonia, Los Laureles, Mburucuyá, Las Lomas" },
    { city: "Luque", icon: Plane, badge: "Sin costo extra", neighborhoods: "Centro, Aeropuerto, Rincón, Zárate Isla, Conmebol, Tarumandy" },
    { city: "San Lorenzo", icon: GraduationCap, badge: "Sin costo extra", neighborhoods: "Centro, Campus UNA, Reducto, Barcequillo, Villa Amelia" },
    { city: "Lambaré", icon: Anchor, badge: "Sin costo extra", neighborhoods: "Centro, Yacht y Golf Club, Valle Ybaté, Mbachió, Villa Virginia" },
    { city: "Fernando de la Mora", icon: Trees, badge: "Sin costo extra", neighborhoods: "Zona Norte, Zona Sur, Tres Bocas, Santa Teresa" },
    { city: "Mariano Roque Alonso", icon: ShoppingBag, badge: "Sin costo extra", neighborhoods: "Centro, Shopping Mariano, Universo, San Jorge" },
  ];

  return (
    <section className="py-20 sm:py-24 bg-neutral-50/70 border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Glow suave */}
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Cálido */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-electric-700 text-xs font-bold mb-4 shadow-2xs">
            <Navigation className="w-3.5 h-3.5 text-electric-600" />
            <span>Siempre cerca de vos</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight flex items-center justify-center gap-3 flex-wrap">
            <span>¡Llegamos directo a tu puerta!</span>
            <span className="inline-flex p-1.5 rounded-xl bg-blue-50 text-electric-600 border border-blue-100">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
            </span>
          </h2>

          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Servicio a domicilio sin recargos sorpresa de traslado en las principales zonas de Asunción y Gran Asunción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((z, idx) => {
            const Icon = z.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 hover:border-electric-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-electric-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-neutral-900">{z.city}</h3>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      {z.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                    {z.neighborhoods}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center gap-1.5 text-xs font-semibold text-electric-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Disponible de Lunes a Sábado</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
