"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  ArrowRight,
  User as UserIcon,
  Lock,
  Mail,
  Navigation,
  ExternalLink,
  Home,
  Building,
  Plus,
  BookmarkCheck,
  Compass
} from "lucide-react";
import { AVAILABLE_EXTRAS, calculatePricing, formatGs, SERVICE_PACKAGES } from "@/lib/pricing";
import { FrequencyType, PaymentMethod, ServiceHour } from "@/types";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import GoogleMapPicker from "@/components/booking/GoogleMapPicker";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Estados del Formulario
  const [serviceHours, setServiceHours] = useState<ServiceHour>(6);
  const [frequency, setFrequency] = useState<FrequencyType>("weekly_2_4");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  
  // Datos del Cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [address, setAddress] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressApt, setAddressApt] = useState("");
  const [addressRef, setAddressRef] = useState("");
  const [latitude, setLatitude] = useState<number>(-25.2831);
  const [longitude, setLongitude] = useState<number>(-57.5612);
  const [selectedZone, setSelectedZone] = useState("Asunción (Villa Morra / Ykua Satî)");

  // Direcciones Guardadas
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressMode, setAddressMode] = useState<"SAVED" | "NEW">("NEW");
  const [newAddressLabel, setNewAddressLabel] = useState("Casa");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Fecha y Horario
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("08:00");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  // Estado de envío y confirmación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<any | null>(null);

  // Cargar parámetros de URL iniciales
  useEffect(() => {
    const hoursParam = searchParams.get("hours");
    if (hoursParam && [4, 6, 8].includes(Number(hoursParam))) {
      setServiceHours(Number(hoursParam) as ServiceHour);
    }
    const freqParam = searchParams.get("freq");
    if (freqParam && ["once", "weekly_2_4", "biweekly", "monthly"].includes(freqParam)) {
      setFrequency(freqParam as FrequencyType);
    }
    const extrasParam = searchParams.get("extras");
    if (extrasParam) {
      setSelectedExtras(extrasParam.split(",").filter(Boolean));
    }

    // No preseleccionar fecha para exigir que el cliente elija activamente
  }, [searchParams]);

  // Cargar perfil y direcciones guardadas del cliente
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !customerName) setCustomerName(session.user.name);
      if (session.user.email && !customerEmail) setCustomerEmail(session.user.email);
    }

    const loadSavedAddresses = async () => {
      let deletedList: string[] = [];
      try {
        deletedList = JSON.parse(localStorage.getItem("aquiestamos_deleted_addresses") || "[]");
      } catch (e) {}

      const isDeleted = (addrText?: string, idText?: string) => {
        if (!addrText && !idText) return false;
        const norm = (addrText || "").toLowerCase().trim();
        return deletedList.includes(norm) || (idText ? deletedList.includes(idText) : false);
      };

      const addressesList: SavedAddress[] = [];

      // 1. Cargar desde LocalStorage
      try {
        const localData = localStorage.getItem("aquiestamos_saved_addresses");
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            parsed.forEach((a: SavedAddress) => {
              if (!isDeleted(a.address, a.id)) {
                addressesList.push(a);
              }
            });
          }
        }
      } catch (e) {}

      // 2. Cargar desde perfil de usuario si está logueado
      if (session?.user) {
        try {
          const [profRes, bkRes] = await Promise.all([
            fetch("/api/user/profile"),
            fetch("/api/bookings"),
          ]);

          if (profRes.ok) {
            const profData = await profRes.json();
            if (profData?.user) {
              if (profData.user.phone && !customerPhone) setCustomerPhone(profData.user.phone);
              if (profData.user.name && !customerName) setCustomerName(profData.user.name);
              if (profData.user.address && !isDeleted(profData.user.address, "profile_default")) {
                const exists = addressesList.some(a => a.address.toLowerCase().trim() === profData.user.address.toLowerCase().trim());
                if (!exists) {
                  addressesList.unshift({
                    id: "profile_default",
                    label: "🏠 Dirección Habitual",
                    address: profData.user.address,
                    latitude: -25.2831,
                    longitude: -57.5612,
                    isDefault: true,
                  });
                }
              }
            }
          }

          const hasInitialized = localStorage.getItem("aquiestamos_addresses_initialized") === "true";
          if (!hasInitialized && bkRes.ok) {
            const bkData = await bkRes.json();
            if (bkData?.bookings && Array.isArray(bkData.bookings)) {
              bkData.bookings.forEach((b: any) => {
                if (b.address && !isDeleted(b.address, `bk_${b.id}`)) {
                  const exists = addressesList.some(a => a.address.toLowerCase().trim() === b.address.toLowerCase().trim());
                  if (!exists) {
                    addressesList.push({
                      id: `bk_${b.id}`,
                      label: `📍 ${b.address.split(",")[0]}`,
                      address: b.address,
                      latitude: b.latitude || -25.2831,
                      longitude: b.longitude || -57.5612,
                    });
                  }
                }
              });
            }
          }
        } catch (e) {
          console.error("Error al cargar direcciones:", e);
        }
      }

      // Si no hay ninguna dirección y no está logueado, agregar ejemplo amigable si el usuario es demo
      if (addressesList.length > 0) {
        setSavedAddresses(addressesList);
        setAddressMode("SAVED");
        const defaultAddr = addressesList[0];
        setSelectedAddressId(defaultAddr.id);
        setAddress(defaultAddr.address);
        setLatitude(defaultAddr.latitude);
        setLongitude(defaultAddr.longitude);
      } else {
        setAddressMode("NEW");
      }
    };

    loadSavedAddresses();
  }, [session]);

  const pricing = calculatePricing(serviceHours, frequency, selectedExtras);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const RESERVAR_ZONES = [
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

  const handleSelectSavedAddress = (item: SavedAddress) => {
    setSelectedAddressId(item.id);
    setAddress(item.address);
    setAddressStreet(item.address);
    setLatitude(item.latitude);
    setLongitude(item.longitude);
  };

  const handleZoneChange = (zoneName: string) => {
    setSelectedZone(zoneName);
    const found = RESERVAR_ZONES.find((z) => z.name === zoneName);
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lng);
    }
  };

  // Envío final de la reserva
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const name = customerName.trim() || session?.user?.name;
    const email = customerEmail.trim() || session?.user?.email;
    const phone = customerPhone.trim();

    if (!name) {
      setErrorMsg("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!phone) {
      setErrorMsg("Por favor ingresa tu número de teléfono o WhatsApp.");
      return;
    }
    if (!email) {
      setErrorMsg("Por favor ingresa tu correo electrónico.");
      return;
    }

    let finalAddress = address.trim();
    if (addressMode === "NEW") {
      const parts = [addressStreet.trim() || address.trim()];
      if (addressApt.trim()) parts.push(addressApt.trim());
      if (selectedZone.trim() && !parts.some((p) => p.includes(selectedZone.trim()))) {
        parts.push(selectedZone.trim());
      }
      if (addressRef.trim()) parts.push(`(Ref: ${addressRef.trim()})`);
      finalAddress = parts.join(", ");
    }

    if (!finalAddress) {
      setErrorMsg("Por favor ingresa la calle y numeración de la propiedad a limpiar.");
      return;
    }
    if (!serviceDate) {
      setErrorMsg("Por favor selecciona una fecha para el servicio.");
      return;
    }

    setIsSubmitting(true);

    // Guardar nueva dirección en localStorage y perfil si corresponde
    if (addressMode === "NEW" && saveAddressForFuture) {
      try {
        const newEntry: SavedAddress = {
          id: `addr_${Date.now()}`,
          label: newAddressLabel.trim() || "Mi Hogar",
          address: finalAddress,
          latitude,
          longitude,
        };
        const existing = savedAddresses.filter((a) => a.address.toLowerCase() !== newEntry.address.toLowerCase());
        const updated = [newEntry, ...existing];
        setSavedAddresses(updated);
        localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
        localStorage.setItem("aquiestamos_addresses_initialized", "true");

        // Actualizar en el perfil del usuario si tiene sesión
        if (session?.user) {
          fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: finalAddress,
              phone: phone,
            }),
          }).catch(() => {});
        }
      } catch (err) {}
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          address: finalAddress,
          latitude,
          longitude,
          serviceHours,
          frequency,
          extras: selectedExtras,
          serviceDate,
          serviceTime,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la reserva");
      }

      setCompletedBooking(data.booking);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-600 mb-2">
            Reserva Online
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Configura tu Servicio de Limpieza
          </h1>
          <p className="mt-2 text-neutral-600 text-sm sm:text-base">
            Tarifas transparentes en Guaraníes, personal verificado con IPS y geolocalización satelital.
          </p>
        </div>

        {/* Pantalla de Confirmación de Éxito */}
        {completedBooking ? (
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-neutral-200 text-center shadow-clean animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-electric-600 text-white flex items-center justify-center mx-auto mb-4 shadow-electric-sm">
              <Check className="w-7 h-7" />
            </div>

            <span className="inline-block px-3 py-1 bg-electric-50 text-electric-700 text-xs font-semibold rounded-full border border-electric-100 mb-3">
              Reserva Confirmada
            </span>

            <h2 className="text-2xl font-bold text-neutral-900">
              ¡Tu servicio ha sido agendado!
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Código de servicio: <strong className="text-electric-600">{completedBooking.bookingNumber}</strong>
            </p>

            <div className="my-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-left text-xs space-y-2.5 text-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-500">Fecha y Horario:</span>
                <span className="font-semibold text-neutral-900">{completedBooking.serviceDate} ({completedBooking.serviceTime} hs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Duración:</span>
                <span className="font-semibold text-neutral-900">{completedBooking.serviceHours} Horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dirección:</span>
                <span className="font-semibold text-neutral-900 truncate max-w-[220px]">{completedBooking.address}</span>
              </div>
              {completedBooking.latitude && completedBooking.longitude && (
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-neutral-500">Ubicación GPS:</span>
                  <a
                    href={`https://www.google.com/maps?q=${completedBooking.latitude},${completedBooking.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-electric-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Ver en Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-electric-600" />
                  </a>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold">
                <span>Total a abonar:</span>
                <span className="text-electric-600 text-sm font-bold">{formatGs(completedBooking.totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/portal"
                className="w-full py-3.5 px-4 rounded-xl bg-electric-600 hover:bg-electric-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-electric transition-all active:scale-[0.99]"
              >
                <span>Ver en mi Portal de Cliente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={`https://wa.me/595984320528?text=Hola%20acabo%20de%20reservar%20el%20servicio%20${completedBooking.bookingNumber}%20para%20el%20${completedBooking.serviceDate}%20en%20${encodeURIComponent(completedBooking.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold border border-neutral-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-600" />
                <span>Notificar al WhatsApp de Aquí Estamos</span>
              </a>
            </div>
          </div>
        ) : (
          /* Formulario Principal de Reserva */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Columna Izquierda: Pasos de Configuración */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Mensaje de Error General */}
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* PASO 1: Duración y Frecuencia */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <span className="font-mono text-xs font-bold text-electric-600">01</span>
                  <h3 className="text-sm font-bold text-neutral-900">Duración y Frecuencia</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2.5">
                    Selecciona el bloque de horas:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {([4, 6, 8] as ServiceHour[]).map((h) => {
                      const isSelected = serviceHours === h;
                      const pkg = SERVICE_PACKAGES[h];
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setServiceHours(h)}
                          className={`p-3.5 rounded-xl text-left border transition-all ${
                            isSelected
                              ? "bg-electric-600 text-white border-electric-600 shadow-electric-sm"
                              : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50 hover:border-electric-200"
                          }`}
                        >
                          <p className="font-bold text-sm">{h} Horas</p>
                          <p className={`text-[11px] ${isSelected ? "text-white/80" : "text-neutral-500"}`}>
                            {formatGs(pkg.basePrice)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2.5">
                    Frecuencia del servicio:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFrequency("once")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === "once"
                          ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">Servicio Único</p>
                        <p className="text-[11px] text-neutral-500">Tarifa plana estándar</p>
                      </div>
                      {frequency === "once" && <Check className="w-4 h-4 text-electric-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFrequency("weekly_2_4")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === "weekly_2_4"
                          ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold">Semanal (2-4 veces)</p>
                          <span className="text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">
                            15% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">Ahorro mensual programado</p>
                      </div>
                      {frequency === "weekly_2_4" && <Check className="w-4 h-4 text-electric-600" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* PASO 2: Servicios Extras */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <span className="font-mono text-xs font-bold text-electric-600">02</span>
                  <h3 className="text-sm font-bold text-neutral-900">Servicios Extras (Opcionales)</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_EXTRAS.map((extra) => {
                    const isChecked = selectedExtras.includes(extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra.id)}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                          isChecked
                            ? "bg-electric-50 border-electric-300 text-electric-900 font-medium"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="truncate">{extra.name}</span>
                        <span className="text-[10px] text-neutral-400 shrink-0 ml-1">
                          {extra.price > 0 ? `+${extra.price / 1000}k` : "Inc."}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 3: CONTACTO Y UBICACIÓN */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-electric-600">03</span>
                    <h3 className="text-sm font-bold text-neutral-900">Datos de Contacto y Ubicación</h3>
                  </div>
                  {session?.user ? (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Sesión: {session.user.name?.split(" ")[0]}
                    </span>
                  ) : (
                    <Link href="/login?callbackUrl=/reservar" className="text-xs text-electric-600 hover:underline font-semibold">
                      ¿Ya tienes cuenta? Iniciar sesión
                    </Link>
                  )}
                </div>

                {/* Acceso Social Opcional si no está autenticado */}
                {!session?.user && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-800 mb-2">
                      Acceso rápido con 1 clic (opcional):
                    </p>
                    <div className="flex justify-center">
                      <GoogleSignInButton callbackUrl="/reservar" text="Continuar con Google" />
                    </div>
                  </div>
                )}

                {/* Datos de Contacto */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej: María Benítez"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-electric-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej: 0981 123 456"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-electric-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-electric-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Sección de Selección de Ubicación */}
                  <div className="pt-2 border-t border-neutral-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-neutral-800">
                        📍 Dirección del Inmueble
                      </label>

                      {/* Selector de Modo: Direcciones Guardadas vs Nueva */}
                      {savedAddresses.length > 0 && (
                        <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setAddressMode("SAVED");
                              if (savedAddresses.length > 0) {
                                handleSelectSavedAddress(savedAddresses[0]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                              addressMode === "SAVED"
                                ? "bg-white text-electric-700 shadow-xs"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                          >
                            <Home className="w-3 h-3" />
                            <span>Mis Direcciones ({savedAddresses.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAddressMode("NEW");
                              setSelectedAddressId("NEW");
                              setAddress("");
                            }}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                              addressMode === "NEW"
                                ? "bg-white text-electric-700 shadow-xs"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Nueva Dirección</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* MODO 1: MIS DIRECCIONES GUARDADAS */}
                    {addressMode === "SAVED" && savedAddresses.length > 0 && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {savedAddresses.map((item) => {
                            const isSelected = selectedAddressId === item.id;
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectSavedAddress(item)}
                                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                                  isSelected
                                    ? "bg-electric-50/60 border-electric-500 ring-2 ring-electric-500/20"
                                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                      isSelected ? "bg-electric-600 text-white" : "bg-neutral-100 text-neutral-600"
                                    }`}>
                                      <Home className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-neutral-900 block">
                                        {item.label}
                                      </span>
                                      {item.isDefault && (
                                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                                          Habitual
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? "border-electric-600 bg-electric-600 text-white" : "border-neutral-300"
                                  }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                </div>

                                <p className="text-xs text-neutral-700 font-medium mt-2 leading-relaxed">
                                  {item.address}
                                </p>

                                <div className="mt-2.5 pt-2 border-t border-neutral-100/80 flex items-center justify-between text-[11px]">
                                  <span className="text-neutral-400 font-mono text-[10px]">
                                    📍 GPS: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                  </span>
                                  <a
                                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-electric-600 font-semibold hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Ver mapa</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Mensaje de Ubicación Lista */}
                        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Ubicación GPS lista.</strong> No necesitas mover el pin en el mapa al usar una dirección guardada.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAddressMode("NEW");
                              setSelectedAddressId("NEW");
                              setAddress("");
                            }}
                            className="text-xs font-bold text-electric-600 hover:text-electric-700 hover:underline shrink-0 ml-2"
                          >
                            + Agregar otra
                          </button>
                        </div>
                      </div>
                    )}

                    {/* MODO 2: REGISTRAR NUEVA DIRECCIÓN DETALLADA CON GOOGLE MAPS PIN */}
                    {addressMode === "NEW" && (
                      <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-neutral-50/60 border border-neutral-200 animate-in fade-in duration-200">
                        {/* Fila 1: Nombre / Etiqueta y Zona */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
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
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600 hover:text-electric-700 hover:border-electric-300 transition-colors"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                              Zona / Ciudad *
                            </label>
                            <select
                              value={selectedZone}
                              onChange={(e) => handleZoneChange(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none bg-white"
                            >
                              {RESERVAR_ZONES.map((z) => (
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

                        {/* Fila 2: Calle & Número y Edificio / Depto */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-7">
                            <label className="block text-xs font-bold text-neutral-800 mb-1">
                              Calle Principal y Numeración Exacta *
                            </label>
                            <input
                              type="text"
                              required
                              value={addressStreet}
                              onChange={(e) => {
                                setAddressStreet(e.target.value);
                                setAddress(e.target.value);
                              }}
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

                        {/* Fila 3: Referencias de Acceso */}
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

                        {/* Fila 4: Mapa Interactivo Google Maps con Pin Rojo */}
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
                            currentAddress={addressStreet || address}
                            onLocationChange={({ lat, lng, addressSuggestion }) => {
                              setLatitude(lat);
                              setLongitude(lng);
                              if (addressSuggestion && !addressStreet) {
                                setAddressStreet(addressSuggestion);
                                setAddress(addressSuggestion);
                              }
                            }}
                          />
                        </div>

                        {/* Fila 5: Checkbox de guardado y botón de cancelar si tiene guardadas */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-neutral-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAddressForFuture}
                              onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                              className="w-4 h-4 rounded text-electric-600 border-neutral-300 focus:ring-electric-500"
                            />
                            <span className="text-xs text-neutral-700 font-medium select-none">
                              💾 Guardar esta dirección y coordenadas GPS para futuras reservas
                            </span>
                          </label>

                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setAddressMode("SAVED");
                                if (savedAddresses.length > 0) {
                                  handleSelectSavedAddress(savedAddresses[0]);
                                }
                              }}
                              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline"
                            >
                              Cancelar y usar guardada
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PASO 4: Fecha, Turno y Método de Pago */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <span className="font-mono text-xs font-bold text-electric-600">04</span>
                  <h3 className="text-sm font-bold text-neutral-900">Fecha, Turno y Pago</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1 flex items-center justify-between">
                      <span>Fecha del Servicio *</span>
                      {!serviceDate && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Selección Obligatoria
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none transition-all ${
                        !serviceDate
                          ? "border-amber-300 bg-amber-50/20 text-neutral-600 font-medium"
                          : "border-emerald-300 bg-emerald-50/20 text-neutral-900 font-bold"
                      }`}
                    />
                    {!serviceDate && (
                      <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Debes elegir el día para agendar tu limpieza</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Turno de Llegada *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceTime("08:00")}
                        className={`py-2 px-2 rounded-lg border text-center text-xs font-medium transition-all ${
                          serviceTime === "08:00"
                            ? "bg-electric-600 text-white border-electric-600 shadow-electric-sm font-semibold"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        Mañana (08:00 AM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceTime("13:00")}
                        className={`py-2 px-2 rounded-lg border text-center text-xs font-medium transition-all ${
                          serviceTime === "13:00"
                            ? "bg-electric-600 text-white border-electric-600 shadow-electric-sm font-semibold"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        Tarde (13:00 PM)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Método de Pago (al finalizar el servicio)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "cash", label: "Efectivo" },
                      { id: "sipap", label: "SIPAP / Transf." },
                      { id: "card", label: "Tarjeta" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`py-2 px-2 rounded-lg border text-center text-xs font-medium transition-all ${
                          paymentMethod === m.id
                            ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Instrucciones o Notas Especiales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Tengo mascota, avisar en portería antes de subir..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Columna Derecha: Recibo Sticky */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-clean space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-electric-600">Resumen de Reserva</p>
                  <h3 className="text-base font-bold text-neutral-900 mt-1">{pricing.hoursTitle}</h3>
                </div>

                <div className="space-y-2 text-xs text-neutral-600 pb-4 border-b border-neutral-200">
                  <div className="flex justify-between">
                    <span>Base ({serviceHours} Horas):</span>
                    <span className="font-medium text-neutral-900">{formatGs(pricing.basePrice)}</span>
                  </div>
                  {pricing.extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Extras ({selectedExtras.length}):</span>
                      <span className="font-medium text-neutral-900">+{formatGs(pricing.extrasTotal)}</span>
                    </div>
                  )}
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Descuento recurrente ({pricing.discountPercentage}%):</span>
                      <span>-{formatGs(pricing.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500 text-[11px] pt-1">
                    <span>Fecha:</span>
                    <span>{serviceDate || "Por seleccionar"} ({serviceTime} hs)</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">Total a abonar</p>
                  <div className="text-3xl font-bold text-neutral-950 mt-0.5">
                    {formatGs(pricing.finalPrice)}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    ✓ Sin pagos por adelantado. Abonarás al finalizar.
                  </p>
                </div>

                {/* Botón de Confirmación Siempre Activo */}
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-electric-600 hover:bg-electric-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-electric transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Procesando Reserva..." : "Confirmar Reserva"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="pt-2 text-[11px] text-neutral-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-electric-600" />
                    Garantía de Satisfacción 200%
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-electric-600" />
                    Cancelación sin costo hasta 24h antes
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-neutral-500">Cargando cotizador...</div>}>
      <BookingContent />
    </Suspense>
  );
}
