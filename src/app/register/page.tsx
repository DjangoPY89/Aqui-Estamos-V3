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

const REGISTRATION_ZONES = [
  { name: "Asunción (Villa Morra / Ykua Satî)", lat: -25.2831, lng: -57.5612 },
  { name: "Asunción (Carmelitas / Manorá)", lat: -25.2775, lng: -57.5670 },
  { name: "Asunción (Santa Teresa / Eje Corporativo)", lat: -25.2890, lng: -57.5520 },
  { name: "Asunción (Centro / Mcal. López)", lat: -25.2867, lng: -57.6470 },
  { name: "Asunción (Mburucuyá / Trinidad)", lat: -25.2650, lng: -57.5580 },
  { name: "Luque (Aeropuerto / Conmebol)", lat: -25.2678, lng: -57.4856 },
  { name: "San Lorenzo (Campus UNA)", lat: -25.3392, lng: -57.5089 },
  { name: "Lambaré (Yacht / Centro)", lat: -25.3456, lng: -57.6083 },
  { name: "Fernando de la Mora", lat: -25.3211, lng: -57.5528 },
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
  const [newAddressLabel, setNewAddressLabel] = useState("Casa");
  const [selectedZone, setSelectedZone] = useState("Asunción (Villa Morra / Ykua Satî)");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressApt, setAddressApt] = useState("");
  const [addressRef, setAddressRef] = useState("");

  const [latitude, setLatitude] = useState(-25.2831);
  const [longitude, setLongitude] = useState(-57.5612);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleZoneChange = (zoneName: string) => {
    setSelectedZone(zoneName);
    const found = REGISTRATION_ZONES.find((z) => z.name === zoneName);
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lng);
    }
  };

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

  const handleLocationChange = (coords: { lat: number; lng: number; addressSuggestion?: string }) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    if (coords.addressSuggestion && (!addressStreet || addressStreet.length < 5)) {
      setAddressStreet(coords.addressSuggestion);
    }
  };

  // Envío final del registro completo (Paso 1 + Paso 2)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!addressStreet.trim()) {
      setErrorMsg("Por favor ingresa la calle principal y numeración exacta de la propiedad.");
      return;
    }

    setIsLoading(true);

    const parts = [addressStreet.trim()];
    if (addressApt.trim()) parts.push(addressApt.trim());
    if (selectedZone.trim() && !parts.some((p) => p.toLowerCase().includes(selectedZone.split("(")[0].trim().toLowerCase()))) {
      parts.push(selectedZone.trim());
    }
    if (addressRef.trim()) parts.push(`(Ref: ${addressRef.trim()})`);
    const fullFormattedAddress = parts.join(", ");

    const cleanEmail = accountData.email.trim().toLowerCase();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountData.name.trim(),
          email: cleanEmail,
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

      // Guardar dirección en LocalStorage asociada específicamente al correo de este usuario
      try {
        const initialAddress = {
          id: `addr_init_${Date.now()}`,
          label: newAddressLabel.trim() || "Casa",
          address: fullFormattedAddress,
          street: addressStreet.trim(),
          apt: addressApt.trim(),
          notes: addressRef.trim(),
          latitude,
          longitude,
          isDefault: true,
        };
        localStorage.setItem(`aquiestamos_saved_addresses_${cleanEmail}`, JSON.stringify([initialAddress]));
        localStorage.setItem(`aquiestamos_addr_init_${cleanEmail}`, "true");
        localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify([initialAddress]));
      } catch (e) {}

      // Iniciar sesión automáticamente
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: cleanEmail,
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modificar datos de cuenta ({accountData.name})</span>
              </button>

              <form onSubmit={handleFinalSubmit} className="space-y-4">
                
                {/* Fila 1: Nombre / Etiqueta de la Propiedad y Zona / Ciudad */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Nombre / Etiqueta de la Propiedad */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                      Nombre / Etiqueta de la Propiedad
                    </label>
                    <input
                      type="text"
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                      placeholder="Ej: Casa, Oficina, Depto"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none bg-white"
                    />
                    {/* Chips rápidos */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {["🏠 Casa", "🏢 Oficina", "🏬 Depto", "🌳 Quinta"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewAddressLabel(tag.replace(/^[^\s]+\s/, ""))}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-electric-700 hover:border-electric-300 transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zona / Ciudad */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                      Zona / Ciudad *
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => handleZoneChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none bg-white"
                    >
                      {REGISTRATION_ZONES.map((z) => (
                        <option key={z.name} value={z.name}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Al cambiar la zona, el mapa se centra automáticamente.
                    </span>
                  </div>
                </div>

                {/* Fila 2: Calle Principal y Numeración Exacta & Edificio / Depto */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Calle Principal y Numeración Exacta *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      placeholder="Ej: Avda. Santa Teresa 2250 c/ Herminio Maldonado"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Edificio / Depto / Piso <span className="text-neutral-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressApt}
                      onChange={(e) => setAddressApt(e.target.value)}
                      placeholder="Ej: Torre 2, Piso 8, Depto 802"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Fila 3: Referencias de Acceso y Timbre */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Referencias de Acceso y Timbre <span className="text-neutral-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={addressRef}
                    onChange={(e) => setAddressRef(e.target.value)}
                    placeholder="Ej: Portón negro al lado de la farmacia, avisar en portería o tocar timbre 8B"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none bg-white"
                  />
                </div>

                {/* Fila 4: Mapa Google Maps Interactivo con Pin Rojo */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      Ubica el pin rojo de Google Maps sobre la entrada:
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                      📍 GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </span>
                  </div>

                  <GoogleMapPicker
                    latitude={latitude}
                    longitude={longitude}
                    currentAddress={addressStreet}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                {/* Botón Final de Creación de Cuenta */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer"
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
