"use client";

import React from "react";
import { 
  Receipt, 
  Printer, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Building 
} from "lucide-react";
import { Booking } from "@/types";
import { formatGs } from "@/lib/pricing";

interface ReceiptModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export default function ReceiptModal({ booking, onClose }: ReceiptModalProps) {
  if (!booking) return null;

  const hours = (booking as any).hours || booking.serviceHours || 4;
  const price = (booking as any).totalPriceGs || booking.totalPrice || 0;
  const bookingNum = (booking as any).bookingNumber || booking.id.slice(-6);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 space-y-6">
        
        {/* Cabecera del Recibo */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black border border-emerald-200 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comprobante de Servicio Digital</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            AQUÍ ESTAMOS S.A.
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            RUC: 80123456-7 • Servicios Profesionales de Limpieza
          </p>
          <p className="text-xs font-mono font-bold text-electric-600 pt-1">
            Recibo #{bookingNum}
          </p>
        </div>

        {/* Datos del Cliente y Servicio */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Cliente:</span>
            <span className="font-extrabold text-slate-900">{booking.customerName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Teléfono / WhatsApp:</span>
            <span className="font-bold text-slate-800">{booking.customerPhone}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Fecha del Servicio:</span>
            <span className="font-bold text-slate-800">{booking.serviceDate}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Hora de Llegada:</span>
            <span className="font-bold text-slate-800">{booking.serviceTime} hs</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Modalidad:</span>
            <span className="font-bold text-slate-800">{hours} Horas ({booking.frequency === "once" ? "Único" : "Recurrente"})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">Dirección:</span>
            <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">{booking.address}</span>
          </div>
        </div>

        {/* Desglose Económico */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Servicio Base ({hours}hs):</span>
            <span>{formatGs(price)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>IVA Incluido (10%):</span>
            <span>{formatGs(Math.round(price / 11))}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
            <span>Total a Abonar:</span>
            <span className="text-electric-600">{formatGs(price)}</span>
          </div>
        </div>

        {/* Respaldo Legal */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Servicio respaldado por seguro de cuadrilla IPS y garantía 100% de calidad.</span>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all active:scale-98"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
