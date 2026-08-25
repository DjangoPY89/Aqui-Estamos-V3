"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowRight, Plus, User as UserIcon, Calendar, CheckCircle2 } from "lucide-react";
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
    <div className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-9 border border-white/80 shadow-[0_14px_45px_rgba(0,82,255,0.06),0_4px_16px_rgba(15,23,42,0.04)] transition-all">
      
      {/* Reflejos de Luz y Gradientes de Vidrio Translúcido (Glassmorphism) */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-gradient-to-br from-electric-200/40 via-cyan-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-16 w-72 h-72 bg-gradient-to-tr from-brand-100/40 via-electric-50/50 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/90 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Información del Usuario y Saludo */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-electric-600 via-electric-500 to-cyan-400 p-0.5 shadow-lg shadow-electric-600/15">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-inner">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-xs" title="Cuenta Verificada con Cobertura IPS">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-50/90 backdrop-blur-md text-electric-700 text-xs font-black border border-electric-200/70 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-electric-600 animate-pulse" />
              <span>Portal de Clientes VIP</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-800 to-electric-600">{displayName}</span>! 👋
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="font-semibold text-slate-800">{displayEmail}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Personal IPS Activo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link
            href="/reservar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-electric-600 hover:bg-electric-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-electric transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-electric-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Reservar Nueva Limpieza</span>
          </Link>

          <Link
            href="/preguntas-frecuentes"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200/80 backdrop-blur-md transition-all shadow-xs active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-electric-600" />
            <span>Centro de Ayuda</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
