"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Plus, CheckCircle2, ChevronRight } from "lucide-react";
import { User } from "@/types";

interface PortalHeaderProps {
  user: User | null;
  userName: string;
  userEmail: string;
  activeCount: number;
}

export default function PortalHeader({ user, userName, userEmail, activeCount }: PortalHeaderProps) {
  const displayName = userName || user?.name || "Cliente";
  const displayEmail = userEmail || user?.email || "";

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 lg:p-9 border border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Información del Usuario y Saludo Apple Style */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-xs" title="Personal con seguro de IPS Activo">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-[11px] font-semibold tracking-wide border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Portal de Clientes VIP</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              ¡Hola, {displayName}!
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{displayEmail}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Personal con Seguro IPS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas en Píldoras Apple */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Link
            href="/reservar"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Reservar Nueva Limpieza</span>
          </Link>

          <Link
            href="/preguntas-frecuentes"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-full transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Centro de Ayuda</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

      </div>
    </div>
  );
}
