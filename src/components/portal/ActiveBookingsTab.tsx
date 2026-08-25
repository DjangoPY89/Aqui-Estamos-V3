"use client";

import React from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Phone, 
  MessageSquare, 
  FileText, 
  Receipt, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation
} from "lucide-react";
import { Booking } from "@/types";
import { formatGs } from "@/lib/pricing";

interface ActiveBookingsTabProps {
  bookings: Booking[];
  onOpenReceipt: (booking: Booking) => void;
  onOpenInvoice: (booking: Booking) => void;
}

export default function ActiveBookingsTab({
  bookings,
  onOpenReceipt,
  onOpenInvoice,
}: ActiveBookingsTabProps) {
  const activeList = bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
  );

  if (activeList.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-electric-50 text-electric-600 flex items-center justify-center mx-auto shadow-inner">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            No tienes servicios activos en curso
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            ¿Tu hogar u oficina necesita una limpieza impecable? Agenda en menos de 60 segundos con personal IPS calificado.
          </p>
        </div>
        <Link
          href="/reservar"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-electric-600 hover:bg-electric-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-electric transition-all active:scale-[0.98]"
        >
          <span>Reservar Servicio Ahora</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Próximos Servicios Agendados ({activeList.length})
        </h2>
        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          Personal formalmente contratado con cobertura IPS
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        {activeList.map((booking) => {
          const isConfirmed = booking.status === "CONFIRMED";
          const isInProgress = booking.status === "IN_PROGRESS";
          const isPending = booking.status === "PENDING";

          const assignedName = (booking as any).employeeName || (booking as any).assignedTo || booking.assignedCleaner;
          const assignedPhone = (booking as any).employeePhone;
          const hours = (booking as any).hours || booking.serviceHours || 4;
          const price = (booking as any).totalPriceGs || booking.totalPrice || 0;
          const bookingNum = (booking as any).bookingNumber || booking.id.slice(-4);

          return (
            <div
              key={booking.id}
              className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs hover:border-electric-300 hover:shadow-md transition-all space-y-5"
            >
              {/* Cabecera de la Tarjeta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-electric-50 text-electric-600 flex items-center justify-center font-black text-sm shrink-0">
                    #{bookingNum}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Limpieza {hours} Horas ({booking.frequency === "once" ? "Única" : "Recurrente"})
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Solicitud registrada el {new Date(booking.createdAt).toLocaleDateString("es-PY")}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-start sm:self-auto">
                  {isInProgress ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span>⚡ En Curso</span>
                    </span>
                  ) : isConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>🟢 Confirmada</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>🟡 Asignando Cuadrilla</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Personal IPS Asignado (Si aplica) */}
              {assignedName && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {assignedName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {assignedName}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>IPS Activo</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Profesional asignada para tu servicio
                      </p>
                    </div>
                  </div>

                  {assignedPhone && (
                    <a
                      href={`https://wa.me/${assignedPhone.replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(assignedName)},%20te%20escribo%20por%20el%20servicio%20de%20limpieza%20de%20Aqu%C3%AD%20Estamos.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Cuadrilla</span>
                    </a>
                  )}
                </div>
              )}

              {/* Grid de Detalles Operativos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                {/* 1. Fecha y Turno */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha y Turno</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-electric-600 shrink-0" />
                    <span>{booking.serviceDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Llegada: {booking.serviceTime} hs</span>
                  </div>
                </div>

                {/* 2. Ubicación */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ubicación del Servicio</span>
                  <div className="flex items-start gap-1.5 font-bold text-slate-900 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                  {booking.latitude && booking.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-electric-600 font-bold hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Ver mapa GPS</span>
                    </a>
                  )}
                </div>

                {/* 3. Inversión y Pago */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total & Método</span>
                  <p className="text-base font-black text-slate-900">
                    {formatGs(price)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium capitalize">
                    Pago: {booking.paymentMethod === "sipap" ? "Transferencia SIPAP" : booking.paymentMethod === "card" ? "Tarjeta POS" : "Efectivo al finalizar"}
                  </p>
                </div>
              </div>

              {/* Botones de Acción al Pie */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(booking)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver Recibo Digital</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenInvoice(booking)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-colors border border-purple-200/60"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Factura Legal KUDE</span>
                  </button>
                </div>

                <a
                  href={`https://wa.me/595981000000?text=Hola%20Aqu%C3%AD%20Estamos,%20deseo%20consultar%20sobre%20mi%20reserva%20%23${bookingNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-slate-500 hover:text-electric-600 flex items-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Soporte Central</span>
                </a>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
