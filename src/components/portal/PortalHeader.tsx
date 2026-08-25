"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowRight, Plus, User as UserIcon, Calendar } from "lucide-react";
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
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-neutral-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-2xl">
      {/* Luces de Fondo y Decoración Brand */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-electric-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Información del Usuario y Saludo */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-electric-600 to-cyan-400 p-0.5 shadow-lg shadow-electric-600/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black text-xl sm:text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-950 shadow-xs" title="Cuenta Verificada">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-electric-300 text-xs font-bold border border-white/15">
              <span className="w-2 h-2 rounded-full bg-electric-400 animate-pulse" />
              <span>Portal de Clientes VIP</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-electric-300">{displayName}</span>! 👋
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 font-medium truncate max-w-md">
              {displayEmail} • Personal IPS Asegurado • Asunción & Gran Asunción
            </p>
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
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-white/15 backdrop-blur-md transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-electric-400" />
            <span>Centro de Ayuda</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
