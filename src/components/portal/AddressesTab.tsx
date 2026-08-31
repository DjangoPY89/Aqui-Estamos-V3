"use client";

import React from "react";
import Link from "next/link";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Navigation,
  Star
} from "lucide-react";
import { SavedPortalAddress } from "./types";

interface AddressesTabProps {
  addresses: SavedPortalAddress[];
  onOpenAddModal?: () => void;
  onOpenEditModal?: (addr: SavedPortalAddress) => void;
  onSetDefault: (addr: SavedPortalAddress) => void;
  onDelete: (id: string, label: string) => void;
  noticeMessage: string | null;
}

export default function AddressesTab({
  addresses,
  onOpenAddModal,
  onOpenEditModal,
  onSetDefault,
  onDelete,
  noticeMessage,
}: AddressesTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in">
      
      {/* Header con botón para registrar nueva dirección */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            Mis Ubicaciones Guardadas ({addresses.length})
          </h2>
          <p className="text-xs text-slate-500">
            Administra los domicilios exactos fijados con GPS para tus servicios de limpieza.
          </p>
        </div>

        <Link
          href="/portal/direcciones/nueva"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nueva Ubicación</span>
        </Link>
      </div>

      {/* Aviso de feedback */}
      {noticeMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{noticeMessage}</span>
        </div>
      )}

      {/* Grid de Direcciones Guardadas */}
      {addresses.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-8 sm:p-12 border border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0071E3] flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-black text-slate-950">No tienes direcciones guardadas</h3>
            <p className="text-xs text-slate-500">
              Registra tu casa, oficina o departamento con el mapa GPS para acelerar tus próximas reservas.
            </p>
          </div>
          <Link
            href="/portal/direcciones/nueva"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar mi primera dirección</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white/90 backdrop-blur-xl rounded-[28px] p-6 border transition-all space-y-4 flex flex-col justify-between ${
                addr.isDefault
                  ? "border-[#0071E3]/40 shadow-sm"
                  : "border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md"
              }`}
            >
              <div className="space-y-3">
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      addr.isDefault ? "bg-[#0071E3] text-white" : "bg-slate-100 text-slate-700"
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-950">
                      {addr.label}
                    </h3>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0071E3] text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-[#0071E3] text-[#0071E3]" />
                      <span>Principal</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetDefault(addr)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-[#0071E3] transition-colors cursor-pointer"
                    >
                      Hacer Principal
                    </button>
                  )}
                </div>

                {/* Dirección Escrita y Detalles Separados */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Dirección
                    </span>
                    <p className="font-semibold text-slate-900 leading-snug text-sm">
                      {addr.address}
                    </p>
                  </div>
                  
                  {(addr.apartment || addr.reference) && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {addr.apartment ? <span className="font-semibold text-slate-700">Depto/Piso: {addr.apartment} </span> : null}
                      {addr.apartment && addr.reference ? "• " : ""}
                      {addr.reference ? <span>Ref: {addr.reference}</span> : null}
                    </p>
                  )}

                  {/* Ubicación GPS Separada */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {addr.latitude && addr.longitude ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/50 rounded-full text-[11px] font-mono font-semibold">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span>GPS: {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}</span>
                      </span>
                    ) : null}

                    {addr.zone && (
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold">
                        {addr.zone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                {addr.latitude && addr.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071E3] hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Ver en Google Maps</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Sin GPS asignado</span>
                )}

                <div className="flex items-center gap-1">
                  <Link
                    href={`/portal/direcciones/nueva?edit=${encodeURIComponent(addr.id)}`}
                    className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 cursor-pointer inline-flex items-center justify-center"
                    title="Editar detalles o mover pin"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDelete(addr.id, addr.label)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50 cursor-pointer"
                    title="Eliminar dirección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
