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
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  User as UserIcon,
  Phone,
  UserPlus,
  LogIn,
  MapPin,
  Navigation,
  Map
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const GoogleMapPicker = dynamic(() => import("@/components/booking/GoogleMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-52 bg-neutral-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-medium">
      Cargando Mapa Satelital...
    </div>
  ),
});

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";
  const defaultTab = searchParams.get("tab") === "register" ? "REGISTER" : "LOGIN";
  const wasRegistered = searchParams.get("registered") === "true";

  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">(defaultTab);

  // Estados para Iniciar Sesión
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Estados para Registro de Nuevos Clientes
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Estados de Ubicación Satelital GPS
  const [latitude, setLatitude] = useState(-25.2831);
  const [longitude, setLongitude] = useState(-57.5612);
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    wasRegistered ? "¡Cuenta creada con éxito! Ingresa con tus credenciales a continuación." : null
  );

  // Geolocalización Automática por GPS del Navegador
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
        setErrorMsg("No se pudo obtener tu ubicación automática. Puedes escribir tu dirección o seleccionarla en el mapa interactivo.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationChange = (coords: { lat: number; lng: number; addressSuggestion?: string }) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setLocationSuccess(true);
    if (coords.addressSuggestion && (!regAddress || regAddress.length < 5)) {
      setRegAddress(coords.addressSuggestion);
    }
  };

  // Manejo de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const targetEmail = loginEmail.trim().toLowerCase();

      const res = await signIn("credentials", {
        redirect: false,
        email: targetEmail,
        password: loginPassword,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin" || res.error.includes("CredentialsSignin")) {
          setErrorMsg("Correo o contraseña incorrectos. Por favor verifica tus datos.");
        } else {
          setErrorMsg(res.error);
        }
        setIsLoading(false);
      } else {
        // Redirigir a panel de administración si es admin, o al portal del cliente
        if (targetEmail === "juanas89@gmail.com" || targetEmail === "admin@aquiestamos.com") {
          window.location.href = "/admin";
        } else {
          window.location.href = callbackUrl;
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  // Manejo de Registro de Nuevo Cliente con Dirección y Ubicación GPS
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword || !regAddress.trim()) {
      setErrorMsg("Por favor completa todos los campos obligatorios, incluyendo tu dirección.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          phone: regPhone.trim(),
          address: regAddress.trim(),
          password: regPassword,
          latitude,
          longitude,
        }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: "Ocurrió un error al procesar el registro." };
      }

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la cuenta.");
      }

      // Guardar dirección en LocalStorage para autocompletar reservas de inmediato
      if (regAddress.trim()) {
        try {
          const initialAddress = {
            id: `addr_init_${Date.now()}`,
            label: "🏠 Domicilio Principal",
            address: regAddress.trim(),
            latitude,
            longitude,
            isDefault: true,
          };
          localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify([initialAddress]));
        } catch (e) {}
      }

      // Iniciar sesión automáticamente tras el registro exitoso
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        callbackUrl,
      });

      if (loginRes?.ok) {
        window.location.href = callbackUrl;
      } else {
        setSuccessMsg("¡Cuenta creada con éxito! Por favor inicia sesión con tu contraseña.");
        setActiveTab("LOGIN");
        setLoginEmail(regEmail.trim().toLowerCase());
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrar cliente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-neutral-50 via-white to-electric-50/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contenedor Central */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Logo & Marca */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="relative h-12 w-48 mx-auto">
              <Image
                src="/images/logo.svg"
                alt="Aquí Estamos Limpieza"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {activeTab === "LOGIN" ? "Iniciar Sesión" : "Crear Cuenta de Cliente"}
          </h1>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            {activeTab === "LOGIN"
              ? "Ingresa a tu cuenta para gestionar tus reservas y ver a tu personal asignado."
              : "Regístrate en menos de 1 minuto para agendar y administrar tus servicios de limpieza."}
          </p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xl shadow-neutral-200/50 space-y-5">
          
          {/* Mensaje de Éxito */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.includes("Ya existe") && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("LOGIN");
                    setLoginEmail(regEmail);
                    setErrorMsg(null);
                  }}
                  className="font-bold underline text-electric-600 hover:text-electric-700 shrink-0 ml-2 cursor-pointer"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          )}

          {/* Selector de Pestaña: Iniciar Sesión vs Regístrate */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab("LOGIN");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "LOGIN"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("REGISTER");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "REGISTER"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarme</span>
            </button>
          </div>

          {/* Botón de Google en 1 Clic */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <GoogleSignInButton
                callbackUrl={callbackUrl}
                onError={(err) => setErrorMsg(err)}
                text={activeTab === "LOGIN" ? "Continuar con Google" : "Registrarme con Google"}
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                o con tu correo
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>
          </div>

          {/* PESTAÑA 1: Formulario de Iniciar Sesión */}
          {activeTab === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    autoComplete="username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Contraseña
                  </label>
                  <Link
                    href="/recuperar-password"
                    className="text-[11px] font-semibold text-electric-600 hover:text-electric-700 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-600 p-0.5"
                    title={showLoginPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-electric-600 rounded border-neutral-300 focus:ring-electric-500"
                  />
                  <span className="text-xs text-neutral-600 font-medium select-none">
                    Recordar mi sesión
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Ingresar a mi Cuenta</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* PESTAÑA 2: Formulario de Registro de Nuevo Cliente */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej: María González"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="maria@ejemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  WhatsApp / Teléfono *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0981 123 456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dirección y Ubicación GPS */}
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-700">
                    Dirección del Domicilio *
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-electric-600 hover:text-electric-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin text-amber-500" : ""}`} />
                    <span>{isLocating ? "Detectando GPS..." : "📍 Usar GPS actual"}</span>
                  </button>
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Ej: Av. Santa Teresa casi Denis Roa, Asunción"
                    className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="absolute right-2 top-2 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                  >
                    <Map className="w-3 h-3 text-electric-600" />
                    <span>{showMap ? "Ocultar" : "Mapa"}</span>
                  </button>
                </div>

                {locationSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pl-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ubicación GPS fijada ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
                  </p>
                )}

                {/* Selector Interactivo en Mapa */}
                {showMap && (
                  <div className="pt-2">
                    <p className="text-[10px] text-neutral-500 mb-1.5 font-medium">
                      Arrastra el marcador o haz clic en tu casa/edificio para precisión exacta:
                    </p>
                    <div className="h-56 rounded-2xl overflow-hidden border border-neutral-300 shadow-inner">
                      <GoogleMapPicker
                        latitude={latitude}
                        longitude={longitude}
                        onLocationChange={handleLocationChange}
                        currentAddress={regAddress}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Crear Contraseña (mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-2.5 text-neutral-400 hover:text-neutral-600 p-0.5"
                    title={showRegPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Crear mi Cuenta Gratis</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Insignias de Confianza Inferiores */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conexión Cifrada SSL</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-electric-600" />
            <span>Autenticación Segura</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span>🇵🇾 Asunción, Paraguay</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs text-neutral-400">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
