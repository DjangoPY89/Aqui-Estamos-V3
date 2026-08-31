"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  X, 
  ArrowLeft,
  Compass, 
  Save,
  Home,
  Briefcase,
  Building2,
  CheckCircle2,
  Navigation
} from "lucide-react";
import { PORTAL_ZONES } from "./types";

const GoogleMapPicker = dynamic(() => import("@/components/booking/GoogleMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs animate-pulse font-medium">
      Cargando Mapa Interactivo...
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Al abrirse, desplazar la pantalla completa al tope superior absoluto
  useEffect(() => {
    if (isOpen) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }
  }, [isOpen]);

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
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#F8FAFC] overflow-y-auto flex flex-col min-h-[100dvh] animate-in fade-in duration-200"
    >
      
      {/* 1. Barra de Navegación Superior Fija (Header Fullscreen) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          
          {/* Botón Volver / Cancelar */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Volver</span>
          </button>

          {/* Título Central */}
          <div className="text-center flex-1 pr-2 sm:pr-0">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0071E3] uppercase tracking-wider">
              <MapPin className="w-3 h-3" />
              <span>{isEditing ? "Modificar Ubicación" : "Nueva Dirección"}</span>
            </div>
            <h1 className="text-sm sm:text-lg font-black text-slate-950 truncate">
              {isEditing ? "Editar Dirección y GPS" : "Registrar Dirección y Ubicación GPS"}
            </h1>
          </div>

          {/* Botón Guardar Superior (Desktop y Mobile Rápido) */}
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
        </div>
      </header>

      {/* 2. Cuerpo Central a Pantalla Completa */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Banner Informativo */}
        <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-blue-950">
          <div className="w-8 h-8 rounded-xl bg-[#0071E3] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-blue-950 mb-0.5">
              Dirección Exacta para Servicios de Limpieza
            </h3>
            <p className="text-blue-800 leading-relaxed text-[11px] sm:text-xs">
              Indica los detalles del inmueble y fija el punto en el mapa interactivo. Esto asegura la puntualidad de la cuadrilla y habilita la cotización exacta para tus reservas.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* TARJETA 1: IDENTIFICACIÓN Y ZONA */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-black text-slate-950">
                1. Tipo de Lugar y Zona de Cobertura
              </h2>
              <p className="text-xs text-slate-500">
                Identifica tu inmueble y la ciudad correspondiente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Tipo de Lugar */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tipo de Inmueble *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Casa", icon: Home, labelText: "Casa" },
                    { id: "Oficina", icon: Briefcase, labelText: "Oficina" },
                    { id: "Depto", icon: Building2, labelText: "Depto" },
                  ].map(({ id, icon: Icon, labelText }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLabel(id)}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                        label === id
                          ? "bg-[#0071E3] text-white border-[#0071E3] shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{labelText}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre / Alias */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Nombre o Alias de la Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ej: Casa Quinta / Depto 4B / Oficina Central"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                />
              </div>

              {/* Zona de Cobertura */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Zona / Ciudad de Cobertura *
                </label>
                <select
                  value={zone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                >
                  {PORTAL_ZONES.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  💡 Al cambiar de zona, el mapa GPS inferior se centrará de forma automática.
                </p>
              </div>

            </div>
          </div>

          {/* TARJETA 2: DIRECCIÓN ESCRITA Y ACCESO */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-black text-slate-950">
                2. Domicilio Detallado y Referencias
              </h2>
              <p className="text-xs text-slate-500">
                Escribe la dirección exacta para la ruta del vehículo de cuadrilla.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Dirección Escrita */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Dirección Escrita (Calle y Altura / Número) *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ej: Avda. Santa Teresa 2250 c/ Herminio Maldonado"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                />
              </div>

              {/* Piso / Depto */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Piso / N° Depto / Bloque (Opcional)
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Ej: Torre 2, Piso 8, Depto 802"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                />
              </div>

              {/* Referencia de Acceso */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Referencias de Acceso (Opcional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej: Portón negro al lado de la farmacia, timbre 8B"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:outline-none transition-all"
                />
              </div>

            </div>
          </div>

          {/* TARJETA 3: MAPA GPS INTERACTIVO (GOOGLE MAPS) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-950 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#0071E3]" />
                  <span>3. Ubicación GPS Satelital (Google Maps)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Arrastra el pin rojo o pulsa en el mapa sobre la entrada del inmueble.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                📍 {lat ? Number(lat).toFixed(4) : "-"}, {lng ? Number(lng).toFixed(4) : "-"}
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

          {/* TARJETA 4: PREFERENCIAS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-5 h-5 text-[#0071E3] rounded-lg focus:ring-[#0071E3] cursor-pointer"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  Establecer como mi dirección principal
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 block">
                  Esta dirección se pre-seleccionará automáticamente al agendar nuevos servicios.
                </span>
              </div>
            </label>
          </div>

          {/* ESPACIO INFERIOR PARA QUE LA BARRA FIJA NO TAPE EL CONTENIDO */}
          <div className="h-16" />

        </form>

      </main>

      {/* 3. Barra Inferior Fija de Guardado (Footer Fullscreen) */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-lg py-3.5 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 w-full">
          
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-6 rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 sm:flex-none py-3 px-8 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? "Guardar Cambios de Ubicación" : "Guardar Nueva Ubicación"}</span>
          </button>

        </div>
      </footer>

    </div>
  );
}
