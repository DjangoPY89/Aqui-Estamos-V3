"use client";

import React from "react";
import { Clock, CheckCircle2, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Booking } from "@/types";

interface PortalStatsProps {
  bookings: Booking[];
  savedAddressesCount: number;
}

export default function PortalStats({ bookings, savedAddressesCount }: PortalStatsProps) {
  const activeBookings = bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
  );

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  const totalHours = completedBookings.reduce((acc, b) => {
    const h = (b as any).hours || b.serviceHours || 4;
    return acc + Number(h);
  }, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Servicios Activos */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-electric-300 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Activos</span>
          <div className="w-8 h-8 rounded-xl bg-electric-50 text-electric-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {activeBookings.length}
        </p>
        <p className="text-[11px] text-slate-500 font-medium">
          {activeBookings.length === 1 ? "Servicio programado" : "Servicios programados"}
        </p>
      </div>

      {/* 2. Limpiezas Completadas */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Historial</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
          {completedBookings.length}
        </p>
        <p className="text-[11px] text-slate-500 font-medium">
          {totalHours} hs acumuladas
        </p>
      </div>

      {/* 3. Direcciones Registradas */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicaciones</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
          {savedAddressesCount}
        </p>
        <p className="text-[11px] text-slate-500 font-medium">
          Direcciones fijadas en mapa
        </p>
      </div>

      {/* 4. Garantía 100% Protegida */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Garantía</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          <span className="text-emerald-600">100%</span> Calidad
        </p>
        <p className="text-[11px] text-slate-500 font-medium">
          Seguro IPS y re-limpieza gratuita
        </p>
      </div>
    </div>
  );
}
