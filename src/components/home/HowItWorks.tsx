import React from "react";
import Link from "next/link";
import { 
  CalendarCheck, 
  Sparkles, 
  HeartHandshake, 
  Coffee, 
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  Home
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      badge: "Sin tarjeta por adelantado",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      iconBg: "bg-blue-50 text-electric-600 border-blue-100",
      icon: CalendarCheck,
      title: "1. Eliges tu horario ideal",
      description: "En menos de 60 segundos seleccionas el bloque de horas (4h, 6h u 8h), la fecha que mejor te quede y tus extras favoritos. ¡Fácil y sin vueltas!",
      tipIcon: Zap,
      friendlyTip: "Reserva lista en 1 minuto",
    },
    {
      number: "2",
      badge: "Personal de confianza con IPS",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      icon: HeartHandshake,
      title: "2. Llegamos puntual a tu puerta",
      description: "Tu colaboradora asignada llega puntualmente en el turno acordado. Todo nuestro equipo cuenta con verificación rigurosa y cobertura laboral IPS.",
      tipIcon: Clock,
      friendlyTip: "Puntualidad y buena energía",
    },
    {
      number: "3",
      badge: "Garantía de Satisfacción 200%",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: Coffee,
      title: "3. Disfrutas tu hogar reluciente",
      description: "Te relajas mientras dejamos tu casa como nueva. Revisas el servicio y recién ahí abonas por transferencia bancaria (SIPAP) o tarjeta.",
      tipIcon: CheckCircle2,
      friendlyTip: "Pagas recién al finalizar",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 sm:py-24 bg-gradient-to-b from-white via-blue-50/40 to-white border-b border-neutral-200/80 relative overflow-hidden">
      
      {/* Círculos decorativos sutiles y amigables */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Cálido y Amistoso */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-electric-700 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-electric-600" />
            <span>Fácil, transparente y sin estrés</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            ¿Cómo funciona? <br className="hidden sm:inline" />
            <span className="text-electric-600">En 3 simples pasos</span> tienes tu casa impecable
          </h2>
          
          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Olvídate de trámites complicados o llamadas eternas. Diseñamos una experiencia súper cómoda para que disfrutes de tu tiempo libre.
          </p>
        </div>

        {/* Tarjetas de Proceso Amigables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Línea conectora visual en pantallas medianas/grandes */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-neutral-200 -translate-y-16 -z-1" />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            const TipIcon = s.tipIcon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/90 shadow-sm hover:shadow-xl hover:border-electric-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative group"
              >
                {/* Número flotante en la esquina */}
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-extrabold text-xs flex items-center justify-center group-hover:bg-electric-600 group-hover:text-white transition-colors">
                  0{s.number}
                </div>

                <div>
                  {/* Icono Redondeado y Cálido */}
                  <div className={`w-14 h-14 rounded-2xl ${s.iconBg} border flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Tagline / Badge */}
                  <div className="mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-lg font-extrabold text-neutral-900 mb-2.5">
                    {s.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {/* Tip amigable al pie de cada tarjeta */}
                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center gap-2 text-xs font-semibold text-neutral-700">
                  <TipIcon className="w-3.5 h-3.5 text-electric-600" />
                  <span>{s.friendlyTip}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner inferior amigable con llamado a la acción */}
        <div className="mt-14 bg-gradient-to-r from-electric-600 to-electric-700 rounded-3xl p-6 sm:p-8 text-white shadow-electric flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-extrabold flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-electric-200" />
              <span>¿Listo para dejar tu casa en las mejores manos?</span>
            </h4>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Agenda hoy mismo en menos de 1 minuto sin pagos anticipados.
            </p>
          </div>

          <Link
            href="/reservar"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-electric-900 hover:bg-neutral-100 font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all active:scale-[0.98] shrink-0"
          >
            <span>Reservar Ahora</span>
            <ArrowRight className="w-4 h-4 text-electric-700" />
          </Link>
        </div>

      </div>
    </section>
  );
}
