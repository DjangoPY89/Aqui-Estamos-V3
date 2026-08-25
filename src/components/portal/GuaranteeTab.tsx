"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Award, 
  RotateCcw, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  HeartHandshake, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function GuaranteeTab() {
  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      
      {/* Tarjeta Principal de Garantía de Calidad 100% */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">Compromiso Inquebrantable</span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Garantía de Satisfacción 100% o Re-Limpieza Gratuita
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
          En <strong>Aquí Estamos</strong> nos tomamos la excelencia con absoluta seriedad. Si algún rincón o detalle de tu servicio no cumple con tus expectativas, comunícanoslo dentro de las primeras 24 horas y enviaremos a una profesional a corregirlo sin costo adicional.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Respaldo IPS Formal</span>
            </div>
            <p className="text-slate-400 text-[11px]">Personal 100% asegurado en IPS sin riesgos laborales para ti.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <RotateCcw className="w-4 h-4" />
              <span>Re-Limpieza en 24h</span>
            </div>
            <p className="text-slate-400 text-[11px]">Corrección inmediata y prioritaria si algo no quedó perfecto.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
              <span>Atención Directa</span>
            </div>
            <p className="text-slate-400 text-[11px]">Canal de WhatsApp exclusivo con respuesta en menos de 15 min.</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href="https://wa.me/595981000000?text=Hola%20Aqu%C3%AD%20Estamos,%20necesito%20asistencia%20con%20mi%20servicio%20de%20limpieza."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contactar a Soporte por WhatsApp</span>
          </a>

          <Link
            href="/politica-calidad"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/15 transition-all"
          >
            <span>Ver Política de Calidad Oficial</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

    </div>
  );
}
