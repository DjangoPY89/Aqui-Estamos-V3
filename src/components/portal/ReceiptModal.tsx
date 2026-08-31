"use client";

import React, { useEffect } from "react";
import { 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  X
} from "lucide-react";
import { Booking } from "@/types";
import { formatGs } from "@/lib/pricing";

interface ReceiptModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export default function ReceiptModal({ booking, onClose }: ReceiptModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!booking) return null;

  const hours = (booking as any).hours || booking.serviceHours || 4;
  const price = (booking as any).totalPriceGs || booking.totalPrice || 0;
  const bookingNum = (booking as any).bookingNumber || booking.id.slice(-6);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2.5 sm:p-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="my-auto bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[calc(100dvh-20px)] sm:max-h-[calc(100dvh-40px)] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200/80 relative space-y-4"
      >
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Recibo */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200/50 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comprobante de Servicio Digital</span>
          </div>
          <h3 className="text-xl font-black text-slate-950 tracking-tight">
            AQUÍ ESTAMOS S.A.
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            RUC: 80123456-7 • Servicios Profesionales de Limpieza
          </p>
          <p className="text-xs font-mono font-bold text-[#0071E3] pt-1">
            Recibo #{bookingNum}
          </p>
        </div>

        {/* Datos del Cliente y Servicio */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Cliente:</span>
            <span className="font-bold text-slate-900">{booking.customerName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Teléfono / WhatsApp:</span>
            <span className="font-semibold text-slate-800">{booking.customerPhone}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Fecha del Servicio:</span>
            <span className="font-semibold text-slate-800">{booking.serviceDate}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Hora de Llegada:</span>
            <span className="font-semibold text-slate-800">{booking.serviceTime} hs</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Modalidad:</span>
            <span className="font-semibold text-slate-800">{hours} Horas ({booking.frequency === "once" ? "Único" : "Recurrente"})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Dirección:</span>
            <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{booking.address}</span>
          </div>
        </div>

        {/* Desglose Económico */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Servicio Base ({hours}hs):</span>
            <span className="font-semibold">{formatGs(price)}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>IVA Incluido (10%):</span>
            <span className="font-semibold">{formatGs(Math.round(price / 11))}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-950">
            <span>Total:</span>
            <span className="text-[#0071E3]">{formatGs(price)}</span>
          </div>
        </div>

        {/* Respaldo Legal */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/50 rounded-2xl text-[11px] text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Servicio respaldado por seguro de cuadrilla IPS y garantía 100% de calidad.</span>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-all active:scale-98 cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
