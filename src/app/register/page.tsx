"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Navigation, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Layers
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const GoogleMapPicker = dynamic(() => import("@/components/booking/GoogleMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-neutral-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-medium">
      Cargando Mapa Satelital...
    </div>
  ),
});

const ADDRESS_TYPES = [
  { id: "casa", label: "🏠 Casa", value: "Casa" },
  { id: "depto", label: "🏢 Depto", value: "Departamento" },
  { id: "oficina", label: "💼 Oficina", value: "Oficina" },
  { id: "otro", label: "✨ Otro", value: "Domicilio" },
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";

  // Control de Pasos (1: Datos Personales, 2: Dirección Detallada)
  const [step, setStep] = useState<1 | 2>(1);

  // Paso 1: Datos de la Cuenta
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // Paso 2: Dirección Detallada para el Servicio
  const [addressType, setAddressType] = useState("Casa");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressApt, setAddressApt] = useState("");
  const [addressNotes, setAddressNotes] = useState("");

  const [latitude, setLatitude] = useState(-25.2831);
  const [longitude, setLongitude] = useState(-57.5612);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validar y pasar al Paso 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!accountData.name.trim()) {
      setErrorMsg("Por favor, ingresa tu nombre completo.");
      return;
    }

    if (!accountData.email.trim() || !accountData.email.includes("@")) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    if (!accountData.password || accountData.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!accountData.phone.trim() || accountData.phone.trim().length < 6) {
      setErrorMsg("Por favor, ingresa un número de teléfono o WhatsApp de contacto.");
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Geolocalización GPS en el paso 2
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
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg("No se pudo obtener tu ubicación automática. Puedes escribir tu dirección o fijar el pin en el mapa.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationChange = (coords: { lat: number; lng: number; addressSuggestion?: string }) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setLocationSuccess(true);
    if (coords.addressSuggestion && (!addressStreet || addressStreet.length < 5)) {
      setAddressStreet(coords.addressSuggestion);
    }
  };

  // Envío final del registro completo (Paso 1 + Paso 2)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!addressStreet.trim()) {
      setErrorMsg("Por favor, ingresa la dirección exacta (calle y número o intersección).");
      return;
    }

    setIsLoading(true);

    const fullFormattedAddress = [
      addressStreet.trim(),
      addressApt.trim() ? `Piso/Depto: ${addressApt.trim()}` : "",
      addressNotes.trim() ? `Ref: ${addressNotes.trim()}` : "",
    ].filter(Boolean).join(" - ");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountData.name.trim(),
          email: accountData.email.trim().toLowerCase(),
          password: accountData.password,
          phone: accountData.phone.trim(),
          address: fullFormattedAddress,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la cuenta");
      }

      // Guardar dirección en LocalStorage para disponibilidad inmediata en reservas y portal
      try {
        const initialAddress = {
          id: `addr_init_${Date.now()}`,
          label: `${addressType} Principal`,
          address: fullFormattedAddress,
          street: addressStreet.trim(),
          apt: addressApt.trim(),
          notes: addressNotes.trim(),
          latitude,
          longitude,
          isDefault: true,
        };
        localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify([initialAddress]));
      } catch (e) {}

      // Iniciar sesión automáticamente
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: accountData.email.trim().toLowerCase(),
        password: accountData.password,
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
      
      {/* Encabezado con Logo y Título Dinámico según el Paso */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center px-4">
        <Link href="/" className="inline-flex items-center justify-center mb-3 transition-transform hover:scale-105">
          <div className="relative h-9 sm:h-10 w-32 sm:w-36 mx-auto flex items-center justify-center">
            <Image
              src="/images/logo.svg"
              alt="Aquí Estamos Limpieza"
              fill
              className="object-contain object-center"
              priority
            />
          </div>
        </Link>

        {step === 1 ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Crear tu Cuenta
            </h1>
            <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
              Regístrate para reservar turnos de limpieza online y gestionar tus servicios.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Registrar Nueva Dirección Detallada
            </h1>
            <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto">
              Ingresa los datos exactos y fija el pin en el mapa para ubicar la entrada
            </p>
          </>
        )}

        {/* Barra de Progreso de 2 Pasos */}
        <div className="mt-4 flex items-center justify-center gap-2 max-w-xs mx-auto">
          <div className="flex-1 flex items-center gap-1.5">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-electric-600" : "bg-neutral-200"}`} />
            <span className={`text-[10px] font-bold ${step === 1 ? "text-electric-600" : "text-neutral-500"}`}>
              1. Cuenta
            </span>
          </div>
          <div className="w-2 h-[1px] bg-neutral-300" />
          <div className="flex-1 flex items-center gap-1.5">
            <div className={`h-1.5 flex-1 rounded-full ${step === 2 ? "bg-electric-600" : "bg-neutral-200"}`} />
            <span className={`text-[10px] font-bold ${step === 2 ? "text-electric-600" : "text-neutral-400"}`}>
              2. Dirección
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor Principal de la Tarjeta */}
      <div className={`mt-5 sm:mx-auto sm:w-full px-4 sm:px-0 ${step === 1 ? "sm:max-w-md" : "sm:max-w-xl"}`}>
        <div className="bg-white/95 backdrop-blur-xl py-6 px-5 sm:px-8 rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 1: DATOS PERSONALES & DE LA CUENTA */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
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

              {/* Formulario Paso 1 */}
              <form onSubmit={handleProceedToStep2} className="space-y-3.5">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Nombre Completo *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={accountData.name}
                      onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                      placeholder="Ej: María Benítez"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-500/20 focus:border-electric-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      placeholder="maria@ejemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-500/20 focus:border-electric-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Contraseña (Mín. 6 caracteres) *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={accountData.password}
                      onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-500/20 focus:border-electric-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Teléfono / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                      placeholder="Ej: 0981 123 456"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-500/20 focus:border-electric-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Botón Siguiente */}
                <button
                  type="submit"
                  className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                >
                  <span>Continuar a Dirección del Servicio</span>
                  <ArrowRight className="w-4 h-4" />
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
          )}

          {/* ========================================================================= */}
          {/* PASO 2: REGISTRAR NUEVA DIRECCIÓN DETALLADA CON MAPA Y PIN */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Botón para regresar al Paso 1 */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modificar datos de cuenta ({accountData.name})</span>
              </button>

              <form onSubmit={handleFinalSubmit} className="space-y-3.5">
                
                {/* Selector Rápido de Tipo de Inmueble */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Tipo de Inmueble
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ADDRESS_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAddressType(t.value)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          addressType === t.value
                            ? "bg-electric-50 border-electric-600 text-electric-800 shadow-2xs"
                            : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dirección Exacta (Calle y Número) con botón GPS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Dirección Exacta (Calle y Número / Intersección) *
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="text-[11px] text-electric-600 hover:text-electric-700 font-bold flex items-center gap-1 hover:underline"
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
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      placeholder="Ej: Av. Santa Teresa 1827 c/ Aviadores del Chaco"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-500/20 focus:border-electric-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Campos complementarios: Depto/Piso y Referencias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Piso / Depto / N° Casa <span className="text-neutral-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressApt}
                      onChange={(e) => setAddressApt(e.target.value)}
                      placeholder="Ej: Piso 4, Depto 4B / Casa 2"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-500/20 focus:border-electric-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Instrucciones o Referencia <span className="text-neutral-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder="Ej: Portón blanco, timbre 4B"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-500/20 focus:border-electric-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* MAPA SATELITAL INTERACTIVO CON PIN DE ENTRADA */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-electric-600" />
                      <span>Fija el pin en el mapa para ubicar la entrada:</span>
                    </span>
                    {locationSuccess && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Pin sincronizado
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-neutral-300 shadow-inner">
                    <GoogleMapPicker
                      latitude={latitude}
                      longitude={longitude}
                      onLocationChange={handleLocationChange}
                      currentAddress={addressStreet}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 text-center mt-1.5">
                    Arrastra el mapa o toca el punto exacto para que el personal de limpieza localice la entrada con facilidad.
                  </p>
                </div>

                {/* Botón Final de Creación de Cuenta */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
                >
                  {isLoading ? (
                    <span>Registrando y configurando tu cuenta...</span>
                  ) : (
                    <>
                      <span>Crear Cuenta y Finalizar Registro</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

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
