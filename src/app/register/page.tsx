"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Lock, Mail, User as UserIcon, Phone, MapPin, AlertCircle, Navigation, Map } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const GoogleMapPicker = dynamic(() => import("@/components/booking/GoogleMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-56 bg-neutral-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-medium">
      Cargando Mapa Satelital...
    </div>
  ),
});

function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [latitude, setLatitude] = useState(-25.2831);
  const [longitude, setLongitude] = useState(-57.5612);
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización GPS.");
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocationSuccess(true);
        setShowMap(true);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg("No se pudo obtener tu ubicación automática. Puedes escribir tu dirección o seleccionarla en el mapa.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationChange = (coords: { lat: number; lng: number; addressSuggestion?: string }) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setLocationSuccess(true);
    if (coords.addressSuggestion && (!formData.address || formData.address.length < 5)) {
      setFormData((prev) => ({ ...prev, address: coords.addressSuggestion! }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg("Nombre, correo y contraseña son obligatorios.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la cuenta");
      }

      // Guardar dirección en LocalStorage para disponibilidad inmediata
      if (formData.address) {
        try {
          const initialAddress = {
            id: `addr_init_${Date.now()}`,
            label: "🏠 Domicilio Principal",
            address: formData.address.trim(),
            latitude,
            longitude,
            isDefault: true,
          };
          localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify([initialAddress]));
        } catch (e) {}
      }

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (loginRes?.error) {
        window.location.href = `/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`;
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrarse.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-neutral-50 via-white to-electric-50/20 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-block mb-4 transition-transform hover:scale-105">
          <div className="relative h-11 w-48 mx-auto">
            <Image
              src="/images/logo.svg"
              alt="Aquí Estamos Limpieza"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Crear tu Cuenta
        </h1>
        <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
          Regístrate para reservar turnos de limpieza online y gestionar tus servicios.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-xl py-7 px-6 sm:px-8 rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botón Oficial Google */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <GoogleSignInButton
                callbackUrl={callbackUrl}
                onError={(err) => setErrorMsg(err)}
                text="Registrarse con Google"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                o completa tus datos
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>
          </div>

          {/* Formulario de Registro */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Nombre Completo *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: María Benítez"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="maria@ejemplo.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Contraseña (Mín. 6 caracteres) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Teléfono / WhatsApp */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Teléfono / WhatsApp *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: 0981 123 456"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Dirección del Domicilio */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-700">Dirección del Domicilio *</label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="text-[11px] text-electric-600 hover:text-electric-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                  <span>{isLocating ? "Detectando..." : "📍 Usar GPS actual"}</span>
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Av. Santa Teresa 1827 c/ Aviadores, Asunción"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Botón y Sección de Mapa de Ubicación */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  locationSuccess
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-800"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5 text-electric-600" />
                  <span>{locationSuccess ? "✓ Ubicación GPS seleccionada" : "Fijar ubicación exacta en el mapa"}</span>
                </span>
                <span className="text-[10px] text-electric-600 underline">
                  {showMap ? "Ocultar Mapa" : "Abrir Mapa"}
                </span>
              </button>

              {showMap && (
                <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
                  <GoogleMapPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={handleLocationChange}
                    currentAddress={formData.address}
                  />
                  <p className="text-[10px] text-neutral-500 text-center">
                    Mueve el mapa o el pin para ubicar tu casa o departamento con precisión.
                  </p>
                </div>
              )}
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric-sm transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isLoading ? "Creando tu cuenta..." : "Crear Cuenta y Continuar"}
            </button>
          </form>

          <div className="text-center text-xs text-neutral-500 pt-3 border-t border-neutral-100">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-semibold text-electric-600 hover:text-electric-700 hover:underline"
            >
              Iniciar Sesión
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-xs text-neutral-500">
          Cargando registro...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
