"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { calculatePricing, formatGs, SERVICE_PACKAGES } from "@/lib/pricing";
import { FrequencyType, ServiceHour } from "@/types";

export default function QuickCalculator() {
  const router = useRouter();
  const [hours, setHours] = useState<ServiceHour>(6);
  const [frequency, setFrequency] = useState<FrequencyType>("once");
  const [customDatesCount, setCustomDatesCount] = useState<number>(3);

  const datesCount = frequency === "custom" ? customDatesCount : 1;
  const pricing = calculatePricing(hours, frequency, [], datesCount);

  const handleContinue = () => {
    const params = new URLSearchParams({
      hours: hours.toString(),
      freq: frequency,
    });
    router.push(`/reservar?${params.toString()}`);
  };

  return (
    <section id="precios" className="py-20 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Cotizador en Vivo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Calculadora de Presupuesto
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Configura las horas y frecuencia para calcular tu inversión exacta en Guaraníes.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 max-w-5xl shadow-clean">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Opciones */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Duración del Bloque */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5">
                  1. Duración del Bloque
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {([4, 6, 8] as ServiceHour[]).map((h) => {
                    const isSelected = hours === h;
                    const pkg = SERVICE_PACKAGES[h];
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHours(h)}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-electric-600 text-white border-electric-600 shadow-electric-sm"
                            : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50 hover:border-electric-200"
                        }`}
                      >
                        <p className="font-bold text-sm">{h} Horas</p>
                        <p className={`text-[11px] ${isSelected ? "text-white/80" : "text-neutral-500"}`}>
                          {formatGs(pkg.basePrice)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Frecuencia y Descuentos */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5">
                  2. Frecuencia del Servicio y Descuentos
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* 1. Servicio Único */}
                  <button
                    type="button"
                    onClick={() => setFrequency("once")}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all h-full min-h-[72px] ${
                      frequency === "once"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold">Servicio Único</p>
                      <p className="text-[11px] text-neutral-500">Tarifa regular estándar (1 fecha)</p>
                    </div>
                    {frequency === "once" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                  {/* 2. Semanal (10% OFF) */}
                  <button
                    type="button"
                    onClick={() => setFrequency("weekly")}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all h-full min-h-[72px] ${
                      frequency === "weekly"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold">Semanal</p>
                        <span className="text-[9px] uppercase font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                          10% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">Agendamiento recurrente semanal</p>
                    </div>
                    {frequency === "weekly" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                  {/* 3. Personalizado (10% OFF - Elige al menos 3 fechas) */}
                  <button
                    type="button"
                    onClick={() => setFrequency("custom")}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all h-full min-h-[72px] ${
                      frequency === "custom"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold">Personalizado</p>
                        <span className="text-[9px] uppercase font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
                          10% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">Elige al menos 3 fechas en los próximos 30 días</p>
                    </div>
                    {frequency === "custom" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                </div>

                {/* Selector de cantidad de fechas si elige Personalizado */}
                {frequency === "custom" && (
                  <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
                    <div>
                      <p className="text-xs font-bold text-amber-950">Fechas estimadas a agendar:</p>
                      <p className="text-[11px] text-amber-800">Mínimo 3 fechas (10% de descuento incluido)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomDatesCount(Math.max(3, customDatesCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 flex items-center justify-center hover:bg-amber-100 transition-all text-xs active:scale-95"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-amber-950 min-w-[24px] text-center">
                        {customDatesCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomDatesCount(Math.min(20, customDatesCount + 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 flex items-center justify-center hover:bg-amber-100 transition-all text-xs active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Recibo */}
            <div className="lg:col-span-5 bg-neutral-50 rounded-2xl p-6 border border-neutral-200 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4 text-xs font-semibold text-neutral-700">
                  <span className="uppercase tracking-wider text-electric-600 font-bold">Resumen de Reserva</span>
                  <span className="text-neutral-900 font-bold">{pricing.hoursTitle}</span>
                </div>

                <div className="space-y-2 text-xs text-neutral-600 pb-4 border-b border-neutral-200">
                  <div className="flex justify-between">
                    <span>
                      Base ({hours} Horas
                      {datesCount > 1 ? ` x ${datesCount} días` : ""}):
                    </span>
                    <span className="font-medium text-neutral-900">{formatGs(pricing.basePrice)}</span>
                  </div>
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Descuento por Frecuencia ({pricing.discountPercentage}%):</span>
                      <span>-{formatGs(pricing.discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mb-2">
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                    {datesCount > 1 ? "Total del Paquete" : "Total por Servicio"}
                  </p>
                  <div className="text-3xl font-bold text-neutral-950 mt-1">
                    {formatGs(pricing.finalPrice)}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    ✓ Sin pagos por adelantado. Abonarás al finalizar el servicio.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-3.5 px-4 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-electric transition-all active:scale-[0.98]"
                >
                  <span>Continuar Reserva</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-1 text-[11px] text-neutral-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-electric-600 shrink-0" />
                    <span>Garantía de Satisfacción 200%</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-electric-600 shrink-0" />
                    <span>Cancelación sin costo hasta 24h antes</span>
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
