"use client";

import React from "react";
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  FileText, 
  Save, 
  CheckCircle2, 
  RefreshCw
} from "lucide-react";
import { User } from "@/types";

interface ProfileTabProps {
  userProfile: User | null;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  ruc: string;
  setRuc: (v: string) => void;
  taxName: string;
  setTaxName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  noticeMessage: string | null;
}

export default function ProfileTab({
  userProfile,
  name,
  setName,
  phone,
  setPhone,
  address,
  setAddress,
  ruc,
  setRuc,
  taxName,
  setTaxName,
  onSubmit,
  isSaving,
  noticeMessage,
}: ProfileTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      
      <div>
        <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">
          Mi Cuenta & Datos Fiscales
        </h2>
        <p className="text-xs text-slate-500">
          Actualiza tus datos de contacto y la información para comprobantes legales KUDE.
        </p>
      </div>

      {noticeMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{noticeMessage}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS PERSONALES - Apple Style Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071E3] flex items-center justify-center font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">Datos de Contacto</h3>
              <p className="text-[11px] text-slate-400 font-medium">Coordinación directa de tus servicios</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nombre Completo *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Teléfono Celular / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                  placeholder="Ej: 0981 123 456"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo Electrónico (Asociado a tu cuenta)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={userProfile?.email || ""}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dirección Predeterminada
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                  placeholder="Ej: Av. Santa Teresa 1827 c/ Aviadores del Chaco"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS FISCALES Y FACTURACIÓN */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">Datos Fiscales para Factura Legal KUDE</h3>
              <p className="text-[11px] text-slate-400 font-medium">Deducción de IVA / IRP ante DNIT Paraguay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                RUC (con Dígito Verificador)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
                  placeholder="Ej: 80012345-6 o 4123456-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Razón Social / Nombre en Factura
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
                  placeholder="Ej: Empresa S.A. o Nombre Personal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-7 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando Cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
