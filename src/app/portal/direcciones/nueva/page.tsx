"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  MapPin, 
  ArrowLeft, 
  Save, 
  Home, 
  Briefcase, 
  Building2, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Navigation,
  Sparkles
} from "lucide-react";
import { PORTAL_ZONES, SavedPortalAddress } from "@/components/portal/types";

// Cargar GoogleMapPicker dinámicamente sin SSR para Leaflet
const GoogleMapPicker = dynamic(() => import("@/components/booking/GoogleMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-72 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs animate-pulse font-medium gap-2">
      <RefreshCw className="w-5 h-5 animate-spin text-[#0071E3]" />
      <span>Cargando Google Maps Interactivo...</span>
    </div>
  ),
});

function NuevaDireccionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const { data: session, status } = useSession();

  // Estados del Formulario
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState("Casa");
  const [zone, setZone] = useState(PORTAL_ZONES[0].name);
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [reference, setReference] = useState("");
  const [lat, setLat] = useState(PORTAL_ZONES[0].lat);
  const [lng, setLng] = useState(PORTAL_ZONES[0].lng);
  const [isDefault, setIsDefault] = useState(false);

  // Estados de interfaz
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const handleDetectGPS = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMsg("Tu navegador o dispositivo no soporta geolocalización GPS.");
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setIsLocatingGPS(false);
      },
      (err) => {
        setIsLocatingGPS(false);
        setErrorMsg("No se pudo obtener la señal GPS precisa. Por favor, toca tu ubicación en el mapa interactivo.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      const returnUrl = editId 
        ? `/portal/direcciones/nueva?edit=${encodeURIComponent(editId)}`
        : `/portal/direcciones/nueva`;
      window.location.href = `/login?callbackUrl=${encodeURIComponent(returnUrl)}`;
    }
  }, [status, editId]);

  // Si viene en modo edición (?edit=id), cargar datos existentes
  useEffect(() => {
    if (editId && session?.user?.email) {
      setIsLoadingExisting(true);
      setIsEditing(true);
      const userEmail = session.user.email.toLowerCase().trim();
      try {
        const local = localStorage.getItem(`aquiestamos_saved_addresses_${userEmail}`);
        if (local) {
          const addresses: SavedPortalAddress[] = JSON.parse(local);
          const found = addresses.find((a) => a.id === editId);
          if (found) {
            setLabel(found.label || "Casa");
            setZone(found.zone || PORTAL_ZONES[0].name);
            setStreet(found.street || found.address || "");
            setApartment(found.apartment || "");
            setReference(found.reference || "");
            if (found.latitude && found.longitude) {
              setLat(found.latitude);
              setLng(found.longitude);
            }
            setIsDefault(Boolean(found.isDefault));
          }
        }
      } catch (err) {
        console.error("Error al cargar dirección para editar:", err);
      } finally {
        setIsLoadingExisting(false);
      }
    }
  }, [editId, session]);

  // Manejo de cambio de zona
  const handleZoneChange = (zoneName: string) => {
    setZone(zoneName);
    const found = PORTAL_ZONES.find((z) => z.name === zoneName);
    if (found) {
      setLat(found.lat);
      setLng(found.lng);
    }
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanStreet = street.trim();
    if (!cleanStreet) {
      setErrorMsg("Por favor, ingresa la dirección escrita (calle y número).");
      return;
    }

    setIsSubmitting(true);
    const userEmail = session?.user?.email?.toLowerCase().trim();

    try {
      let savedAddresses: SavedPortalAddress[] = [];
      if (userEmail) {
        try {
          const local = localStorage.getItem(`aquiestamos_saved_addresses_${userEmail}`);
          if (local) {
            savedAddresses = JSON.parse(local);
          }
        } catch (e) {}
      }

      if (isEditing && editId) {
        // Actualizar existente
        savedAddresses = savedAddresses.map((a) => {
          if (a.id === editId) {
            return {
              ...a,
              label: label.trim() || "Casa",
              address: cleanStreet,
              street: cleanStreet,
              apartment: apartment.trim(),
              reference: reference.trim(),
              zone: zone,
              latitude: lat,
              longitude: lng,
              isDefault: isDefault,
            };
          }
          return isDefault ? { ...a, isDefault: false } : a;
        });
      } else {
        // Crear nueva
        const newAddress: SavedPortalAddress = {
          id: `addr_${Date.now()}`,
          label: label.trim() || "Casa",
          address: cleanStreet,
          street: cleanStreet,
          apartment: apartment.trim(),
          reference: reference.trim(),
          zone: zone,
          latitude: lat,
          longitude: lng,
          isDefault: isDefault || savedAddresses.length === 0,
        };

        if (isDefault || savedAddresses.length === 0) {
          savedAddresses = [newAddress, ...savedAddresses.map((a) => ({ ...a, isDefault: false }))];
        } else {
          savedAddresses = [newAddress, ...savedAddresses];
        }
      }

      // Guardar en localStorage
      if (userEmail) {
        localStorage.setItem(`aquiestamos_saved_addresses_${userEmail}`, JSON.stringify(savedAddresses));
      }

      // Si es principal o la primera, actualizar perfil en backend
      if (isDefault || savedAddresses.length === 1) {
        try {
          await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: cleanStreet,
              latitude: lat,
              longitude: lng,
            }),
          });
        } catch (e) {
          console.error("Error al actualizar perfil:", e);
        }
      }

      setSuccessMsg(isEditing ? "¡Dirección actualizada correctamente!" : "¡Dirección guardada exitosamente!");
      
      // Redirigir al portal a la pestaña de Direcciones
      setTimeout(() => {
        router.push("/portal?tab=ADDRESSES");
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al guardar la dirección.");
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoadingExisting) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4 p-6">
        <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center border border-slate-200/60">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0071E3]" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Cargando datos de ubicación...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12 border-b border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Barra Superior de Navegación & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/portal?tab=ADDRESSES"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0071E3] transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs group-hover:border-blue-300 group-hover:bg-blue-50/50 transition-all">
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-[#0071E3] transition-colors" />
            </div>
            <span>Volver a Mis Direcciones</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0071E3] border border-blue-200/60 rounded-full text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isEditing ? "Modo Edición" : "Nueva Ubicación"}</span>
            </span>
          </div>
        </div>

        {/* Encabezado Principal */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white flex items-center justify-center shadow-md shrink-0">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {isEditing ? "Editar Dirección y Coordenadas GPS" : "Registrar Nueva Dirección"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Fija tu domicilio y coordenadas satelitales para acelerar tus próximas reservas de limpieza.
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de Éxito */}
        {successMsg && (
          <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{successMsg}</p>
              <p className="text-xs text-emerald-700">Redirigiendo al Portal de Cliente...</p>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Atención</p>
              <p className="text-xs text-rose-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Formulario Principal de Registro */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECCIÓN 1: IDENTIFICACIÓN Y TIPO */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                01
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-950">
                  Tipo de Lugar y Nombre
                </h2>
                <p className="text-xs text-slate-500">
                  Identifica fácilmente este lugar en tu cuenta para seleccionarlo al reservar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Selector de Tipo */}
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
                      className={`py-3 px-3 text-xs font-bold rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                        label === id
                          ? "bg-[#0071E3] text-white border-[#0071E3] shadow-xs scale-102"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{labelText}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre o Alias */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Nombre o Alias de la Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ej: Casa Familiar / Oficina Central / Depto 4B"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:border-[#0071E3] focus:outline-none transition-all"
                />
              </div>

              {/* Zona / Ciudad de Cobertura */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Zona / Ciudad de Cobertura *
                </label>
                <select
                  value={zone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:border-[#0071E3] focus:outline-none transition-all cursor-pointer"
                >
                  {PORTAL_ZONES.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#0071E3]" />
                  <span>Al seleccionar una zona, el mapa satelital inferior se orientará automáticamente.</span>
                </p>
              </div>

            </div>
          </div>

          {/* SECCIÓN 2: DIRECCIÓN ESCRITA Y DETALLES */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                02
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-950">
                  Domicilio Detallado y Referencias de Acceso
                </h2>
                <p className="text-xs text-slate-500">
                  Escribe la dirección exacta para la llegada puntual del vehículo de cuadrilla.
                </p>
              </div>
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:border-[#0071E3] focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:border-[#0071E3] focus:outline-none transition-all"
                />
              </div>

              {/* Referencia */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Referencias de Acceso (Opcional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej: Portón negro al lado de la farmacia, timbre 8B"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0071E3] focus:border-[#0071E3] focus:outline-none transition-all"
                />
              </div>

            </div>
          </div>

          {/* SECCIÓN 3: MAPA GPS SATELITAL */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  03
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-950 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#0071E3]" />
                    <span>Ubicación GPS Satelital (Google Maps)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Arrastra el pin rojo o pulsa en el mapa exactamente sobre el portón de entrada.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocatingGPS}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0071E3] font-bold text-xs rounded-full border border-blue-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Detectar coordenadas exactas de mi dispositivo por GPS"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocatingGPS ? "animate-spin text-[#0071E3]" : ""}`} />
                  <span>{isLocatingGPS ? "Obteniendo GPS..." : "Mi GPS Actual"}</span>
                </button>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  📍 {lat ? Number(lat).toFixed(4) : "-"}, {lng ? Number(lng).toFixed(4) : "-"}
                </span>
              </div>
            </div>

            {/* Componente GoogleMapPicker */}
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

          {/* SECCIÓN 4: PREFERENCIA PRINCIPAL */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <label className="flex items-start sm:items-center gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-5 h-5 mt-0.5 sm:mt-0 text-[#0071E3] rounded-lg focus:ring-[#0071E3] cursor-pointer"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  Establecer como mi dirección principal
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 block">
                  Esta dirección se pre-seleccionará de forma predeterminada al realizar tus próximas reservas.
                </span>
              </div>
            </label>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <Link
              href="/portal?tab=ADDRESSES"
              className="w-full sm:w-auto py-3.5 px-6 rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all text-center"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto py-3.5 px-8 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-full font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando Ubicación...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? "Guardar Cambios de Ubicación" : "Guardar Nueva Ubicación"}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function NuevaDireccionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4 p-6">
        <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center border border-slate-200/60">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0071E3]" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Cargando...</p>
      </div>
    }>
      <NuevaDireccionContent />
    </Suspense>
  );
}
