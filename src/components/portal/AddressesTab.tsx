"use client";

import React from "react";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Home, 
  Building, 
  Compass, 
  Navigation,
  ExternalLink,
  Star
} from "lucide-react";
import { SavedPortalAddress } from "./types";

interface AddressesTabProps {
  addresses: SavedPortalAddress[];
  onOpenAddModal: () => void;
  onOpenEditModal: (addr: SavedPortalAddress) => void;
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
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Mis Ubicaciones y Direcciones Guardadas ({addresses.length})
          </h2>
          <p className="text-xs text-slate-500">
            Administra los domicilios exactos fijados con GPS para tus servicios de limpieza.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-electric-600 hover:bg-electric-500 text-white text-xs font-extrabold rounded-2xl shadow-electric transition-all active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nueva Dirección</span>
        </button>
      </div>

      {/* Aviso de feedback */}
      {noticeMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{noticeMessage}</span>
        </div>
      )}

      {/* Grid de Direcciones Guardadas */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-black text-slate-900">No tienes direcciones guardadas</h3>
            <p className="text-xs text-slate-500">
              Registra tu casa, oficina o departamento con el mapa GPS para acelerar tus próximas reservas.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-electric-600 hover:bg-electric-500 text-white text-xs font-extrabold rounded-2xl shadow-electric transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar mi primera dirección</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 flex flex-col justify-between ${
                addr.isDefault
                  ? "border-electric-500 ring-2 ring-electric-500/20 shadow-md"
                  : "border-slate-200/80 shadow-xs hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      addr.isDefault ? "bg-electric-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {addr.label}
                    </h3>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-electric-50 border border-electric-200 text-electric-700 text-[10px] font-black">
                      <Star className="w-3 h-3 fill-electric-600 text-electric-600" />
                      <span>Principal</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetDefault(addr)}
                      className="text-[11px] font-bold text-slate-400 hover:text-electric-600 transition-colors"
                    >
                      Hacer Principal
                    </button>
                  )}
                </div>

                {/* Dirección Escrita y Detalles Separados */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Dirección Escrita
                    </span>
                    <p className="font-bold text-slate-900 leading-snug text-sm">
                      {addr.address}
                    </p>
                  </div>
                  
                  {(addr.apartment || addr.reference) && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {addr.apartment ? <span className="font-semibold text-slate-700">Depto/Piso: {addr.apartment} </span> : null}
                      {addr.apartment && addr.reference ? "• " : ""}
                      {addr.reference ? <span>Ref: {addr.reference}</span> : null}
                    </p>
                  )}

                  {/* Ubicación GPS Separada */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {addr.latitude && addr.longitude ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-mono font-bold">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span>GPS: {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}</span>
                      </span>
                    ) : null}

                    {addr.zone && (
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
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
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-electric-600 hover:text-electric-700 hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Abrir en Google Maps</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Sin GPS asignado</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(addr)}
                    className="p-1.5 text-slate-400 hover:text-electric-600 transition-colors rounded-lg hover:bg-slate-50"
                    title="Editar detalles o mover pin"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(addr.id, addr.label)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
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
