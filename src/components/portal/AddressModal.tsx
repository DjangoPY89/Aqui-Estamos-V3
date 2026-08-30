"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  X, 
  Compass, 
  Save
} from "lucide-react";
import { PORTAL_ZONES } from "./types";

const GoogleMapPicker = dynamic(() => import("@/components/booking/GoogleMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs animate-pulse font-medium">
      Cargando Mapa...
    </div>
  ),
});

interface AddressModalProps {
  isOpen: boolean;
  isEditing: boolean;
  label: string;
  setLabel: (v: string) => void;
  zone: string;
  setZone: (v: string) => void;
  street: string;
  setStreet: (v: string) => void;
  apartment: string;
  setApartment: (v: string) => void;
  reference: string;
  setReference: (v: string) => void;
  lat: number;
  setLat: (v: number) => void;
  lng: number;
  setLng: (v: number) => void;
  isDefault: boolean;
  setIsDefault: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddressModal({
  isOpen,
  isEditing,
  label,
  setLabel,
  zone,
  setZone,
  street,
  setStreet,
  apartment,
  setApartment,
  reference,
  setReference,
  lat,
  setLat,
  lng,
  setLng,
  isDefault,
  setIsDefault,
  onSubmit,
  onClose,
}: AddressModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleZoneChange = (zoneName: string) => {
    setZone(zoneName);
    const found = PORTAL_ZONES.find((z) => z.name === zoneName);
    if (found) {
      setLat(found.lat);
      setLng(found.lng);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white/95 backdrop-blur-2xl rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/60 relative my-6 space-y-6"
      >
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0071E3] rounded-full text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{isEditing ? "Editar Ubicación" : "Registrar Nueva Ubicación"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {isEditing ? "Modificar Dirección y GPS" : "Detalles de Ubicación y Mapa GPS"}
          </h2>
          <p className="text-xs text-slate-500">
            Asegura la llegada puntual de la cuadrilla indicando la ubicación exacta.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Etiqueta de la Dirección */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipo de Lugar *
              </label>
              <div className="flex gap-2">
                {["Casa", "Oficina", "Depto"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLabel(t)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                      label === t
                        ? "bg-[#0071E3] text-white border-[#0071E3] shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej: Casa Quinta / Depto 4B"
                className="mt-2 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
              />
            </div>

            {/* Zona / Ciudad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Zona de Cobertura *
              </label>
              <select
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
              >
                {PORTAL_ZONES.map((z) => (
                  <option key={z.name} value={z.name}>
                    {z.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">El mapa se centrará automáticamente al seleccionar.</p>
            </div>

            {/* Campo Dirección Completa */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dirección Escrita *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Ej: Avda. Santa Teresa 2250 c/ Herminio Maldonado"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
              />
            </div>

            {/* Piso / Depto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Piso / N° Depto (Opcional)
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Ej: Torre 2, Piso 8, Depto 802"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
              />
            </div>

            {/* Referencia */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Referencias de Acceso (Opcional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej: Portón negro al lado de la farmacia"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Ubicación GPS Separada con Mapa Interactivo */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#0071E3]" />
                <span>Ubicación GPS (Mueve el Pin al punto exacto):</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                GPS: {lat ? Number(lat).toFixed(4) : "-"}, {lng ? Number(lng).toFixed(4) : "-"}
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <GoogleMapPicker
                latitude={lat}
                longitude={lng}
                currentAddress={street}
                onLocationChange={(selected) => {
                  setLat(selected.lat);
                  setLng(selected.lng);
                }}
              />
            </div>
          </div>

          {/* Checkbox de Dirección Principal */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-[#0071E3] rounded-md focus:ring-[#0071E3]"
              />
              <span className="text-xs font-semibold text-slate-700">
                Guardar como mi dirección principal para futuras reservas
              </span>
            </label>
          </div>

          {/* Botones de Envío */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? "Guardar Cambios" : "Guardar Ubicación"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-all active:scale-98 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
