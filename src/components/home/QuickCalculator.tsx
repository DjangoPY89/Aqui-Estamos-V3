"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { AVAILABLE_EXTRAS, calculatePricing, formatGs, SERVICE_PACKAGES } from "@/lib/pricing";
import { FrequencyType, ServiceHour } from "@/types";

export default function QuickCalculator() {
  const router = useRouter();
  const [hours, setHours] = useState<ServiceHour>(6);
  const [frequency, setFrequency] = useState<FrequencyType>("once");
  const [selectedExtras, setSelectedExtras] = useState<string[]>(["nevera"]);

  const pricing = calculatePricing(hours, frequency, selectedExtras);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    const params = new URLSearchParams({
      hours: hours.toString(),
      freq: frequency,
      extras: selectedExtras.join(","),
    });
    router.push(`/reservar?${params.toString()}`);
  };

  return (
    <section id="precios" className="py-20 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Cotizador
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Calculadora de Presupuesto
          </h2>
          <p className="mt-3 text-neutral-600 text-sm sm:text-base">
            Configura las horas y extras para calcular tu inversión exacta en Guaraníes.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 max-w-5xl shadow-clean">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Opciones */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Horas */}
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
                        className={`p-3 rounded-xl text-left border transition-all ${
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

              {/* Frecuencia */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5">
                  2. Frecuencia y Descuentos
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  
                  {/* 1. Servicio Único */}
                  <button
                    type="button"
                    onClick={() => setFrequency("once")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      frequency === "once"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">Servicio Único</p>
                      <p className="text-[11px] text-neutral-500">Tarifa regular estándar</p>
                    </div>
                    {frequency === "once" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                  {/* 2. Más de 1 vez x semana */}
                  <button
                    type="button"
                    onClick={() => setFrequency("multi_weekly")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      frequency === "multi_weekly" || frequency === "weekly_2_4"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold">+1 vez por semana</p>
                        <span className="text-[9px] uppercase font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                          15% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">2 o más días semanales</p>
                    </div>
                    {(frequency === "multi_weekly" || frequency === "weekly_2_4") && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                  {/* 3. Semanal */}
                  <button
                    type="button"
                    onClick={() => setFrequency("weekly")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      frequency === "weekly"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold">Semanal</p>
                        <span className="text-[9px] uppercase font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                          15% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">1 día fijo cada semana</p>
                    </div>
                    {frequency === "weekly" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                  {/* 4. Quincenal */}
                  <button
                    type="button"
                    onClick={() => setFrequency("biweekly")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      frequency === "biweekly"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold">Quincenal</p>
                        <span className="text-[9px] uppercase font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                          10% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">Cada 15 días</p>
                    </div>
                    {frequency === "biweekly" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                  {/* 5. Mensual */}
                  <button
                    type="button"
                    onClick={() => setFrequency("monthly")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      frequency === "monthly"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold">Mensual</p>
                        <span className="text-[9px] uppercase font-black bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                          5% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">1 servicio al mes</p>
                    </div>
                    {frequency === "monthly" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                  {/* 6. Personalizado */}
                  <button
                    type="button"
                    onClick={() => setFrequency("custom")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      frequency === "custom"
                        ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold">Personalizado</p>
                        <span className="text-[9px] uppercase font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
                          20% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">Elige 5+ fechas en 30 días</p>
                    </div>
                    {frequency === "custom" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                  </button>

                </div>
              </div>

              {/* Extras */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5">
                  3. Extras Opcionales
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_EXTRAS.map((extra) => {
                    const isChecked = selectedExtras.includes(extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra.id)}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                          isChecked
                            ? "bg-electric-50 border-electric-300 text-electric-900 font-medium"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="truncate">{extra.name}</span>
                        <span className="text-[10px] text-neutral-400 shrink-0 ml-1">
                          {extra.price > 0 ? `+${extra.price / 1000}k` : "Inc."}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Recibo */}
            <div className="lg:col-span-5 bg-neutral-50 rounded-xl p-6 border border-neutral-200 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4 text-xs font-semibold text-neutral-700">
                  <span>Resumen Estimado</span>
                  <span className="text-electric-600">{pricing.hoursTitle}</span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 pb-4 border-b border-neutral-200">
                  <div className="flex justify-between">
                    <span>Base ({hours} Horas):</span>
                    <span className="font-medium text-neutral-900">{formatGs(pricing.basePrice)}</span>
                  </div>
                  {pricing.extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Extras:</span>
                      <span className="font-medium text-neutral-900">+{formatGs(pricing.extrasTotal)}</span>
                    </div>
                  )}
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Descuento recurrente ({pricing.discountPercentage}%):</span>
                      <span>-{formatGs(pricing.discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mb-6">
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">Total por servicio</p>
                  <div className="text-3xl font-bold text-neutral-950 mt-1">
                    {formatGs(pricing.finalPrice)}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Tarifa final con IVA y cobertura laboral incluida.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-3.5 px-4 rounded-xl bg-electric-600 hover:bg-electric-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-electric-sm transition-all active:scale-[0.98]"
              >
                <span>Continuar Reserva</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
