"use client";

import React from "react";
import { Clock, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
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
      <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-5 border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between text-center space-y-2.5 transition-all hover:shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center font-bold">
          <Clock className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            En Curso
          </span>
          <p className="text-3xl font-black text-slate-950 tracking-tight">
            {activeBookings.length}
          </p>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071E3] text-[10px] font-semibold">
          {activeBookings.length === 1 ? "1 programado" : `${activeBookings.length} programados`}
        </span>
      </div>

      {/* 2. Limpiezas Completadas */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-5 border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between text-center space-y-2.5 transition-all hover:shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Historial
          </span>
          <p className="text-3xl font-black text-slate-950 tracking-tight">
            {completedBookings.length}
          </p>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
          {totalHours} hs de servicio
        </span>
      </div>

      {/* 3. Direcciones Registradas */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-5 border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between text-center space-y-2.5 transition-all hover:shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Ubicaciones
          </span>
          <p className="text-3xl font-black text-slate-950 tracking-tight">
            {savedAddressesCount}
          </p>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold">
          Puntos GPS guardados
        </span>
      </div>

      {/* 4. Garantía 100% Protegida */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-5 border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between text-center space-y-2.5 transition-all hover:shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Garantía
          </span>
          <p className="text-3xl font-black text-slate-950 tracking-tight">
            100%
          </p>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold">
          Cobertura IPS & Calidad
        </span>
      </div>
    </div>
  );
}
