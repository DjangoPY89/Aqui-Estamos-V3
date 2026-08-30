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
  Navigation,
  Star,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { Booking } from "@/types";
import { formatGs, AVAILABLE_EXTRAS } from "@/lib/pricing";

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
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-8 sm:p-12 border border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0071E3] flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-black text-slate-950 tracking-tight">
            No tienes servicios en curso
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            ¿Tu hogar u oficina necesita una limpieza impecable? Agenda en menos de 60 segundos con personal calificado con seguro IPS.
          </p>
        </div>
        <Link
          href="/reservar"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-all active:scale-[0.98]"
        >
          <span>Reservar Servicio Ahora</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <span>Próximos Servicios Agendados</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0071E3] text-white text-[10px] font-bold">
              {activeList.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Seguimiento en vivo del estado de tu limpieza y cuadrilla IPS asignada.
          </p>
        </div>

        <Link
          href="/reservar"
          className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1 self-end sm:self-auto"
        >
          <span>+ Agendar otra fecha</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {activeList.map((booking) => {
          const isConfirmed = booking.status === "CONFIRMED";
          const isInProgress = booking.status === "IN_PROGRESS";
          const isPending = booking.status === "PENDING";

          const assignedName = (booking as any).employeeName || (booking as any).assignedTo || booking.assignedCleaner;
          const assignedPhone = (booking as any).employeePhone;
          const assignedImage = (booking as any).employeeImage || (booking as any).cleanerImage;
          const assignedRating = (booking as any).employeeRating || 5.0;
          const hours = (booking as any).hours || booking.serviceHours || 4;
          const price = (booking as any).totalPriceGs || booking.totalPrice || 0;
          const bookingNum = (booking as any).bookingNumber || booking.id.slice(-4);
          const extrasList = Array.isArray(booking.extras) ? booking.extras : [];

          return (
            <div
              key={booking.id}
              className="bg-white/90 backdrop-blur-xl rounded-[28px] p-6 sm:p-7 border border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md transition-all relative overflow-hidden space-y-5"
            >
              {/* 1. Cabecera de la Reserva */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-sm shrink-0">
                    #{bookingNum}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                        Limpieza Residencial • {hours} Horas
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                        {booking.frequency === "once" ? "Servicio Único" : "Plan Recurrente"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Reserva registrada el {new Date(booking.createdAt).toLocaleDateString("es-PY", { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Status Badge Animado */}
                <div className="self-start sm:self-auto">
                  {isInProgress ? (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0071E3] text-xs font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0071E3] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0071E3]"></span>
                      </span>
                      <span>En Progreso</span>
                    </span>
                  ) : isConfirmed ? (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/50">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Confirmada & Cuadrilla Lista</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/50">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Asignando Personal IPS</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Tarjeta Destacada de la Profesional IPS Asignada */}
              {assignedName ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      {assignedImage ? (
                        <img
                          src={assignedImage}
                          alt={assignedName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-xs">
                          {assignedName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-white">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-950">
                          {assignedName}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/40">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>IPS Activo</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <span>Personal Oficial Aquí Estamos</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-700 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{assignedRating.toFixed(1)} / 5.0</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  {assignedPhone && (
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${assignedPhone.replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(assignedName)},%20te%20escribo%20por%20mi%20servicio%20de%20limpieza%20agendado%20en%20Aqu%C3%AD%20Estamos%20(%23${bookingNum}).`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-xs transition-all active:scale-98"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Cuadrilla</span>
                      </a>

                      <a
                        href={`tel:${assignedPhone}`}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-full border border-slate-200 transition-colors shadow-2xs"
                        title="Llamar a la profesional"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Asignando la mejor profesional para tu zona
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Te notificaremos los datos y contacto directo de tu personal antes de la llegada.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. Grid de Datos Clave del Servicio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                
                {/* 📅 Fecha y Horario de Llegada */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha y Arribo</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-black text-slate-950 text-sm">
                      <Calendar className="w-4 h-4 text-[#0071E3] shrink-0" />
                      <span>{booking.serviceDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Llegada: {booking.serviceTime} hs</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#0071E3] bg-blue-50 px-2.5 py-0.5 rounded-full inline-block w-max mt-1">
                    Turno {booking.serviceTime.startsWith("08") ? "Matutino" : "Vespertino"} ({hours}hs de labor)
                  </span>
                </div>

                {/* 📍 Domicilio y Coordenadas GPS */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ubicación</span>
                  <div className="space-y-1">
                    <div className="flex items-start gap-1.5 font-semibold text-slate-900 leading-snug">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{booking.address}</span>
                    </div>
                  </div>
                  {booking.latitude && booking.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline pt-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Ver Ruta en Google Maps</span>
                    </a>
                  )}
                </div>

                {/* 💳 Inversión y Forma de Pago */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total con IVA</span>
                  <div className="space-y-0.5">
                    <p className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                      {formatGs(price)}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium capitalize">
                      {booking.paymentMethod === "sipap" ? "Transferencia SIPAP" : booking.paymentMethod === "card" ? "Tarjeta POS" : "Efectivo al finalizar"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block w-max">
                    ✓ Factura Legal KUDE Incluida
                  </span>
                </div>

              </div>

              {/* 4. Extras Contratados (Si existen) */}
              {extrasList.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Adicionales Especiales Contratados:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {extrasList.map((extraId: string) => {
                      const found = AVAILABLE_EXTRAS.find((e) => e.id === extraId);
                      return (
                        <span
                          key={extraId}
                          className="px-3 py-1 bg-white border border-slate-200/70 rounded-full text-xs font-medium text-slate-800 shadow-2xs"
                        >
                          {found ? found.name : extraId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Barra de Acciones al Pie */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(booking)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-semibold transition-all active:scale-98 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Recibo Digital</span>
                  </button>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[11px] font-medium border border-slate-200/60">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Factura Legal: Al finalizar</span>
                  </span>
                </div>

                <a
                  href={`https://wa.me/595981000000?text=Hola%20Aqu%C3%AD%20Estamos,%20necesito%20coordinar%20mi%20reserva%20%23${bookingNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0071E3] transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
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
