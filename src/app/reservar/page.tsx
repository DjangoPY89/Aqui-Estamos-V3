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
  Compass,
  Star,
  Award,
  UserCheck,
  CreditCard,
  QrCode
} from "lucide-react";
import { AVAILABLE_EXTRAS, calculatePricing, formatGs, SERVICE_PACKAGES } from "@/lib/pricing";
import { FrequencyType, PaymentMethod, ServiceHour, TimeSlotConfig, DateAvailabilityCheck, AvailabilitySettings } from "@/types";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import GoogleMapPicker from "@/components/booking/GoogleMapPicker";
import BookingCalendarPicker from "@/components/BookingCalendarPicker";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

interface AvailableCleaner {
  id: string;
  name: string;
  image?: string | null;
  rating: number;
  reviewCount: number;
  completedBookingsCount: number;
  zone: string;
  ipsVerified: boolean;
  isAvailable: boolean;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Estados del Formulario
  const [serviceHours, setServiceHours] = useState<ServiceHour>(6);
  const [frequency, setFrequency] = useState<FrequencyType>("once");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  
  // Datos del Cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isEditingContact, setIsEditingContact] = useState(false);

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
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [serviceTime, setServiceTime] = useState("08:00");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("sipap");

  // Colaborador Seleccionado
  const [availableEmployees, setAvailableEmployees] = useState<AvailableCleaner[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(null);
  
  // Estados de Disponibilidad en Vivo
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings | null>(null);
  const [configuredSlots, setConfiguredSlots] = useState<TimeSlotConfig[]>([
    { id: "slot_0800", time: "08:00", label: "Mañana (08:00 AM)", period: "morning", enabled: true },
    { id: "slot_1300", time: "13:00", label: "Tarde (13:00 PM)", period: "afternoon", enabled: true },
  ]);
  const [availabilityCheck, setAvailabilityCheck] = useState<DateAvailabilityCheck | null>(null);
  const [isCheckingDate, setIsCheckingDate] = useState(false);
  const [dateAvailabilityNotice, setDateAvailabilityNotice] = useState<string | null>(null);

  // Estado de envío y confirmación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<any | null>(null);
  const [hasSavedPhone, setHasSavedPhone] = useState(false);

  // Estados de Gate de Autenticación Requerida
  const [gateEmail, setGateEmail] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [isGateLoading, setIsGateLoading] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const handleGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);

    if (!gateEmail || !gatePassword) {
      setGateError("Ingresa tu correo y contraseña.");
      return;
    }

    setIsGateLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: gateEmail.trim().toLowerCase(),
        password: gatePassword,
      });

      if (res?.error) {
        setGateError("Correo o contraseña incorrectos.");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setGateError("Error al iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setIsGateLoading(false);
    }
  };

  // Cargar parámetros de URL iniciales
  useEffect(() => {
    const hoursParam = searchParams.get("hours");
    if (hoursParam && [4, 6, 8].includes(Number(hoursParam))) {
      setServiceHours(Number(hoursParam) as ServiceHour);
    }
    const freqParam = searchParams.get("freq");
    if (freqParam && ["once", "multi_weekly", "weekly", "biweekly", "monthly", "weekly_2_4"].includes(freqParam)) {
      setFrequency(freqParam as FrequencyType);
    }
    const extrasParam = searchParams.get("extras");
    if (extrasParam) {
      setSelectedExtras(extrasParam.split(",").filter(Boolean));
    }
  }, [searchParams]);

  // Cargar colaboradores en tiempo real con disponibilidad
  useEffect(() => {
    let isMounted = true;
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const query = new URLSearchParams();
        if (serviceDate) query.append("date", serviceDate);
        if (serviceTime) query.append("time", serviceTime);
        if (serviceHours) query.append("hours", serviceHours.toString());
        if (selectedZone) query.append("zone", selectedZone);

        const res = await fetch(`/api/employees?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.employees) {
            setAvailableEmployees(data.employees);
          }
        }
      } catch (err) {
        console.error("Error cargando colaboradores:", err);
      } finally {
        if (isMounted) setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
    return () => {
      isMounted = false;
    };
  }, [serviceDate, serviceTime, serviceHours, selectedZone]);

  // Cargar configuraciones de turnos y reglas de disponibilidad generales (con inicio instantáneo desde localStorage)
  useEffect(() => {
    // 1. Carga instantánea desde localStorage si existe
    try {
      const local = localStorage.getItem("aquiestamos_admin_availability_settings");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed) {
          setAvailabilitySettings(parsed);
          if (Array.isArray(parsed.timeSlots)) {
            setConfiguredSlots(parsed.timeSlots.filter((s: any) => s.enabled));
          }
        }
      }
    } catch (e) {}

    // 2. Sincronización en vivo con API Cloud
    fetch(`/api/availability?t=${Date.now()}`, { 
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setAvailabilitySettings(data.settings);
          try {
            localStorage.setItem("aquiestamos_admin_availability_settings", JSON.stringify(data.settings));
          } catch (e) {}
          if (Array.isArray(data.settings.timeSlots)) {
            setConfiguredSlots(data.settings.timeSlots);
          }
        }
      })
      .catch((err) => console.error("Error loading availability settings:", err));
  }, []);

  // Validar disponibilidad de fecha cuando el cliente selecciona o modifica el día
  useEffect(() => {
    if (!serviceDate) {
      setAvailabilityCheck(null);
      setDateAvailabilityNotice(null);
      return;
    }

    let isMounted = true;
    const checkDate = async () => {
      setIsCheckingDate(true);
      try {
        const res = await fetch(`/api/availability?date=${serviceDate}&t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!isMounted) return;

        if (data.check) {
          setAvailabilityCheck(data.check);
          if (!data.check.isOpen) {
            setDateAvailabilityNotice(data.check.closedReason || "Fecha no disponible para reservas.");
          } else {
            setDateAvailabilityNotice(null);
            // Si el turno actualmente elegido no está habilitado o disponible en esta fecha, elegir el primero disponible
            if (Array.isArray(data.check.slots) && data.check.slots.length > 0) {
              const isLong = serviceHours === 6 || serviceHours === 8;
              const currentSlot = data.check.slots.find((s: any) => s.time === serviceTime);
              if (!currentSlot || !currentSlot.available || (isLong && serviceTime > "08:00")) {
                const firstAvailable = data.check.slots.find((s: any) => s.available && (!isLong || s.time <= "08:00"));
                if (firstAvailable) {
                  setServiceTime(firstAvailable.time);
                } else if (isLong) {
                  setServiceTime("08:00");
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error verificando disponibilidad de fecha:", err);
      } finally {
        if (isMounted) setIsCheckingDate(false);
      }
    };

    checkDate();
    return () => {
      isMounted = false;
    };
  }, [serviceDate, serviceHours]);

  // Cargar perfil y direcciones guardadas del cliente
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !customerName) setCustomerName(session.user.name);
      if (session.user.email && !customerEmail) setCustomerEmail(session.user.email);
    }

    const loadSavedAddresses = async () => {
      const userEmail = session?.user?.email?.trim().toLowerCase();
      let deletedList: string[] = [];
      if (userEmail) {
        try {
          const storedDeleted = localStorage.getItem(`aquiestamos_deleted_addresses_${userEmail}`);
          if (storedDeleted) deletedList = JSON.parse(storedDeleted);
        } catch (e) {}
      }

      const isDeleted = (addrText?: string, idText?: string) => {
        if (!addrText && !idText) return false;
        const norm = (addrText || "").toLowerCase().trim();
        return deletedList.includes(norm) || (idText ? deletedList.includes(idText) : false);
      };

      const addressesList: SavedAddress[] = [];

      // 1. Cargar desde LocalStorage específico del usuario autenticado
      if (userEmail) {
        try {
          const userLocalKey = `aquiestamos_saved_addresses_${userEmail}`;
          const localData = localStorage.getItem(userLocalKey);
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
      }

      // 2. Cargar desde perfil de usuario y reservas del usuario si está logueado
      if (session?.user && userEmail) {
        try {
          const [profRes, bkRes] = await Promise.all([
            fetch("/api/user/profile"),
            fetch("/api/bookings"),
          ]);

          let profilePhone = "";
          if (profRes.ok) {
            const profData = await profRes.json();
            if (profData?.user) {
              if (profData.user.phone) {
                profilePhone = profData.user.phone;
                setCustomerPhone(profData.user.phone);
                setHasSavedPhone(true);
              }
              if (profData.user.name && !customerName) setCustomerName(profData.user.name);
              if (profData.user.address && profData.user.address.trim() && !isDeleted(profData.user.address, "profile_default")) {
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

          if (bkRes.ok) {
            const bkData = await bkRes.json();
            if (bkData?.bookings && Array.isArray(bkData.bookings) && bkData.bookings.length > 0) {
              if (!profilePhone && bkData.bookings[0]?.customerPhone) {
                setCustomerPhone(bkData.bookings[0].customerPhone);
                setHasSavedPhone(true);
              }
            }

            const hasInitialized = localStorage.getItem(`aquiestamos_addr_init_${userEmail}`) === "true";
            if (!hasInitialized && bkData?.bookings && Array.isArray(bkData.bookings)) {
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
          console.error("Error al cargar direcciones del usuario:", e);
        }
      }

      // Si el usuario tiene direcciones guardadas en su cuenta, mostrarlas
      if (addressesList.length > 0) {
        const sanitized = addressesList.map((a) => ({
          ...a,
          latitude: (typeof a.latitude === 'number' && !isNaN(a.latitude)) ? a.latitude : -25.2831,
          longitude: (typeof a.longitude === 'number' && !isNaN(a.longitude)) ? a.longitude : -57.5612,
        }));
        setSavedAddresses(sanitized);
        setAddressMode("SAVED");
        const defaultAddr = sanitized[0];
        setSelectedAddressId(defaultAddr.id);
        setAddress(defaultAddr.address);
        setLatitude(defaultAddr.latitude);
        setLongitude(defaultAddr.longitude);
      } else {
        // Usuario nuevo (Google o directo): iniciar con formulario limpio en modo NEW
        setSavedAddresses([]);
        setAddressMode("NEW");
        setSelectedAddressId("NEW");
      }
    };

    loadSavedAddresses();
  }, [session]);

  const datesCount = (frequency === "multi_weekly" || frequency === "weekly_2_4") 
    ? Math.max(selectedDates.length, 1) 
    : 1;
  const pricing = calculatePricing(serviceHours, frequency, selectedExtras, datesCount);

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
      const street = addressStreet.trim();
      if (!street) {
        setErrorMsg("Por favor ingresa la calle y numeración exacta de la propiedad a limpiar.");
        return;
      }
      const parts = [street];
      if (addressApt.trim()) parts.push(addressApt.trim());
      if (selectedZone.trim() && !parts.some((p) => p.toLowerCase().includes(selectedZone.split("(")[0].trim().toLowerCase()))) {
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
      setErrorMsg("Por favor selecciona una fecha para el servicio en el calendario.");
      return;
    }

    if ((frequency === "multi_weekly" || frequency === "weekly_2_4") && selectedDates.length < 2) {
      setErrorMsg("Para la frecuencia de más de 1 vez por semana, por favor selecciona al menos 2 días en el calendario.");
      return;
    }

    if (availabilityCheck && !availabilityCheck.isOpen) {
      setErrorMsg(availabilityCheck.closedReason || "La fecha seleccionada no se encuentra disponible para reservas.");
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
        const targetEmail = (session?.user?.email || customerEmail).trim().toLowerCase();
        if (targetEmail) {
          localStorage.setItem(`aquiestamos_saved_addresses_${targetEmail}`, JSON.stringify(updated));
          localStorage.setItem(`aquiestamos_addr_init_${targetEmail}`, "true");
        }

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

    const preferredEmp = availableEmployees.find((e) => e.id === selectedCleanerId);

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
          selectedDates: (frequency === "multi_weekly" || frequency === "weekly_2_4") ? selectedDates : [serviceDate],
          serviceTime,
          paymentMethod,
          preferredCleanerId: preferredEmp?.id || null,
          preferredCleanerName: preferredEmp?.name || null,
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
      setErrorMsg(err.message || "Error al procesar tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Pantalla de Carga de Sesión
  if (status === "loading") {
    return (
      <div className="bg-neutral-50 min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-10 h-10 border-3 border-electric-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-neutral-600">Verificando sesión...</p>
      </div>
    );
  }

  // 2. Puerta de Autenticación Obligatoria (Si o Sí debe iniciar sesión)
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-neutral-50 via-white to-electric-50/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
          <Link href="/" className="inline-flex items-center justify-center mb-4 transition-transform hover:scale-105">
            <div className="relative h-10 sm:h-12 w-36 sm:w-44 mx-auto flex items-center justify-center">
              <Image
                src="/images/logo.svg"
                alt="Aquí Estamos Limpieza"
                fill
                className="object-contain object-center"
                priority
              />
            </div>
          </Link>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-electric-100 text-electric-700 mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Inicia Sesión para Reservar
          </h1>
          <p className="mt-1.5 text-xs text-neutral-500 max-w-sm mx-auto">
            Para garantizar la seguridad de tus servicios y autocompletar tus datos, ingresa a tu cuenta.
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white/95 backdrop-blur-xl py-7 px-6 sm:px-8 rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 space-y-5">
            {gateError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{gateError}</span>
              </div>
            )}

            {/* Google 1-Click */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <GoogleSignInButton
                  callbackUrl="/reservar"
                  onError={(err) => setGateError(err)}
                  text="Continuar con Google y Reservar"
                />
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-neutral-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  o ingresa con tu correo
                </span>
                <div className="border-t border-neutral-200 w-full" />
              </div>
            </div>

            {/* Formulario de Login */}
            <form onSubmit={handleGateLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={gateEmail}
                    onChange={(e) => setGateEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-700">Contraseña</label>
                  <Link href="/recuperar-password" className="text-[11px] text-electric-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={gatePassword}
                    onChange={(e) => setGatePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGateLoading}
                className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric-sm transition-all active:scale-[0.99] disabled:opacity-50 mt-1"
              >
                {isGateLoading ? "Iniciando sesión..." : "Iniciar Sesión y Continuar a la Reserva"}
              </button>
            </form>

            <div className="text-center text-xs text-neutral-500 pt-3 border-t border-neutral-100">
              ¿Aún no tienes cuenta?{" "}
              <Link
                href="/register?callbackUrl=/reservar"
                className="font-bold text-electric-600 hover:text-electric-700 hover:underline"
              >
                Crear una cuenta nueva
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Limpieza Aquí Estamos (${completedBooking.bookingNumber})`)}&dates=${completedBooking.serviceDate.replace(/-/g, "")}T${(completedBooking.serviceTime || "08:00").replace(":", "")}00/${completedBooking.serviceDate.replace(/-/g, "")}T${(parseInt((completedBooking.serviceTime || "08:00").split(":")[0], 10) + (completedBooking.serviceHours || 4)).toString().padStart(2, "0")}${(completedBooking.serviceTime || "08:00").split(":")[1] || "00"}00&details=${encodeURIComponent(`Servicio de Limpieza ${completedBooking.serviceHours} Horas\nCliente: ${completedBooking.customerName}\nTeléfono: ${completedBooking.customerPhone}\nDirección: ${completedBooking.address}\nTotal: ${formatGs(completedBooking.totalPrice)}`)}&location=${encodeURIComponent(completedBooking.address)}&src=6995kk35n4bc196tnd07q3onahg0t2lh@import.calendar.google.com&add=6995kk35n4bc196tnd07q3onahg0t2lh@import.calendar.google.com&ctz=America/Asuncion`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
              >
                <Calendar className="w-4 h-4" />
                <span>Añadir a mi Google Calendar</span>
              </a>

              <Link
                href="/portal"
                className="w-full py-3 px-4 rounded-xl bg-electric-600 hover:bg-electric-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-electric transition-all active:scale-[0.99]"
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
                          onClick={() => {
                            setServiceHours(h);
                            if ((h === 6 || h === 8) && serviceTime > "08:00") {
                              setServiceTime("08:00");
                            }
                          }}
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
                    Frecuencia del servicio y Descuentos:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {/* 1. Servicio Único */}
                    <button
                      type="button"
                      onClick={() => setFrequency("once")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === "once"
                          ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">Servicio Único</p>
                        <p className="text-[11px] text-neutral-500">Tarifa regular estándar (1 fecha)</p>
                      </div>
                      {frequency === "once" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                    </button>

                    {/* 2. Más de una vez por semana */}
                    <button
                      type="button"
                      onClick={() => setFrequency("multi_weekly")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === "multi_weekly" || frequency === "weekly_2_4"
                          ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold">+1 vez por semana</p>
                          <span className="text-[9px] uppercase font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                            15% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">Selecciona 2 o más días en la misma semana</p>
                      </div>
                      {(frequency === "multi_weekly" || frequency === "weekly_2_4") && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                    </button>

                    {/* 3. Semanal */}
                    <button
                      type="button"
                      onClick={() => setFrequency("weekly")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === "weekly"
                          ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold">Semanal</p>
                          <span className="text-[9px] uppercase font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                            15% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">Agendamiento recurrente semanal</p>
                      </div>
                      {frequency === "weekly" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                    </button>

                    {/* 4. Quincenal */}
                    <button
                      type="button"
                      onClick={() => setFrequency("biweekly")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === "biweekly"
                          ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold">Quincenal</p>
                          <span className="text-[9px] uppercase font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                            10% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">Agendamiento cada 15 días</p>
                      </div>
                      {frequency === "biweekly" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
                    </button>

                    {/* 5. Mensual */}
                    <button
                      type="button"
                      onClick={() => setFrequency("monthly")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        frequency === "monthly"
                          ? "bg-electric-50 border-electric-400 text-electric-900 font-semibold shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold">Mensual</p>
                          <span className="text-[9px] uppercase font-black bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                            5% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">Agendamiento mensual automático</p>
                      </div>
                      {frequency === "monthly" && <Check className="w-4 h-4 text-electric-600 shrink-0" />}
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
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Cuenta: {session?.user?.name || session?.user?.email}</span>
                  </span>
                </div>

                {/* Datos de Contacto */}
                <div className="space-y-4">
                  {Boolean(session?.user && customerName.trim() && customerPhone.trim() && customerEmail.trim()) && !isEditingContact ? (
                    /* Tarjeta Compacta de Perfil Verificado */
                    <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-electric-100 text-electric-700 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {customerName ? customerName.slice(0, 2).toUpperCase() : "US"}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-slate-900">{customerName}</p>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <span>✓</span> Datos verificados de tu cuenta
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate">
                            📱 {customerPhone} • ✉️ {customerEmail}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingContact(true)}
                        className="text-xs font-bold text-electric-600 hover:text-electric-700 hover:underline shrink-0 text-left sm:text-right"
                      >
                        Modificar datos
                      </button>
                    </div>
                  ) : (
                    /* Inputs Editables de Contacto */
                    <div className="space-y-3">
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
                          {customerPhone ? (
                            hasSavedPhone ? (
                              <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                                <span>✓</span> Teléfono guardado en tu perfil
                              </p>
                            ) : (
                              <p className="text-[10px] text-electric-600 font-medium mt-1 flex items-center gap-1">
                                <span>💾</span> Se guardará en tu perfil para tus próximas reservas
                              </p>
                            )
                          ) : (
                            <p className="text-[10px] text-neutral-400 font-normal mt-1">
                              Se guardará en tu perfil para futuras reservas.
                            </p>
                          )}
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

                      {Boolean(session?.user && customerName.trim() && customerPhone.trim() && customerEmail.trim()) && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsEditingContact(false)}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors"
                          >
                            ✓ Listo, usar estos datos
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sección de Selección de Ubicación */}
                  <div className="pt-2 border-t border-neutral-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-neutral-800">
                        📍 Dirección del Inmueble
                      </label>

                      {/* Selector de Modo: Direcciones Guardadas vs Nueva */}
                      <div className="flex items-center gap-2">
                        {savedAddresses.length > 0 && (
                          <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                setAddressMode("SAVED");
                                if (!selectedAddressId || selectedAddressId === "NEW") {
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
                                setAddress("");
                                setAddressStreet("");
                                setAddressApt("");
                                setAddressRef("");
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
                        <Link
                          href="/portal/direcciones/nueva"
                          target="_blank"
                          className="text-[11px] font-bold text-electric-600 hover:text-electric-700 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Registrar nueva dirección</span>
                        </Link>
                      </div>
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
                                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.2 rounded">
                                          ★ Principal
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
                                    📍 GPS: {(item.latitude ?? -25.2831).toFixed(4)}, {(item.longitude ?? -57.5612).toFixed(4)}
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
                              <strong>Dirección seleccionada.</strong> Coordenadas GPS fijadas automáticamente.
                            </span>
                          </div>
                          <Link
                            href="/portal/direcciones/nueva"
                            target="_blank"
                            className="text-xs font-bold text-electric-600 hover:text-electric-700 hover:underline shrink-0 ml-2"
                          >
                            + Registrar nueva
                          </Link>
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
                                const lastValid = savedAddresses.find((a) => a.id === selectedAddressId);
                                const toRestore = lastValid || savedAddresses[0];
                                handleSelectSavedAddress(toRestore);
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

              {/* PASO 4: SELECCIÓN DE COLABORADOR / PERSONAL */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-electric-600">04</span>
                    <h3 className="text-sm font-bold text-neutral-900">Colaborador / Personal Asignado (Opcional)</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {availableEmployees.filter(e => e.isAvailable).length} disponibles
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Puedes elegir un profesional preferido o dejar que nuestro sistema asigne automáticamente al colaborador mejor evaluado y disponible en tu zona.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Opción 1: Asignación Automática Inteligente */}
                    <button
                      type="button"
                      onClick={() => setSelectedCleanerId(null)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selectedCleanerId === null
                          ? "bg-electric-50/70 border-electric-500 ring-2 ring-electric-500/20 shadow-xs"
                          : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          selectedCleanerId === null ? "bg-electric-600 text-white shadow-electric-sm" : "bg-slate-100 text-slate-700"
                        }`}>
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            <span>Asignación Inteligente</span>
                            <span className="text-[9px] font-black uppercase bg-electric-100 text-electric-800 px-1.5 py-0.2 rounded-full">
                              Recomendada
                            </span>
                          </p>
                          <p className="text-[11px] text-neutral-500">Asignaremos al profesional ideal para tu zona</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedCleanerId === null ? "border-electric-600 bg-electric-600 text-white" : "border-neutral-300"
                      }`}>
                        {selectedCleanerId === null && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>

                    {/* Lista de Colaboradores Reales */}
                    {availableEmployees.map((emp) => {
                      const isSelected = selectedCleanerId === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          disabled={!emp.isAvailable}
                          onClick={() => emp.isAvailable && setSelectedCleanerId(emp.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all relative ${
                            !emp.isAvailable
                              ? "bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed"
                              : isSelected
                              ? "bg-electric-50/70 border-electric-500 ring-2 ring-electric-500/20 shadow-xs"
                              : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Foto o Avatar */}
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                              {emp.image ? (
                                <Image
                                  src={emp.image}
                                  alt={emp.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="font-extrabold text-xs text-slate-700">
                                  {emp.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <p className="text-xs font-bold text-neutral-900 truncate">
                                {emp.name}
                              </p>
                              
                              {/* Rating y Reseñas */}
                              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                                <span>{emp.rating.toFixed(1)}</span>
                                <span className="text-slate-400 font-normal text-[10px]">
                                  ({emp.reviewCount || 0} reseñas)
                                </span>
                              </div>

                              {/* Servicios concluidos & IPS */}
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                  ✓ {emp.completedBookingsCount} servicios
                                </span>
                                {emp.ipsVerified && (
                                  <span className="text-[9.5px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    IPS Activo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-electric-600 bg-electric-600 text-white" : "border-neutral-300"
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                            {!emp.isAvailable && (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                                Ocupado
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PASO 5: FECHA Y TURNO */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <span className="font-mono text-xs font-bold text-electric-600">05</span>
                  <h3 className="text-sm font-bold text-neutral-900">Fecha y Turno del Servicio</h3>
                </div>

                {/* Calendario Visual e Interactivo */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-800 flex items-center justify-between">
                    <span>
                      {(frequency === "multi_weekly" || frequency === "weekly_2_4") 
                        ? "1. Selecciona los Días en la Misma Semana (Mínimo 2) *" 
                        : "1. Selecciona la Fecha del Servicio *"}
                    </span>
                    {!serviceDate ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Selección Obligatoria en Calendario
                      </span>
                    ) : availabilityCheck && !availabilityCheck.isOpen ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Día No Disponible
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Fecha Habilitada
                      </span>
                    )}
                  </label>

                  <BookingCalendarPicker
                    selectedDate={serviceDate}
                    onSelectDate={(newDate) => setServiceDate(newDate)}
                    selectedDates={selectedDates}
                    onSelectDates={(newDates) => {
                      setSelectedDates(newDates);
                      if (newDates.length > 0) setServiceDate(newDates[0]);
                    }}
                    isMultiSelect={frequency === "multi_weekly" || frequency === "weekly_2_4"}
                    minSelectedCount={2}
                    availabilitySettings={availabilitySettings}
                  />

                  {/* Feedback en vivo de la fecha */}
                  {isCheckingDate && (
                    <p className="text-[11px] text-neutral-500 font-medium mt-1.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border-2 border-electric-600 border-t-transparent rounded-full animate-spin" />
                      <span>Verificando disponibilidad de la cuadrilla para esta fecha...</span>
                    </p>
                  )}

                  {!isCheckingDate && dateAvailabilityNotice && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-xl flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Fecha no disponible</p>
                        <p className="text-rose-700">{dateAvailabilityNotice}</p>
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">Por favor selecciona otro día habilitado en el calendario.</p>
                      </div>
                    </div>
                  )}

                  {!isCheckingDate && !dateAvailabilityNotice && serviceDate && availabilityCheck?.isOpen && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in shadow-2xs">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Fecha Confirmada: <span className="font-extrabold text-emerald-950">{serviceDate}</span></span>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                        {availabilityCheck.availableCapacity} {availabilityCheck.availableCapacity === 1 ? "cupo restante" : "cupos restantes hoy"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  {/* Selector Dinámico de Turno de Llegada */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1 flex items-center justify-between">
                      <span>2. Turno de Llegada Estimado *</span>
                      <span className="text-[10px] font-semibold text-neutral-500">
                        Hora de arribo del personal
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(availabilityCheck?.slots || configuredSlots.filter((s) => s.enabled)).map((slot: any) => {
                        const isLongService = serviceHours === 6 || serviceHours === 8;
                        const isTimeAllowed = !isLongService || slot.time <= "08:00";
                        const isSlotAvailable = availabilityCheck ? slot.available !== false && availabilityCheck.isOpen && isTimeAllowed : isTimeAllowed;
                        const isSelected = serviceTime === slot.time;

                        return (
                          <button
                            key={slot.time || slot.id}
                            type="button"
                            disabled={!isSlotAvailable}
                            onClick={() => setServiceTime(slot.time)}
                            title={!isTimeAllowed ? `Los servicios de ${serviceHours} horas solo inician en el turno de la mañana (hasta las 08:00 AM)` : undefined}
                            className={`py-2 px-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-1.5 ${
                              isSelected && isSlotAvailable
                                ? "bg-electric-600 text-white border-electric-600 shadow-electric-sm font-bold"
                                : !isSlotAvailable
                                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60"
                                : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 font-semibold"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-bold">{slot.label || `Turno ${slot.time}`}</p>
                              <p className={`text-[10px] ${isSelected ? "text-white/80" : "text-neutral-500"}`}>
                                Llegada: {slot.time} hs
                              </p>
                            </div>

                            {!isTimeAllowed ? (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                                Solo 4hs
                              </span>
                            ) : !isSlotAvailable ? (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded">
                                Lleno
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    {(serviceHours === 6 || serviceHours === 8) && (
                      <p className="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center gap-1.5 font-medium">
                        <span className="text-sm shrink-0">⏰</span>
                        <span>
                          <strong>Horario exclusivo:</strong> Los servicios de {serviceHours} horas inician como máximo a las 08:00 AM para cumplir la jornada diurna completa.
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PASO 6: MÉTODO DE PAGO Y NOTAS */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <span className="font-mono text-xs font-bold text-electric-600">06</span>
                  <h3 className="text-sm font-bold text-neutral-900">Método de Pago y Notas</h3>
                </div>

                {/* Métodos de Pago Electrónicos Únicamente */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-2">
                    Selecciona tu Método de Pago Electrónico:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Opción 1: SIPAP / Transferencia */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("sipap")}
                      className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                        paymentMethod === "sipap"
                          ? "bg-electric-50/70 border-electric-500 ring-2 ring-electric-500/20 shadow-xs"
                          : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          paymentMethod === "sipap" ? "bg-electric-600 text-white" : "bg-neutral-100 text-neutral-700"
                        }`}>
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Transferencia Bancaria (SIPAP)</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Banco GNB / Itaú / Visión (RUC oficial)</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentMethod === "sipap" ? "border-electric-600 bg-electric-600 text-white" : "border-neutral-300"
                      }`}>
                        {paymentMethod === "sipap" && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>

                    {/* Opción 2: Tarjeta / QR */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                        paymentMethod === "card"
                          ? "bg-electric-50/70 border-electric-500 ring-2 ring-electric-500/20 shadow-xs"
                          : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          paymentMethod === "card" ? "bg-electric-600 text-white" : "bg-neutral-100 text-neutral-700"
                        }`}>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Tarjeta de Débito / Crédito / QR</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Pago digital seguro o código QR</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentMethod === "card" ? "border-electric-600 bg-electric-600 text-white" : "border-neutral-300"
                      }`}>
                        {paymentMethod === "card" && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
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
                    <span>
                      Base ({serviceHours} Horas
                      {datesCount > 1 ? ` x ${datesCount} días` : ""}):
                    </span>
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
                      <span>Descuento por Frecuencia ({pricing.discountPercentage}%):</span>
                      <span>-{formatGs(pricing.discountAmount)}</span>
                    </div>
                  )}
                  {selectedCleanerId && (
                    <div className="flex justify-between text-electric-700 font-semibold text-[11px] pt-1">
                      <span>Colaborador preferido:</span>
                      <span>{availableEmployees.find(e => e.id === selectedCleanerId)?.name || "Seleccionado"}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500 text-[11px] pt-1">
                    <span>Fecha:</span>
                    <span>
                      {(frequency === "multi_weekly" || frequency === "weekly_2_4") && selectedDates.length > 1
                        ? `${selectedDates.length} fechas (${selectedDates.map(d => d.slice(8, 10)).join(", ")})`
                        : `${serviceDate || "Por seleccionar"} (${serviceTime} hs)`}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">Total a abonar</p>
                  <div className="text-3xl font-bold text-neutral-950 mt-0.5">
                    {formatGs(pricing.finalPrice)}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    ✓ Sin pagos por adelantado. Abonarás al finalizar el servicio.
                  </p>
                </div>

                {/* Botón de Confirmación Siempre Activo */}
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-electric-600 hover:bg-electric-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-electric transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
