import React from "react";
import { Star } from "lucide-react";
import { getReviews } from "@/lib/db";

const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    userName: "Carolina M. (Villa Morra)",
    rating: 5,
    comment: "Excelente servicio. La puntualidad y la atención al detalle de Carmen superaron mis expectativas. El piso y la cocina quedaron impecables.",
    serviceType: "Integral (6 Horas)",
  },
  {
    id: "rev-2",
    userName: "Esteban R. (Ykua Satî)",
    rating: 5,
    comment: "Muy conforme con el trabajo tras 8 horas de limpieza profunda. Personal confiable, educado y 100% profesional.",
    serviceType: "Full Day (8 Horas)",
  },
  {
    id: "rev-3",
    userName: "Valeria D. (Mcal. López)",
    rating: 5,
    comment: "Contraté el plan recurrente 3 veces por semana. Me ahorra mucho tiempo y la formalidad del servicio es impecable.",
    serviceType: "Plan Recurrente",
  },
];

export default function Testimonials() {
  let reviews = DEFAULT_REVIEWS;
  try {
    const dbReviews = getReviews();
    if (dbReviews && dbReviews.length > 0) {
      reviews = dbReviews as any;
    }
  } catch (e) {
    reviews = DEFAULT_REVIEWS;
  }

  return (
    <section className="py-20 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Opiniones
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Experiencias de Clientes
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Valoraciones reales de hogares y empresas que utilizan Aquí Estamos en Asunción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-electric-200 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-electric-700 bg-electric-50 px-2 py-0.5 rounded border border-electric-100">
                    {rev.serviceType}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-6 font-normal">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-900">{rev.userName}</p>
                  <p className="text-[11px] text-electric-600 font-medium">✓ Cliente Verificado</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
