"use client";

import React from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  RotateCcw, 
  Receipt, 
  FileText, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Booking } from "@/types";
import { formatGs } from "@/lib/pricing";

interface HistoryBookingsTabProps {
  bookings: Booking[];
  onOpenReview: (booking: Booking) => void;
  onOpenReceipt: (booking: Booking) => void;
  onOpenInvoice: (booking: Booking) => void;
}

export default function HistoryBookingsTab({
  bookings,
  onOpenReview,
  onOpenReceipt,
  onOpenInvoice,
}: HistoryBookingsTabProps) {
  const completedList = bookings.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED");

  if (completedList.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Aún no tienes limpiezas completadas
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Una vez finalizados tus servicios programados, podrás consultar tus comprobantes y calificar la atención aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Historial de Servicios Realizados ({completedList.length})
        </h2>
        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          Garantía de satisfacción y facturación 100% legal
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {completedList.map((booking) => {
          const isCancelled = booking.status === "CANCELLED";
          const assignedName = (booking as any).employeeName || (booking as any).assignedTo || booking.assignedCleaner;
          const hasReview = Boolean((booking as any).rating || (booking as any).reviewComment);
          const hours = (booking as any).hours || booking.serviceHours || 4;
          const price = (booking as any).totalPriceGs || booking.totalPrice || 0;
          const bookingNum = (booking as any).bookingNumber || booking.id.slice(-4);

          return (
            <div
              key={booking.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 ${
                isCancelled
                  ? "border-slate-200 opacity-60 bg-slate-50/50"
                  : "border-slate-200/80 shadow-xs hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Servicio #{bookingNum} • {hours} Horas
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Realizado el {booking.serviceDate} a las {booking.serviceTime} hs
                    </p>
                  </div>
                </div>

                <div>
                  {isCancelled ? (
                    <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-black rounded-full border border-rose-200">
                      Cancelado
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completado con Éxito</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Datos del Servicio y Cuadrilla */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</span>
                  <p className="font-semibold text-slate-800 truncate">{booking.address}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Personal Asignado</span>
                  <p className="font-semibold text-slate-800">
                    {assignedName ? `${assignedName} (IPS)` : "Cuadrilla Oficial"}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Monto Abonado</span>
                  <p className="font-black text-slate-900">{formatGs(price)}</p>
                </div>
              </div>

              {/* Acciones y Reseña */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(booking)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Recibo Digital</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenInvoice(booking)}
                    className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-purple-200/60"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Factura KUDE</span>
                  </button>

                  {!isCancelled && !hasReview && (
                    <button
                      type="button"
                      onClick={() => onOpenReview(booking)}
                      className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 border border-amber-200"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Calificar Servicio</span>
                    </button>
                  )}

                  {!isCancelled && hasReview && (
                    <div className="px-3 py-1 bg-amber-50 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-200">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Calificado {(booking as any).rating || 5}/5 ⭐</span>
                    </div>
                  )}
                </div>

                {!isCancelled && (
                  <Link
                    href={`/reservar?hours=${hours}&freq=${booking.frequency}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-electric-600 hover:text-electric-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repetir este servicio</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
