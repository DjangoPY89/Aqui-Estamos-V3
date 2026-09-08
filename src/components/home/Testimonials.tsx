import React from "react";
import { Star, Sparkles, Heart, Quote } from "lucide-react";
import { getReviews } from "@/lib/db";

const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    userName: "Carolina M. (Villa Morra)",
    rating: 5,
    comment: "Excelente experiencia. La puntualidad y la calidez de Carmen superaron mis expectativas. El piso y la cocina quedaron con un aroma a limpio increíble.",
    serviceType: "Integral (6 Horas)",
  },
  {
    id: "rev-2",
    userName: "Esteban R. (Ykua Satî)",
    rating: 5,
    comment: "Súper conforme tras 8 horas de limpieza profunda de mudanza. Personal súper educado, confiable y 100% profesional.",
    serviceType: "Full Day (8 Horas)",
  },
  {
    id: "rev-3",
    userName: "Valeria D. (Mcal. López)",
    rating: 5,
    comment: "Contraté el plan recurrente 2 veces por semana. Me devolvió los fines de semana libres y la formalidad con IPS me da total tranquilidad.",
    serviceType: "Plan Recurrente Semanal",
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
    <section className="py-20 sm:py-24 bg-white border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Glow suave */}
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-amber-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Cálido */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Experiencias Reales</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Lo que dicen quienes ya <br className="hidden sm:inline" />
            disfrutan de su tiempo libre ⭐
          </h2>

          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Valoraciones de hogares y empresas que eligen la tranquilidad de Aquí Estamos en Asunción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-neutral-50/70 hover:bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/90 hover:border-electric-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-extrabold text-electric-700 bg-electric-50 px-2.5 py-1 rounded-full border border-electric-100">
                    {rev.serviceType}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-6 font-normal italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-electric-800 font-black text-xs flex items-center justify-center">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-950">{rev.userName}</p>
                    <p className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1">
                      <span>✓</span> Cliente Verificado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
