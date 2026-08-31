"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
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
  onRefreshBookings?: () => void;
}

export default function ActiveBookingsTab({
  bookings,
  onOpenReceipt,
  onOpenInvoice,
  onRefreshBookings,
}: ActiveBookingsTabProps) {
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    type: "subscription" | "batch" | "single";
    id: string;
    bookingNumber: string;
    title: string;
    description: string;
  } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const activeList = bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
  );

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    setIsCancelling(true);
    setCancelFeedback(null);

    try {
      if (cancelModal.type === "subscription") {
        const res = await fetch("/api/bookings/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel_subscription", subscriptionId: cancelModal.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cancelar suscripción.");
        setCancelFeedback({ message: data.message || "Suscripción cancelada con éxito." });
      } else if (cancelModal.type === "batch") {
        const res = await fetch("/api/bookings/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete_batch", batchId: cancelModal.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cancelar paquete de reservas.");
        setCancelFeedback({ message: data.message || "Paquete de reservas cancelado con éxito." });
      } else {
        const res = await fetch(`/api/bookings/${cancelModal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cancelar la reserva.");
        setCancelFeedback({ message: "Reserva cancelada con éxito." });
      }

      setTimeout(() => {
        setCancelModal(null);
        setCancelFeedback(null);
        if (onRefreshBookings) onRefreshBookings();
      }, 1500);
    } catch (err: any) {
      setCancelFeedback({ message: err.message || "Error al procesar la cancelación.", isError: true });
    } finally {
      setIsCancelling(false);
    }
  };

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
          const assignedImage = (booking as any).employeeImage || (booking as any).cleanerImage;
          const assignedRating = (booking as any).employeeRating || 5.0;
          const hours = (booking as any).hours || booking.serviceHours || 4;
          const price = (booking as any).totalPriceGs || booking.totalPrice || 0;
          const bookingNum = (booking as any).bookingNumber || booking.id.slice(-4);
          const extrasList = Array.isArray(booking.extras) ? booking.extras : [];

          // Reglas de cancelación por tipo de reserva
          const now = Date.now();
          const createdTime = new Date(booking.createdAt).getTime();
          const hoursSinceCreation = (now - createdTime) / (1000 * 60 * 60);

          const serviceDateTime = new Date(`${booking.serviceDate}T${booking.serviceTime || "08:00"}:00`).getTime();
          const hoursUntilService = (serviceDateTime - now) / (1000 * 60 * 60);

          const isRecurring = Boolean(booking.subscriptionId || ["weekly", "biweekly", "monthly", "semanal", "quincenal", "mensual"].includes(booking.frequency));
          const isBatch = Boolean(booking.batchId || booking.frequency === "multi_weekly" || booking.frequency === "custom" || booking.frequency === "weekly_2_4");

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
                      {isRecurring ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 uppercase tracking-wider">
                          Suscripción Anual
                        </span>
                      ) : isBatch ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 uppercase tracking-wider">
                          Paquete de Citas
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                          Servicio Único
                        </span>
                      )}
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
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between gap-4">
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total por Servicio</span>
                  <div className="space-y-0.5">
                    <p className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                      {formatGs(price)}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium capitalize">
                      {booking.paymentMethod === "sipap" ? "Transferencia SIPAP" : booking.paymentMethod === "card" ? "Tarjeta / QR" : "Efectivo al finalizar"}
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

              {/* 5. Barra de Acciones y Cancelaciones Inteligentes */}
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

                  {/* Botón de Cancelación según Tipo de Plan */}
                  {isRecurring ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCancelModal({
                          isOpen: true,
                          type: "subscription",
                          id: booking.subscriptionId || booking.id,
                          bookingNumber: bookingNum,
                          title: "Cancelar Suscripción Recurrente",
                          description:
                            "¿Estás seguro de cancelar tu suscripción recurrente? Esta acción cancelará y eliminará automáticamente todas las citas futuras del plan que no hayan sido completadas o estén en curso.",
                        })
                      }
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                    >
                      <span>Cancelar Suscripción</span>
                    </button>
                  ) : isBatch ? (
                    hoursSinceCreation <= 48 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCancelModal({
                            isOpen: true,
                            type: "batch",
                            id: booking.batchId || booking.id,
                            bookingNumber: bookingNum,
                            title: "Cancelar Paquete de Reservas",
                            description:
                              "¿Deseas cancelar todas las reservas correspondientes a este paquete contratado? (Válido dentro de las 48hs de realizada la reserva).",
                          })
                        }
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        <span>Cancelar Paquete</span>
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/595981000000?text=Hola%20Aqu%C3%AD%20Estamos,%20necesito%20cancelar%20mi%20paquete%20de%20reservas%20%23${bookingNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-[11px] font-semibold border border-slate-200 hover:text-[#0071E3]"
                        title="Han pasado más de 48h desde la reserva. Para cambios o cancelaciones contacta a Atención al Cliente."
                      >
                        <span>Cancelar: Contactar Atención al Cliente</span>
                      </a>
                    )
                  ) : (
                    hoursUntilService >= 48 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCancelModal({
                            isOpen: true,
                            type: "single",
                            id: booking.id,
                            bookingNumber: bookingNum,
                            title: "Cancelar Reserva de Servicio",
                            description:
                              "¿Estás seguro de cancelar esta reserva? (Permitido hasta 48hs antes del día de la cita).",
                          })
                        }
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        <span>Cancelar Cita</span>
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/595981000000?text=Hola%20Aqu%C3%AD%20Estamos,%20necesito%20modificar%20mi%20reserva%20%23${bookingNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-[11px] font-semibold border border-slate-200 hover:text-[#0071E3]"
                        title="Faltan menos de 48h para la cita. Para coordinar cambios comunícate con Soporte Central."
                      >
                        <span>Cancelar: Contactar Soporte Central</span>
                      </a>
                    )
                  )}
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

      {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
      {cancelModal && cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-950">{cancelModal.title}</h3>
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                disabled={isCancelling}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {cancelModal.description}
            </p>

            {cancelFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                cancelFeedback.isError ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}>
                {cancelFeedback.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isCancelling ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelando...</span>
                  </>
                ) : (
                  <span>Confirmar Cancelación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
