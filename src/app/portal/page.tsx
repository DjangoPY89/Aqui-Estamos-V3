"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Star, 
  RotateCcw,
  Sparkles,
  Phone,
  ExternalLink,
  ShieldCheck,
  Receipt,
  User as UserIcon,
  Home,
  Save,
  MessageSquare,
  HelpCircle,
  Award,
  ArrowRight,
  Check,
  FileText,
  Printer,
  FolderOpen,
  Download,
  Share2,
  Building,
  CreditCard,
  QrCode,
  Edit3,
  Trash2,
  Navigation,
  Compass
} from "lucide-react";
import dynamic from "next/dynamic";
import { Booking, User } from "@/types";
import { formatGs } from "@/lib/pricing";

const GoogleMapPicker = dynamic(() => import("@/components/booking/GoogleMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs animate-pulse">
      Cargando Google Maps...
    </div>
  ),
});

const PORTAL_ZONES = [
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

interface SavedPortalAddress {
  id: string;
  label: string;
  address: string;
  street?: string;
  apartment?: string;
  reference?: string;
  zone?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export default function CustomerPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY" | "INVOICES" | "ADDRESSES" | "PROFILE" | "GUARANTEE">("ACTIVE");

  // Formulario de perfil y datos fiscales
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileRuc, setProfileRuc] = useState("");
  const [profileTaxName, setProfileTaxName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // Gestión de Direcciones Guardadas del Cliente
  const [userAddresses, setUserAddresses] = useState<SavedPortalAddress[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressNotice, setAddressNotice] = useState<string | null>(null);

  // Formulario: Registrar Nueva Dirección Detallada
  const [newAddrLabel, setNewAddrLabel] = useState("Casa");
  const [newAddrZone, setNewAddrZone] = useState(PORTAL_ZONES[0].name);
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrApt, setNewAddrApt] = useState("");
  const [newAddrRef, setNewAddrRef] = useState("");
  const [newAddrLat, setNewAddrLat] = useState(PORTAL_ZONES[0].lat);
  const [newAddrLng, setNewAddrLng] = useState(PORTAL_ZONES[0].lng);
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  // Formulario Modal: Editar Dirección
  const [editingAddress, setEditingAddress] = useState<SavedPortalAddress | null>(null);
  const [editAddrLabel, setEditAddrLabel] = useState("");
  const [editAddrZone, setEditAddrZone] = useState(PORTAL_ZONES[0].name);
  const [editAddrStreet, setEditAddrStreet] = useState("");
  const [editAddrApt, setEditAddrApt] = useState("");
  const [editAddrRef, setEditAddrRef] = useState("");
  const [editAddrLat, setEditAddrLat] = useState(PORTAL_ZONES[0].lat);
  const [editAddrLng, setEditAddrLng] = useState(PORTAL_ZONES[0].lng);
  const [editAddrIsDefault, setEditAddrIsDefault] = useState(false);

  // Modal para Calificar / Reseña
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Modal de Comprobante / Recibo Digital Simple
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Modal de Factura Electrónica Legal Oficial (KUDE / SIFEN)
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login?callbackUrl=/portal";
    }
  }, [status]);

  const showAddressNotice = (msg: string) => {
    setAddressNotice(msg);
    setTimeout(() => setAddressNotice(null), 4000);
  };

  // Cargar reservas y perfil del usuario
  const loadPortalData = async () => {
    try {
      setIsLoading(true);
      const [bookingsRes, profileRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/user/profile"),
      ]);

      let loadedBookings: Booking[] = [];
      let loadedProfile: User | null = null;

      if (bookingsRes.ok) {
        try {
          const contentType = bookingsRes.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await bookingsRes.json();
            loadedBookings = data.bookings || [];
            setBookings(loadedBookings);
          }
        } catch (e) {
          console.warn("No se pudo parsear respuesta de reservas:", e);
        }
      }

      if (profileRes.ok) {
        try {
          const contentType = profileRes.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await profileRes.json();
            if (data.user) {
              loadedProfile = data.user;
              setUserProfile(data.user);
              setProfileName(data.user.name || "");
              setProfilePhone(data.user.phone || "");
              setProfileAddress(data.user.address || "");
              setProfileRuc(data.user.ruc || "");
              setProfileTaxName(data.user.taxName || "");
            }
          }
        } catch (e) {
          console.warn("No se pudo parsear respuesta de perfil:", e);
        }
      }

      // Reconstruir lista consolidada de direcciones guardadas
      let deletedList: string[] = [];
      try {
        deletedList = JSON.parse(localStorage.getItem("aquiestamos_deleted_addresses") || "[]");
      } catch (e) {}

      const isDeleted = (addrText?: string, idText?: string) => {
        if (!addrText && !idText) return false;
        const norm = (addrText || "").toLowerCase().trim();
        return deletedList.includes(norm) || (idText ? deletedList.includes(idText) : false);
      };

      const addrs: SavedPortalAddress[] = [];

      // 1. Cargar desde localStorage
      try {
        const local = localStorage.getItem("aquiestamos_saved_addresses");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed.forEach((a: SavedPortalAddress) => {
              if (!isDeleted(a.address, a.id)) {
                addrs.push(a);
              }
            });
          }
        }
      } catch (e) {}

      // 2. Si no estaba en localStorage ni fue borrada, cargar dirección de perfil de BD
      if (loadedProfile?.address && !isDeleted(loadedProfile.address, "profile_main")) {
        const exists = addrs.some(a => a.address.toLowerCase().trim() === loadedProfile!.address!.toLowerCase().trim());
        if (!exists) {
          addrs.unshift({
            id: "profile_main",
            label: "🏠 Hogar Principal",
            address: loadedProfile.address,
            street: loadedProfile.address,
            latitude: -25.2831,
            longitude: -57.5612,
            isDefault: true,
          });
        } else {
          addrs.forEach(a => {
            if (a.address.toLowerCase().trim() === loadedProfile!.address!.toLowerCase().trim()) {
              a.isDefault = true;
            }
          });
        }
      }

      // 3. Si no hay direcciones o para primer inicio, cargar de reservas no borradas
      const hasInitialized = localStorage.getItem("aquiestamos_addresses_initialized") === "true";
      if (!hasInitialized && loadedBookings.length > 0) {
        loadedBookings.forEach((b: any) => {
          if (b.address && !isDeleted(b.address, `bk_${b.id}`)) {
            const exists = addrs.some(a => a.address.toLowerCase().trim() === b.address.toLowerCase().trim());
            if (!exists) {
              addrs.push({
                id: `bk_${b.id}`,
                label: `📍 ${b.address.split(",")[0]}`,
                address: b.address,
                street: b.address,
                latitude: b.latitude || -25.2831,
                longitude: b.longitude || -57.5612,
                isDefault: false,
              });
            }
          }
        });
      }

      setUserAddresses(addrs);
      localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(addrs));
    } catch (err) {
      console.error("Error al cargar datos del portal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Establecer dirección como principal en perfil
  const handleSetDefaultAddress = async (addr: SavedPortalAddress) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr.address }),
      });

      if (res.ok) {
        setProfileAddress(addr.address);
        const updated = userAddresses.map((a) => ({
          ...a,
          isDefault: a.id === addr.id,
        }));
        setUserAddresses(updated);
        localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
        showAddressNotice(`✓ "${addr.label}" establecida como tu dirección principal.`);
      }
    } catch (e) {
      alert("Error al actualizar dirección principal.");
    }
  };

  // Eliminar dirección definitivamente
  const handleDeleteAddress = (id: string) => {
    const target = userAddresses.find((a) => a.id === id);
    if (!target) return;

    if (!confirm(`¿Deseas eliminar "${target.label}" de tus direcciones guardadas?`)) return;

    // 1. Guardar en blacklist persistente de eliminadas
    let deletedList: string[] = [];
    try {
      deletedList = JSON.parse(localStorage.getItem("aquiestamos_deleted_addresses") || "[]");
    } catch (e) {}

    const norm = target.address.toLowerCase().trim();
    if (!deletedList.includes(norm)) deletedList.push(norm);
    if (target.id && !deletedList.includes(target.id)) deletedList.push(target.id);
    localStorage.setItem("aquiestamos_deleted_addresses", JSON.stringify(deletedList));
    localStorage.setItem("aquiestamos_addresses_initialized", "true");

    // 2. Si era la dirección principal en BD o perfil, vaciarla en el servidor
    if (target.isDefault || (userProfile?.address && userProfile.address.toLowerCase().trim() === norm)) {
      setProfileAddress("");
      fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: "" }),
      }).catch(() => {});
    }

    // 3. Filtrar de la lista activa y guardar en localStorage
    const updated = userAddresses.filter((a) => a.id !== id);
    setUserAddresses(updated);
    localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
    showAddressNotice(`✓ Dirección "${target.label}" eliminada definitivamente.`);
  };

  // Guardar nueva dirección detallada
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) {
      alert("Por favor ingresa la calle y numeración.");
      return;
    }

    const fullParts = [newAddrStreet.trim()];
    if (newAddrApt.trim()) fullParts.push(newAddrApt.trim());
    if (newAddrZone.trim()) fullParts.push(newAddrZone.trim());
    if (newAddrRef.trim()) fullParts.push(`(Ref: ${newAddrRef.trim()})`);
    const fullAddress = fullParts.join(", ");

    const newEntry: SavedPortalAddress = {
      id: `addr_${Date.now()}`,
      label: newAddrLabel.trim() || "Mi Ubicación",
      address: fullAddress,
      street: newAddrStreet.trim(),
      apartment: newAddrApt.trim(),
      reference: newAddrRef.trim(),
      zone: newAddrZone,
      latitude: newAddrLat,
      longitude: newAddrLng,
      isDefault: newAddrIsDefault,
    };

    let updated = [newEntry, ...userAddresses.filter(a => a.address.toLowerCase() !== newEntry.address.toLowerCase())];

    if (newAddrIsDefault) {
      updated = updated.map(a => ({ ...a, isDefault: a.id === newEntry.id }));
      setProfileAddress(newEntry.address);
      fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newEntry.address }),
      }).catch(() => {});
    }

    // Limpiar de la lista de eliminadas si estaba previamente
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem("aquiestamos_deleted_addresses") || "[]");
      const filtered = deletedList.filter(d => d !== newEntry.address.toLowerCase().trim());
      localStorage.setItem("aquiestamos_deleted_addresses", JSON.stringify(filtered));
    } catch (e) {}

    setUserAddresses(updated);
    localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
    localStorage.setItem("aquiestamos_addresses_initialized", "true");
    setIsAddingAddress(false);
    setNewAddrStreet("");
    setNewAddrApt("");
    setNewAddrRef("");
    setNewAddrLabel("Casa");
    setNewAddrIsDefault(false);
    showAddressNotice(`✓ Dirección "${newEntry.label}" guardada con coordenadas GPS.`);
  };

  // Abrir modal de edición
  const handleOpenEditAddress = (addr: SavedPortalAddress) => {
    setEditingAddress(addr);
    setEditAddrLabel(addr.label);
    setEditAddrStreet(addr.street || addr.address.split(",")[0] || addr.address);
    setEditAddrApt(addr.apartment || "");
    setEditAddrRef(addr.reference || "");
    setEditAddrZone(addr.zone || PORTAL_ZONES[0].name);
    setEditAddrLat(addr.latitude || PORTAL_ZONES[0].lat);
    setEditAddrLng(addr.longitude || PORTAL_ZONES[0].lng);
    setEditAddrIsDefault(Boolean(addr.isDefault));
  };

  // Guardar edición de dirección existente
  const handleSaveEditedAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress || !editAddrStreet.trim()) return;

    const fullParts = [editAddrStreet.trim()];
    if (editAddrApt.trim()) fullParts.push(editAddrApt.trim());
    if (editAddrZone.trim()) fullParts.push(editAddrZone.trim());
    if (editAddrRef.trim()) fullParts.push(`(Ref: ${editAddrRef.trim()})`);
    const fullAddress = fullParts.join(", ");

    const updatedItem: SavedPortalAddress = {
      ...editingAddress,
      label: editAddrLabel.trim() || "Mi Ubicación",
      address: fullAddress,
      street: editAddrStreet.trim(),
      apartment: editAddrApt.trim(),
      reference: editAddrRef.trim(),
      zone: editAddrZone,
      latitude: editAddrLat,
      longitude: editAddrLng,
      isDefault: editAddrIsDefault,
    };

    let updated = userAddresses.map(a => a.id === editingAddress.id ? updatedItem : a);

    if (editAddrIsDefault) {
      updated = updated.map(a => ({ ...a, isDefault: a.id === editingAddress.id }));
      setProfileAddress(updatedItem.address);
      fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: updatedItem.address }),
      }).catch(() => {});
    }

    setUserAddresses(updated);
    localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
    setEditingAddress(null);
    showAddressNotice("✓ Dirección y ubicación GPS actualizadas correctamente.");
  };

  useEffect(() => {
    if (session?.user) {
      loadPortalData();
    }
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileNotice(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          phone: profilePhone.trim(),
          address: profileAddress.trim(),
          ruc: profileRuc.trim(),
          taxName: profileTaxName.trim(),
        }),
      });

      if (res.ok) {
        setProfileNotice("✓ Tus datos, dirección y datos de facturación se guardaron con éxito.");
        setTimeout(() => setProfileNotice(null), 4000);
        loadPortalData();
      } else {
        alert("Error al actualizar tus datos.");
      }
    } catch (err) {
      alert("Error de conexión al guardar perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("¿Deseas cancelar este servicio? Recuerda que si necesitas cambiar de horario puedes solicitarlo directamente por WhatsApp sin costo.")) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        loadPortalData();
      } else {
        alert("No se pudo cancelar la reserva.");
      }
    } catch (err) {
      alert("Error al cancelar la reserva.");
    }
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setComment("");
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          serviceType: `${selectedBookingForReview?.serviceHours} Horas (${selectedBookingForReview?.bookingNumber})`,
          userName: session?.user?.name || "Cliente",
        }),
      });

      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      alert("Error al enviar la calificación.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Reordenar / Repetir Servicio en 1 Clic
  const handleRepeatBooking = (booking: Booking) => {
    const extrasQuery = booking.extras && booking.extras.length > 0 ? `&extras=${booking.extras.join(",")}` : "";
    router.push(`/reservar?hours=${booking.serviceHours}&freq=${booking.frequency}${extrasQuery}`);
  };

  // Generador de número de Factura Electrónica coherente
  const getInvoiceNumber = (booking: Booking) => {
    const numericPart = booking.bookingNumber.replace(/\D/g, "");
    const invoiceSeq = numericPart.padStart(7, "0").slice(-7);
    return `001-002-${invoiceSeq}`;
  };

  // Generador de CDC (Código de Control Fiscal Paraguayo)
  const getCdcCode = (booking: Booking) => {
    const cleanId = booking.id.replace(/\D/g, "") || "99283741";
    return `01800987654001002${cleanId.padEnd(20, "0").slice(0, 20)}2026110001`;
  };

  const activeBookings = bookings.filter((b) => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status));
  const historyBookings = bookings.filter((b) => ["COMPLETED", "CANCELLED"].includes(b.status));
  const validInvoices = bookings.filter((b) => b.status !== "CANCELLED");

  const totalSpent = validInvoices.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalIvaCreditoFiscal = Math.round(totalSpent / 11);
  const totalHours = validInvoices.reduce((acc, b) => acc + (b.serviceHours || 0), 0);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-electric-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-neutral-600">Cargando tu portal de cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/80 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Encabezado del Portal */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Usuario"}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-electric-100 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-electric-sm">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900">{session?.user?.name}</h1>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Cliente Verificado
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{session?.user?.email}</p>
              {profileAddress && (
                <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-electric-600" />
                  <span className="truncate max-w-sm">{profileAddress}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/595984320528?text=Hola%20tengo%20una%20consulta%20sobre%20mis%20servicios%20o%20facturas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Soporte WhatsApp</span>
            </a>

            <Link
              href="/reservar"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Reserva</span>
            </Link>
          </div>
        </div>

        {/* Tarjetas KPI de Resumen del Cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-neutral-400">Servicios Contratados</p>
            <p className="text-2xl font-black text-neutral-900 mt-1">{bookings.length}</p>
            <p className="text-[11px] text-electric-600 mt-0.5 font-semibold">
              {activeBookings.length} programados / en curso
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-neutral-400">Facturas Electrónicas</p>
            <p className="text-2xl font-black text-electric-600 mt-1">{validInvoices.length} Emitidas</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Disponibles con validez fiscal DNIT</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-neutral-400">IVA Crédito Fiscal (10%)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatGs(totalIvaCreditoFiscal)}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Deducible para tu IRP o IVA</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-neutral-400">Garantía Aquí Estamos</p>
            <p className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
              <Award className="w-5 h-5" />
              <span>200% Activa</span>
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Personal con IPS y seguro total</p>
          </div>
        </div>

        {/* Pestañas de Navegación del Portal */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "ACTIVE"
                ? "bg-electric-600 text-white shadow-electric-xs"
                : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Próximas Reservas ({activeBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "HISTORY"
                ? "bg-electric-600 text-white shadow-electric-xs"
                : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historial ({historyBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("INVOICES")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "INVOICES"
                ? "bg-electric-600 text-white shadow-electric-xs"
                : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>📂 Tus Facturas Digitales ({validInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ADDRESSES")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "ADDRESSES"
                ? "bg-electric-600 text-white shadow-electric-xs"
                : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>📍 Mis Direcciones ({userAddresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "PROFILE"
                ? "bg-electric-600 text-white shadow-electric-xs"
                : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Mis Datos & RUC</span>
          </button>

          <button
            onClick={() => setActiveTab("GUARANTEE")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "GUARANTEE"
                ? "bg-electric-600 text-white shadow-electric-xs"
                : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Garantía 200%</span>
          </button>
        </div>

        {/* TAB 1: RESERVAS ACTIVAS */}
        {activeTab === "ACTIVE" && (
          <div>
            {activeBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-electric-50 text-electric-600 flex items-center justify-center mx-auto">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">No tienes reservas activas</h3>
                <p className="text-xs text-neutral-500">
                  Agenda tu próxima limpieza en menos de 60 segundos con tarifa plana en Guaraníes.
                </p>
                <Link
                  href="/reservar"
                  className="inline-block px-6 py-3 bg-electric-600 hover:bg-electric-700 text-white text-xs font-bold rounded-xl shadow-electric transition-all"
                >
                  Agendar Servicio Ahora
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-sm flex flex-col justify-between hover:border-electric-200 transition-colors"
                  >
                    <div>
                      {/* Cabecera de Reserva */}
                      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                        <div>
                          <span className="text-xs font-mono font-bold text-electric-600 bg-electric-50 px-2.5 py-1 rounded-md border border-electric-100">
                            {b.bookingNumber}
                          </span>
                          <h3 className="text-lg font-black text-neutral-900 mt-2">
                            {b.serviceHours} Horas de Limpieza
                          </h3>
                        </div>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : b.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-electric-50 text-electric-800 border border-electric-200"
                          }`}
                        >
                          {b.status === "CONFIRMED" ? "CONFIRMADA" : b.status === "IN_PROGRESS" ? "EN CURSO" : "PENDIENTE"}
                        </span>
                      </div>

                      {/* Detalles Clave */}
                      <div className="space-y-3 text-xs text-neutral-700 mb-6">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-electric-600 shrink-0" />
                          <span>Fecha programada: <strong>{b.serviceDate}</strong></span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-electric-600 shrink-0" />
                          <span>Horario de inicio: <strong>{b.serviceTime} hs</strong></span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 truncate">
                            <MapPin className="w-4 h-4 text-electric-600 shrink-0" />
                            <span className="truncate">Dirección: <strong>{b.address}</strong></span>
                          </div>
                          {b.latitude && b.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-electric-600 hover:text-electric-800 text-[11px] font-bold flex items-center gap-1 shrink-0 bg-electric-50 hover:bg-electric-100 px-2 py-0.5 rounded-lg border border-electric-200 transition-colors"
                            >
                              <span>Ver Mapa GPS</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Personal Asignado con Certificación IPS */}
                        <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/90 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-electric-600 shrink-0" />
                              <span className="font-bold text-neutral-900">
                                {b.assignedCleaner || "Asignando personal especializado..."}
                              </span>
                            </div>
                            {b.assignedCleaner && (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                IPS Activo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            {b.assignedCleaner 
                              ? "Personal con verificación de antecedentes y cobertura médica laboral." 
                              : "Te notificaremos cuando el limpiador esté confirmado."}
                          </p>
                        </div>

                        {b.extras && b.extras.length > 0 && (
                          <div className="flex items-center gap-2 pt-1">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Extras incluidos: <strong>{b.extras.join(", ")}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pie: Precio y Acciones */}
                    <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase">Total del Servicio</p>
                        <p className="text-xl font-black text-neutral-900">{formatGs(b.totalPrice)}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Ver Factura Digital */}
                        <button
                          type="button"
                          onClick={() => setInvoiceBooking(b)}
                          className="px-3 py-2 text-xs font-bold text-electric-700 hover:bg-electric-50 rounded-xl border border-electric-200 transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-electric-600" />
                          <span>Factura Digital</span>
                        </button>

                        {/* WhatsApp Soporte */}
                        <a
                          href={`https://wa.me/595984320528?text=Hola%20tengo%20una%20consulta%20sobre%20mi%20reserva%20${b.bookingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                          title="Contactar soporte / coordinar acceso"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        {/* Cancelar */}
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORIAL DE SERVICIOS */}
        {activeTab === "HISTORY" && (
          <div>
            {historyBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto space-y-2">
                <Clock className="w-10 h-10 text-neutral-300 mx-auto" />
                <h3 className="text-base font-bold text-neutral-800">Sin servicios anteriores</h3>
                <p className="text-xs text-neutral-500">Aquí aparecerán tus limpiezas finalizadas y comprobantes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {historyBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-neutral-500">{b.bookingNumber}</span>
                        <p className="text-base font-black text-neutral-900">{b.serviceHours} Horas — {b.serviceDate}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                          b.status === "COMPLETED" ? "bg-slate-100 text-slate-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {b.status === "COMPLETED" ? "COMPLETADO" : "CANCELADO"}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 space-y-1">
                      <p>Dirección: <span className="font-semibold text-neutral-800">{b.address}</span></p>
                      {b.assignedCleaner && (
                        <p>Atendido por: <span className="font-semibold text-neutral-800">{b.assignedCleaner}</span></p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase">Monto</p>
                        <p className="text-base font-black text-neutral-900">{formatGs(b.totalPrice)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInvoiceBooking(b)}
                          className="px-3 py-1.5 bg-electric-50 hover:bg-electric-100 text-electric-800 rounded-lg text-xs font-bold border border-electric-200 transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-electric-600" />
                          <span>Factura</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRepeatBooking(b)}
                          className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-bold border border-neutral-200 transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-neutral-600" />
                          <span>Repetir</span>
                        </button>

                        {b.status === "COMPLETED" && (
                          <button
                            type="button"
                            onClick={() => handleOpenReview(b)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Calificar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CARPETA DE FACTURAS DIGITALES */}
        {activeTab === "INVOICES" && (
          <div className="space-y-6">
            
            {/* Cabecera y Resumen Fiscal */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-neutral-900">Carpeta de Facturas Digitales</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Documentos Tributarios Electrónicos oficiales con IVA 10% incluido (DNIT / SET Paraguay).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Facturado</span>
                  <span className="text-base font-black text-neutral-900">{formatGs(totalSpent)}</span>
                </div>
                <div className="h-8 w-px bg-neutral-200" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">IVA Crédito Fiscal (10%)</span>
                  <span className="text-base font-black text-emerald-600">{formatGs(totalIvaCreditoFiscal)}</span>
                </div>
              </div>
            </div>

            {/* Ficha Informativa de Datos de Facturación */}
            <div className="bg-electric-50/60 p-4 sm:p-5 rounded-2xl border border-electric-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-electric-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-electric-950 block">Datos de Facturación Registrados:</span>
                  <span className="text-electric-800 font-medium">
                    {profileTaxName || profileName || "Consumidor Final"} • RUC/C.I.: {profileRuc || profilePhone || "Sin RUC registrado"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("PROFILE")}
                className="px-3.5 py-1.5 bg-white hover:bg-electric-50 text-electric-700 font-bold text-xs rounded-xl border border-electric-300 shadow-xs transition-colors shrink-0"
              >
                Modificar RUC / Datos
              </button>
            </div>

            {/* Listado de Facturas */}
            {validInvoices.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto space-y-3">
                <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
                <h3 className="text-base font-bold text-neutral-800">No tienes facturas emitidas</h3>
                <p className="text-xs text-neutral-500">Tus facturas electrónicas se generarán automáticamente al contratar un servicio.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-700">
                    <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="px-6 py-4">N° Factura / CDC</th>
                        <th className="px-6 py-4">Fecha de Emisión</th>
                        <th className="px-6 py-4">Concepto / Servicio</th>
                        <th className="px-6 py-4">Total (IVA Inc.)</th>
                        <th className="px-6 py-4">IVA 10%</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {validInvoices.map((b) => {
                        const invNumber = getInvoiceNumber(b);
                        const iva10 = Math.round(b.totalPrice / 11);
                        return (
                          <tr key={b.id} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-mono font-bold text-neutral-900">{invNumber}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">Timbrado: 16854920</p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-semibold text-neutral-900">{b.serviceDate}</p>
                              <p className="text-[11px] text-neutral-400">{b.serviceTime} hs</p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-bold text-neutral-900">Limpieza Residencial ({b.serviceHours} hs)</p>
                              <p className="text-[11px] text-neutral-500 truncate max-w-xs">{b.address}</p>
                            </td>

                            <td className="px-6 py-4 font-black text-neutral-900">
                              {formatGs(b.totalPrice)}
                            </td>

                            <td className="px-6 py-4 font-semibold text-emerald-700">
                              {formatGs(iva10)}
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Válida / Emitida
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setInvoiceBooking(b)}
                                  className="px-3 py-1.5 bg-electric-600 hover:bg-electric-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                                  title="Ver Factura Legal Oficial"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Ver Factura</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: ADMINISTRACIÓN DE DIRECCIONES GUARDADAS */}
        {activeTab === "ADDRESSES" && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-electric-600" />
                  <span>Mis Direcciones Guardadas ({userAddresses.length})</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                  Administra tus casas, oficinas y departamentos. Al agendar una nueva limpieza, podrás seleccionarlas con 1 clic sin necesidad de mover el pin en el mapa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="px-4 py-2.5 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingAddress ? "Cerrar Formulario" : "Agregar Nueva Dirección"}</span>
              </button>
            </div>

            {/* Alerta de notificación */}
            {addressNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{addressNotice}</span>
              </div>
            )}

            {/* Formulario para Agregar Nueva Dirección Detallada */}
            {isAddingAddress && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-electric-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-electric-50 text-electric-600 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-neutral-900">Registrar Nueva Dirección Detallada</h4>
                      <p className="text-xs text-neutral-500">Ingresa los datos exactos y fija el pin en el mapa para ubicar la entrada</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs font-bold text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    ✕ Cancelar
                  </button>
                </div>

                <form onSubmit={handleSaveNewAddress} className="space-y-5">
                  {/* Fila 1: Etiqueta y Zona */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-4 space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        Nombre / Etiqueta de la Propiedad *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddrLabel}
                        onChange={(e) => setNewAddrLabel(e.target.value)}
                        placeholder="Ej: Casa, Oficina, Depto Carmelitas"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                      />
                      {/* Botones rápidos de etiqueta */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {["🏠 Casa", "🏢 Oficina", "🏬 Depto", "🌳 Quinta"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setNewAddrLabel(tag.replace(/^[^\w\s]+/, "").trim())}
                            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-medium rounded-md transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-8 space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        Zona / Ciudad *
                      </label>
                      <select
                        value={newAddrZone}
                        onChange={(e) => {
                          const zName = e.target.value;
                          setNewAddrZone(zName);
                          const found = PORTAL_ZONES.find((z) => z.name === zName);
                          if (found) {
                            setNewAddrLat(found.lat);
                            setNewAddrLng(found.lng);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none bg-white"
                      >
                        {PORTAL_ZONES.map((z) => (
                          <option key={z.name} value={z.name}>
                            📍 {z.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-neutral-400">Seleccionar una zona centrará automáticamente el mapa.</p>
                    </div>
                  </div>

                  {/* Fila 2: Calle principal y Edificio/Depto */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-7 space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        Calle Principal y Numeración Exacta *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        placeholder="Ej: Avda. Santa Teresa 2250 e/ Cnel. Escurra"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-5 space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        Edificio / Depto / Piso <span className="text-neutral-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={newAddrApt}
                        onChange={(e) => setNewAddrApt(e.target.value)}
                        placeholder="Ej: Torre 2, Piso 8, Depto 802"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fila 3: Referencias de Acceso */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      Referencias de Acceso / Timbre / Portón <span className="text-neutral-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={newAddrRef}
                      onChange={(e) => setNewAddrRef(e.target.value)}
                      placeholder="Ej: Portón negro al lado de la farmacia, tocar timbre 8B o avisar en portería"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                    />
                  </div>

                  {/* Fila 4: Mapa Interactivo con Google Maps & Pin */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Fijar Entrada Exacta en Google Maps (Pin Rojo 3D)</span>
                      </label>
                      <span className="text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        GPS: {newAddrLat.toFixed(5)}, {newAddrLng.toFixed(5)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Arrastra el punto rojo sobre la entrada exacta de tu casa o edificio para guiar al personal.
                    </p>

                    <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
                      <GoogleMapPicker
                        latitude={newAddrLat}
                        longitude={newAddrLng}
                        currentAddress={newAddrStreet || newAddrZone}
                        onLocationChange={(coords) => {
                          setNewAddrLat(coords.lat);
                          setNewAddrLng(coords.lng);
                          if (coords.addressSuggestion && !newAddrStreet) {
                            setNewAddrStreet(coords.addressSuggestion);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Fila 5: Checkbox de Principal y Botones */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-neutral-100">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newAddrIsDefault}
                        onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-electric-600 border-neutral-300 focus:ring-electric-500 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-700 font-medium">
                        Establecer como mi dirección principal / habitual
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-electric-600 hover:bg-electric-700 text-white text-xs font-bold rounded-xl shadow-electric transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar Dirección</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Grid de Direcciones Guardadas */}
            {userAddresses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-electric-50 text-electric-600 flex items-center justify-center mx-auto">
                  <Home className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">No tienes direcciones guardadas</h3>
                <p className="text-xs text-neutral-500">
                  Agrega tu primera dirección para que el sistema complete tus reservas con 1 solo clic.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Dirección</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-2xs relative ${
                      addr.isDefault 
                        ? "border-emerald-300 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/20 to-white" 
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            addr.isDefault ? "bg-emerald-600 text-white shadow-xs" : "bg-neutral-100 text-neutral-600"
                          }`}>
                            <Home className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 leading-tight">{addr.label}</h4>
                            {addr.isDefault ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200 mt-0.5">
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                Habitual / Principal
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-400">Secundaria</span>
                            )}
                          </div>
                        </div>

                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr)}
                            className="text-[10px] font-bold text-neutral-500 hover:text-emerald-700 bg-neutral-100 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors border border-neutral-200"
                            title="Convertir en dirección principal"
                          >
                            Hacer Principal
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                        {addr.address}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400 font-mono text-[10px]">
                          📍 GPS: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-electric-600 hover:text-electric-700 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <span>Ver en Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <Link
                        href="/reservar"
                        className="flex-1 py-1.5 px-3 bg-electric-50 hover:bg-electric-100 text-electric-700 rounded-lg text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Reservar Aquí</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Editar nombre, dirección y mapa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar de guardadas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MIS DATOS, HOGAR Y DATOS FISCALES */}
        {activeTab === "PROFILE" && (
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-electric-600" />
                <span>Mis Datos, Hogar y Facturación</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Guarda tus datos personales y fiscales (RUC) para que tus facturas salgan automáticamente a tu nombre o empresa.
              </p>
            </div>

            {profileNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    disabled
                    value={session?.user?.email || ""}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-500 text-xs cursor-not-allowed"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Vinculado a tu cuenta de acceso</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Ej: 0981 123 456"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Dirección Habitual (Casa / Edificio / Depto)
                </label>
                <textarea
                  rows={2}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Ej: Avda. Santa Teresa 2250, Edificio Trinity Towers, Depto 802, Asunción"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              {/* Sección Datos de Facturación (RUC) */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 pt-3">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-electric-600" />
                  <span>Datos Fiscales para Factura Electrónica (DNIT / SET)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      Razón Social / Nombre en Factura
                    </label>
                    <input
                      type="text"
                      value={profileTaxName}
                      onChange={(e) => setProfileTaxName(e.target.value)}
                      placeholder="Ej: Juan Solalinde o Mi Empresa S.A."
                      className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-xs bg-white focus:ring-2 focus:ring-electric-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      RUC o Cédula con DV
                    </label>
                    <input
                      type="text"
                      value={profileRuc}
                      onChange={(e) => setProfileRuc(e.target.value)}
                      placeholder="Ej: 3456789-0 o 80012345-6"
                      className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-xs bg-white focus:ring-2 focus:ring-electric-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? "Guardando..." : "Guardar Preferencias"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: GARANTÍA 200% & ASISTENCIA */}
        {activeTab === "GUARANTEE" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Garantía de Satisfacción 200%</h3>
                  <p className="text-xs text-neutral-500">Tu tranquilidad y confianza son nuestra máxima prioridad.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
                  <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Retoque Sin Costo</span>
                  </p>
                  <p className="text-neutral-600">
                    Si algún detalle o área no quedó impecable, enviaremos personal a retocarla dentro de las 24hs sin costo alguno.
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
                  <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-electric-600" />
                    <span>Personal 100% Legal e IPS</span>
                  </p>
                  <p className="text-neutral-600">
                    Todo el equipo cuenta con seguro médico de IPS y verificación de antecedentes penales.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-electric-50 rounded-2xl border border-electric-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-electric-900 text-xs">¿Necesitas ayuda o reportar un detalle?</p>
                  <p className="text-[11px] text-electric-700">Atención directa e inmediata con nuestro equipo de supervisión.</p>
                </div>
                <a
                  href="https://wa.me/595984320528?text=Hola%20deseo%20activar%20mi%20garant%C3%ADa%20o%20hacer%20un%20reclamo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric-xs transition-colors shrink-0"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal para Editar Dirección Guardada con Google Maps */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-electric-50 text-electric-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Editar Dirección y Ubicación GPS</h3>
                  <p className="text-[11px] text-neutral-500">Ajusta los detalles del inmueble y mueve el pin en el mapa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAddress(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedAddress} className="space-y-4">
              {/* Fila 1: Etiqueta y Zona */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-4 space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    Etiqueta de la Propiedad *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddrLabel}
                    onChange={(e) => setEditAddrLabel(e.target.value)}
                    placeholder="Ej: Casa, Oficina, Depto"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-8 space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    Zona / Ciudad *
                  </label>
                  <select
                    value={editAddrZone}
                    onChange={(e) => {
                      const zName = e.target.value;
                      setEditAddrZone(zName);
                      const found = PORTAL_ZONES.find((z) => z.name === zName);
                      if (found) {
                        setEditAddrLat(found.lat);
                        setEditAddrLng(found.lng);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none bg-white"
                  >
                    {PORTAL_ZONES.map((z) => (
                      <option key={z.name} value={z.name}>
                        📍 {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 2: Calle y Depto */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-7 space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    Calle Principal y Numeración Exacta *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddrStreet}
                    onChange={(e) => setEditAddrStreet(e.target.value)}
                    placeholder="Ej: Avda. Santa Teresa 2250"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    Edificio / Depto / Piso
                  </label>
                  <input
                    type="text"
                    value={editAddrApt}
                    onChange={(e) => setEditAddrApt(e.target.value)}
                    placeholder="Ej: Torre 2, Piso 8, Depto 802"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fila 3: Referencias */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  Referencias de Acceso / Timbre / Portón
                </label>
                <input
                  type="text"
                  value={editAddrRef}
                  onChange={(e) => setEditAddrRef(e.target.value)}
                  placeholder="Ej: Portón negro, timbre 8B"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              {/* Fila 4: Mapa Google Maps */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Fijar Entrada en Google Maps (Pin Rojo 3D)</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    GPS: {editAddrLat.toFixed(5)}, {editAddrLng.toFixed(5)}
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
                  <GoogleMapPicker
                    latitude={editAddrLat}
                    longitude={editAddrLng}
                    currentAddress={editAddrStreet || editAddrZone}
                    onLocationChange={(coords) => {
                      setEditAddrLat(coords.lat);
                      setEditAddrLng(coords.lng);
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editAddrIsDefault}
                    onChange={(e) => setEditAddrIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-electric-600 border-neutral-300 focus:ring-electric-500 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Establecer como mi dirección principal
                  </span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-electric-600 hover:bg-electric-700 text-white text-xs font-bold rounded-xl shadow-electric transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL OFICIAL: FACTURA ELECTRÓNICA LEGAL (KUDE - DNIT / SET) */}
      {invoiceBooking && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-300 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
            
            {/* Barra Superior de Controles */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Factura Electrónica — Validez Fiscal Paraguay (DNIT / SET)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setInvoiceBooking(null)}
                  className="text-slate-400 hover:text-white font-bold text-base px-1.5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Documento KUDE Tributario */}
            <div className="p-6 sm:p-8 space-y-6 text-xs text-neutral-900 bg-white">
              
              {/* Encabezado Emisor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b-2 border-neutral-900">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight">AQUÍ ESTAMOS S.A.</h2>
                  <p className="text-[11px] text-neutral-600 font-medium">Servicios Profesionales de Limpieza y Mantenimiento</p>
                  <p className="text-[11px] text-neutral-500">Casa Matriz: Avda. Aviadores del Chaco 2050, Asunción</p>
                  <p className="text-[11px] text-neutral-500">Tel: +595 984 320 528 • Email: facturacion@aquiestamos.com</p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-300 text-center sm:text-right space-y-1">
                  <p className="font-mono font-bold text-xs text-neutral-900">RUC: 80098765-4</p>
                  <p className="font-bold text-xs text-electric-600">TIMBRADO N°: 16854920</p>
                  <p className="text-[10px] text-neutral-500">Vigencia: 01/01/2026 al 31/12/2026</p>
                  <div className="pt-1 border-t border-neutral-200">
                    <p className="font-black text-sm text-neutral-900 font-mono">
                      FACTURA ELECTRÓNICA
                    </p>
                    <p className="font-mono font-bold text-sm text-neutral-900">
                      N° {getInvoiceNumber(invoiceBooking)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos del Receptor / Cliente */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Fecha y Hora de Emisión</span>
                    <span className="font-bold text-neutral-900">{invoiceBooking.serviceDate} — {invoiceBooking.serviceTime} hs</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Condición de Venta</span>
                    <span className="font-bold text-neutral-900 uppercase">CONTADO ({invoiceBooking.paymentMethod})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-neutral-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Razón Social / Nombre</span>
                    <span className="font-black text-neutral-900">{profileTaxName || invoiceBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">RUC / C.I.</span>
                    <span className="font-mono font-bold text-neutral-900">{profileRuc || invoiceBooking.customerPhone || "4.567.890-1"}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Dirección</span>
                  <span className="font-medium text-neutral-700">{invoiceBooking.address}</span>
                </div>
              </div>

              {/* Tabla de Ítems / Conceptos */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-300">
                    <tr>
                      <th className="px-3 py-2 text-center w-12">Cant.</th>
                      <th className="px-3 py-2">Descripción</th>
                      <th className="px-3 py-2 text-right">Precio Unit.</th>
                      <th className="px-3 py-2 text-right">Exentas</th>
                      <th className="px-3 py-2 text-right">5%</th>
                      <th className="px-3 py-2 text-right">10% (Gs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    <tr>
                      <td className="px-3 py-2.5 text-center font-bold">1</td>
                      <td className="px-3 py-2.5">
                        <p className="font-bold text-neutral-900">Servicio de Limpieza Residencial Integral</p>
                        <p className="text-[10px] text-neutral-500 font-mono">Orden: {invoiceBooking.bookingNumber} • {invoiceBooking.serviceHours} Horas</p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatGs(invoiceBooking.totalPrice)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-neutral-400">0</td>
                      <td className="px-3 py-2.5 text-right font-mono text-neutral-400">0</td>
                      <td className="px-3 py-2.5 text-right font-bold text-neutral-900">{formatGs(invoiceBooking.totalPrice)}</td>
                    </tr>
                    {invoiceBooking.extras && invoiceBooking.extras.length > 0 && (
                      <tr>
                        <td className="px-3 py-2 text-center font-bold">{invoiceBooking.extras.length}</td>
                        <td className="px-3 py-2 text-neutral-700">Servicios Adicionales ({invoiceBooking.extras.join(", ")})</td>
                        <td className="px-3 py-2 text-right text-neutral-500">Incluido</td>
                        <td className="px-3 py-2 text-right font-mono text-neutral-400">0</td>
                        <td className="px-3 py-2 text-right font-mono text-neutral-400">0</td>
                        <td className="px-3 py-2 text-right text-neutral-400">0</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Liquidación de IVA y Totales */}
              <div className="space-y-3">
                <div className="bg-neutral-100 p-3.5 rounded-xl border border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 block">Liquidación del IVA (Ley N° 6380/19):</span>
                    <span className="text-[11px] text-neutral-600">
                      (5%): 0 Gs. &nbsp;|&nbsp; <strong>(10%): {formatGs(Math.round(invoiceBooking.totalPrice / 11))}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total IVA Liquidado</span>
                    <span className="text-sm font-black text-emerald-700">{formatGs(Math.round(invoiceBooking.totalPrice / 11))}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
                  <span className="text-sm font-black tracking-wide uppercase">TOTAL A PAGAR (GUARANÍES):</span>
                  <span className="text-xl font-black text-emerald-400">{formatGs(invoiceBooking.totalPrice)}</span>
                </div>
              </div>

              {/* CDC Fiscal y Pie de Consulta SET */}
              <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-neutral-500">
                <div className="space-y-0.5 text-center sm:text-left">
                  <p className="font-bold text-neutral-800">Código de Control CDC (SIFEN):</p>
                  <p className="font-mono text-[9px] text-neutral-600 break-all">{getCdcCode(invoiceBooking)}</p>
                  <p>Consulte la validez de este Documento Electrónico en: https://ekuatia.set.gov.py/consultas</p>
                </div>
                <div className="w-14 h-14 bg-neutral-100 border border-neutral-300 rounded-lg flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-neutral-800" />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Modal de Calificación */}
      {reviewModalOpen && selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            {reviewSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-neutral-900">¡Gracias por tu reseña!</h3>
                <p className="text-xs text-neutral-500">Tu opinión nos ayuda a premiar a nuestro mejor personal.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-black text-neutral-900">Califica tu Servicio</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Servicio {selectedBookingForReview.bookingNumber} ({selectedBookingForReview.serviceDate})
                  </p>
                </div>

                {/* Selector de Estrellas */}
                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-neutral-100 text-neutral-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Tu Comentario o Experiencia *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="¿Qué tal fue la atención y puntualidad del profesional de limpieza?"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-1 py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric disabled:opacity-50"
                  >
                    {reviewSubmitting ? "Enviando..." : "Publicar Calificación"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal para Editar Dirección Guardada */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-electric-50 text-electric-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Editar Dirección Guardada</h3>
                  <p className="text-[11px] text-neutral-500">Modifica el nombre o los detalles del inmueble</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAddress(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Nombre / Etiqueta de la Propiedad *
                </label>
                <input
                  type="text"
                  required
                  value={editingAddress.label}
                  onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                  placeholder="Ej: Casa, Oficina, Depto Carmelitas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Dirección Exacta *
                  </label>
                  <span className="text-[10px] text-neutral-400">Calle, Nro, Depto / Edificio</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={editingAddress.address}
                  onChange={(e) => setEditingAddress({ ...editingAddress, address: e.target.value })}
                  placeholder="Ej: Avda. Santa Teresa 2250, Edificio Trinity Towers, Depto 802, Asunción"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />

                {/* Chips de zona rápida */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-400 self-center">Añadir zona:</span>
                  {[
                    "Villa Morra, Asunción",
                    "Ykua Satî, Asunción",
                    "Santa Teresa, Asunción",
                    "Carmelitas, Asunción",
                    "Luque",
                    "San Lorenzo",
                    "Lambaré",
                  ].map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => {
                        if (!editingAddress.address.includes(zone)) {
                          setEditingAddress({
                            ...editingAddress,
                            address: editingAddress.address ? `${editingAddress.address}, ${zone}` : zone,
                          });
                        }
                      }}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-md text-[10px] text-neutral-700 font-medium transition-colors"
                    >
                      + {zone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingAddress.isDefault)}
                    onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-electric-600 border-neutral-300 focus:ring-electric-500 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-700 font-medium select-none">
                    Establecer como mi dirección principal
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-electric-600 hover:bg-electric-700 text-white text-xs font-bold rounded-xl shadow-electric transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
