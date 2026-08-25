"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Booking, User } from "@/types";

// Componentes modulares del Portal
import PortalHeader from "@/components/portal/PortalHeader";
import PortalStats from "@/components/portal/PortalStats";
import PortalTabs from "@/components/portal/PortalTabs";
import ActiveBookingsTab from "@/components/portal/ActiveBookingsTab";
import HistoryBookingsTab from "@/components/portal/HistoryBookingsTab";
import InvoicesTab from "@/components/portal/InvoicesTab";
import AddressesTab from "@/components/portal/AddressesTab";
import ProfileTab from "@/components/portal/ProfileTab";
import GuaranteeTab from "@/components/portal/GuaranteeTab";

// Modales
import ReceiptModal from "@/components/portal/ReceiptModal";
import KudeInvoiceModal from "@/components/portal/KudeInvoiceModal";
import ReviewModal from "@/components/portal/ReviewModal";
import AddressModal from "@/components/portal/AddressModal";
import { SavedPortalAddress, PortalTabType, PORTAL_ZONES } from "@/components/portal/types";

export default function CustomerPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PortalTabType>("ACTIVE");

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
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressNotice, setAddressNotice] = useState<string | null>(null);

  // Formulario de Dirección (Crear / Editar)
  const [addrLabel, setAddrLabel] = useState("Casa");
  const [addrZone, setAddrZone] = useState(PORTAL_ZONES[0].name);
  const [addrStreet, setAddrStreet] = useState("");
  const [addrApt, setAddrApt] = useState("");
  const [addrRef, setAddrRef] = useState("");
  const [addrLat, setAddrLat] = useState(PORTAL_ZONES[0].lat);
  const [addrLng, setAddrLng] = useState(PORTAL_ZONES[0].lng);
  const [addrIsDefault, setAddrIsDefault] = useState(false);

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

  const showProfileNotice = (msg: string) => {
    setProfileNotice(msg);
    setTimeout(() => setProfileNotice(null), 4000);
  };

  // Cargar reservas y perfil del usuario
  const loadPortalData = async () => {
    try {
      setIsLoading(true);
      const [bookingsRes, profileRes] = await Promise.all([
        fetch("/api/bookings?self=true", { cache: "no-store" }),
        fetch("/api/user/profile", { cache: "no-store" }),
      ]);

      let loadedBookings: Booking[] = [];
      let loadedProfile: User | null = null;

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        const rawBookings: Booking[] = data.bookings || [];
        
        if (session?.user?.email) {
          const myEmail = session.user.email.toLowerCase().trim();
          const myId = (session.user as any)?.id;
          loadedBookings = rawBookings.filter((b) => 
            (b.customerEmail && b.customerEmail.toLowerCase().trim() === myEmail) ||
            (myId && b.userId && b.userId === myId)
          );
        } else {
          loadedBookings = rawBookings;
        }
        
        setBookings(loadedBookings);
      }

      if (profileRes.ok) {
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

      const normalizeAddr = (str: string) => {
        return (str || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/gi, "")
          .trim();
      };

      const addrs: SavedPortalAddress[] = [];

      try {
        const local = localStorage.getItem("aquiestamos_saved_addresses");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed.forEach((a: SavedPortalAddress) => {
              if (a.address && !isDeleted(a.address, a.id)) {
                const norm = normalizeAddr(a.address);
                const exists = addrs.some(
                  (item) => normalizeAddr(item.address) === norm || item.id === a.id
                );
                if (!exists) {
                  addrs.push(a);
                }
              }
            });
          }
        }
      } catch (e) {}

      if (loadedProfile?.address && !isDeleted(loadedProfile.address, "profile_main")) {
        const norm = normalizeAddr(loadedProfile.address);
        const exists = addrs.some((a) => normalizeAddr(a.address) === norm);
        if (!exists) {
          addrs.unshift({
            id: "profile_main",
            label: "Casa Principal",
            address: loadedProfile.address,
            street: loadedProfile.address,
            latitude: -25.2831,
            longitude: -57.5612,
            isDefault: true,
          });
        }
      }

      setUserAddresses(addrs);
      localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(addrs));
    } catch (err) {
      console.error("Error al cargar datos del portal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadPortalData();
    }
  }, [status]);

  // Guardar perfil y datos fiscales
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          address: profileAddress,
          ruc: profileRuc,
          taxName: profileTaxName,
        }),
      });

      if (res.ok) {
        showProfileNotice("¡Tus datos personales y fiscales han sido actualizados con éxito!");
        setUserProfile((prev) => prev ? {
          ...prev,
          name: profileName,
          phone: profilePhone,
          address: profileAddress,
          ruc: profileRuc,
          taxName: profileTaxName,
        } : null);
      } else {
        alert("Hubo un error al actualizar los datos.");
      }
    } catch (err) {
      alert("Error de conexión al guardar perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Abrir Modal de Registro de Nueva Dirección
  const handleOpenAddAddress = () => {
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setAddrLabel("Casa");
    setAddrZone(PORTAL_ZONES[0].name);
    setAddrStreet("");
    setAddrApt("");
    setAddrRef("");
    setAddrLat(PORTAL_ZONES[0].lat);
    setAddrLng(PORTAL_ZONES[0].lng);
    setAddrIsDefault(userAddresses.length === 0);
    setAddressModalOpen(true);
  };

  // Abrir Modal de Edición de Dirección
  const handleOpenEditAddress = (addr: SavedPortalAddress) => {
    setIsEditingAddress(true);
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || "Casa");
    setAddrZone(addr.zone || PORTAL_ZONES[0].name);
    setAddrStreet(addr.street || addr.address || "");
    setAddrApt(addr.apartment || "");
    setAddrRef(addr.reference || "");
    setAddrLat(addr.latitude || PORTAL_ZONES[0].lat);
    setAddrLng(addr.longitude || PORTAL_ZONES[0].lng);
    setAddrIsDefault(Boolean(addr.isDefault));
    setAddressModalOpen(true);
  };

  // Guardar (Crear o Actualizar) Dirección
  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim()) return;

    let fullAddress = addrStreet.trim();
    if (addrApt.trim()) fullAddress += `, ${addrApt.trim()}`;
    if (addrZone.trim() && !fullAddress.includes(addrZone.split(" ")[0])) {
      fullAddress += ` - ${addrZone}`;
    }

    if (isEditingAddress && editingAddressId) {
      const updated = userAddresses.map((a) => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            label: addrLabel.trim() || "Casa",
            address: fullAddress,
            street: addrStreet.trim(),
            apartment: addrApt.trim(),
            reference: addrRef.trim(),
            zone: addrZone,
            latitude: addrLat,
            longitude: addrLng,
            isDefault: addrIsDefault,
          };
        }
        return addrIsDefault ? { ...a, isDefault: false } : a;
      });

      setUserAddresses(updated);
      localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
      showAddressNotice("¡Dirección actualizada correctamente!");
    } else {
      const newAddress: SavedPortalAddress = {
        id: `addr_${Date.now()}`,
        label: addrLabel.trim() || "Casa",
        address: fullAddress,
        street: addrStreet.trim(),
        apartment: addrApt.trim(),
        reference: addrRef.trim(),
        zone: addrZone,
        latitude: addrLat,
        longitude: addrLng,
        isDefault: addrIsDefault,
      };

      const updated = addrIsDefault
        ? [newAddress, ...userAddresses.map(a => ({ ...a, isDefault: false }))]
        : [newAddress, ...userAddresses];

      setUserAddresses(updated);
      localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
      showAddressNotice("¡Nueva ubicación guardada con éxito!");
    }

    if (addrIsDefault) {
      fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: fullAddress }),
      }).catch(() => {});
    }

    setAddressModalOpen(false);
  };

  // Establecer como Principal
  const handleSetDefaultAddress = async (addr: SavedPortalAddress) => {
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr.address }),
      });

      const updated = userAddresses.map((a) => ({
        ...a,
        isDefault: a.id === addr.id,
      }));
      setUserAddresses(updated);
      localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));
      showAddressNotice(`✓ "${addr.label}" establecida como tu dirección principal.`);
    } catch (e) {
      alert("Error al actualizar dirección principal.");
    }
  };

  // Eliminar Dirección
  const handleDeleteAddress = (id: string, label: string) => {
    if (!confirm(`¿Eliminar definitivamente la dirección "${label}"?`)) return;

    const toDelete = userAddresses.find(a => a.id === id);
    const updated = userAddresses.filter((a) => a.id !== id);
    setUserAddresses(updated);
    localStorage.setItem("aquiestamos_saved_addresses", JSON.stringify(updated));

    if (toDelete) {
      try {
        const deletedList: string[] = JSON.parse(localStorage.getItem("aquiestamos_deleted_addresses") || "[]");
        if (toDelete.address) deletedList.push(toDelete.address.toLowerCase().trim());
        deletedList.push(toDelete.id);
        localStorage.setItem("aquiestamos_deleted_addresses", JSON.stringify(deletedList));
      } catch (e) {}
    }

    showAddressNotice(`Dirección "${label}" eliminada.`);
  };

  // Enviar Reseña / Calificación
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForReview.id,
          rating,
          comment,
          serviceType: `${(selectedBookingForReview as any).hours || selectedBookingForReview.serviceHours || 4} Horas (${selectedBookingForReview.frequency === "once" ? "Única" : "Recurrente"})`,
        }),
      });

      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewSuccess(false);
          setReviewModalOpen(false);
          loadPortalData();
        }, 2000);
      } else {
        alert("Error al enviar calificación.");
      }
    } catch (err) {
      alert("Error de conexión.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-electric-600" />
        </div>
        <p className="text-xs font-bold text-slate-500">Cargando tu portal de cliente seguro...</p>
      </div>
    );
  }

  const activeBookingsCount = bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
  ).length;

  const historyBookingsCount = bookings.filter((b) =>
    b.status === "COMPLETED" || b.status === "CANCELLED"
  ).length;

  const invoicesCount = bookings.filter((b) => b.status !== "CANCELLED").length;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16">
      
      {/* Fondo superior decorativo con degradado suave */}
      <div className="w-full h-32 bg-gradient-to-b from-slate-900 to-transparent opacity-5 absolute top-0 left-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 relative z-10">
        
        {/* 1. Header Protagonista con Identidad de Marca */}
        <PortalHeader
          user={userProfile}
          userName={session?.user?.name || profileName}
          userEmail={session?.user?.email || ""}
          activeCount={activeBookingsCount}
        />

        {/* 2. KPIs y Estadísticas de Servicios */}
        <PortalStats
          bookings={bookings}
          savedAddressesCount={userAddresses.length}
        />

        {/* 3. Navegación de Pestañas Moderna y Responsive */}
        <PortalTabs
          activeTab={activeTab}
          onTabChange={(t) => setActiveTab(t)}
          activeCount={activeBookingsCount}
          historyCount={historyBookingsCount}
          invoicesCount={invoicesCount}
          addressesCount={userAddresses.length}
        />

        {/* 4. Contenido Dinámico de la Pestaña Activa */}
        <div className="pt-1">
          {activeTab === "ACTIVE" && (
            <ActiveBookingsTab
              bookings={bookings}
              onOpenReceipt={(b) => setReceiptBooking(b)}
              onOpenInvoice={(b) => setInvoiceBooking(b)}
            />
          )}

          {activeTab === "HISTORY" && (
            <HistoryBookingsTab
              bookings={bookings}
              onOpenReview={(b) => {
                setSelectedBookingForReview(b);
                setRating(5);
                setComment("");
                setReviewModalOpen(true);
              }}
              onOpenReceipt={(b) => setReceiptBooking(b)}
              onOpenInvoice={(b) => setInvoiceBooking(b)}
            />
          )}

          {activeTab === "INVOICES" && (
            <InvoicesTab
              bookings={bookings}
              userProfile={userProfile}
              onOpenInvoice={(b) => setInvoiceBooking(b)}
            />
          )}

          {activeTab === "ADDRESSES" && (
            <AddressesTab
              addresses={userAddresses}
              onOpenAddModal={handleOpenAddAddress}
              onOpenEditModal={handleOpenEditAddress}
              onSetDefault={handleSetDefaultAddress}
              onDelete={handleDeleteAddress}
              noticeMessage={addressNotice}
            />
          )}

          {activeTab === "PROFILE" && (
            <ProfileTab
              userProfile={userProfile}
              name={profileName}
              setName={setProfileName}
              phone={profilePhone}
              setPhone={setProfilePhone}
              address={profileAddress}
              setAddress={setProfileAddress}
              ruc={profileRuc}
              setRuc={setProfileRuc}
              taxName={profileTaxName}
              setTaxName={setProfileTaxName}
              onSubmit={handleSaveProfile}
              isSaving={isSavingProfile}
              noticeMessage={profileNotice}
            />
          )}

          {activeTab === "GUARANTEE" && (
            <GuaranteeTab />
          )}
        </div>

      </div>

      {/* MODALES */}
      {/* 1. Modal de Recibo Digital */}
      <ReceiptModal
        booking={receiptBooking}
        onClose={() => setReceiptBooking(null)}
      />

      {/* 2. Modal de Factura Electrónica KUDE SIFEN */}
      <KudeInvoiceModal
        booking={invoiceBooking}
        userProfile={userProfile}
        onClose={() => setInvoiceBooking(null)}
      />

      {/* 3. Modal de Calificación con Estrellas */}
      <ReviewModal
        booking={selectedBookingForReview}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onSubmit={handleSubmitReview}
        onClose={() => setReviewModalOpen(false)}
        isSubmitting={reviewSubmitting}
        isSuccess={reviewSuccess}
      />

      {/* 4. Modal de Dirección (Crear / Editar con Google Maps) */}
      <AddressModal
        isOpen={addressModalOpen}
        isEditing={isEditingAddress}
        label={addrLabel}
        setLabel={setAddrLabel}
        zone={addrZone}
        setZone={setAddrZone}
        street={addrStreet}
        setStreet={setAddrStreet}
        apartment={addrApt}
        setApartment={setAddrApt}
        reference={addrRef}
        setReference={setAddrRef}
        lat={addrLat}
        setLat={setAddrLat}
        lng={addrLng}
        setLng={setAddrLng}
        isDefault={addrIsDefault}
        setIsDefault={setAddrIsDefault}
        onSubmit={handleSubmitAddress}
        onClose={() => setAddressModalOpen(false)}
      />

    </main>
  );
}
