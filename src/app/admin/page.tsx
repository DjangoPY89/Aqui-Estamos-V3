"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Edit3, 
  UserCheck, 
  Phone, 
  MapPin, 
  RefreshCw,
  Mail,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Award,
  Sparkles,
  UserPlus,
  Trash2,
  Shuffle,
  Briefcase,
  Star,
  Check,
  Download,
  CalendarPlus,
  MessageSquare,
  Send,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  TrendingUp,
  PlusCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Layers,
  Activity,
  CalendarDays,
  X,
  SlidersHorizontal,
  Home
} from "lucide-react";
import { Booking, CorporateLead, Employee, User } from "@/types";
import { formatGs } from "@/lib/pricing";

interface AdminUser extends User {
  totalBookings: number;
  totalSpentGs: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<any>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenueGs: 0,
    totalLeads: 0,
    newLeads: 0,
    totalUsers: 0,
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<CorporateLead[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"BOOKINGS" | "EMPLOYEES" | "CUSTOMERS" | "LEADS" | "ANALYTICS" | "CALENDAR">("BOOKINGS");
  const [quickViewFilter, setQuickViewFilter] = useState<"ALL" | "TODAY" | "THIS_WEEK" | "UNASSIGNED" | "CONFIRMED" | "COMPLETED">("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [showCharts, setShowCharts] = useState(true);

  // Estados de Ordenamiento Dinámico de Columnas
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Estado de Asignación Automática
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal para crear nueva cita manual
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [newBookingName, setNewBookingName] = useState("");
  const [newBookingPhone, setNewBookingPhone] = useState("");
  const [newBookingEmail, setNewBookingEmail] = useState("");
  const [newBookingAddress, setNewBookingAddress] = useState("");
  const [newBookingDate, setNewBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newBookingTime, setNewBookingTime] = useState("09:00");
  const [newBookingHours, setNewBookingHours] = useState<number>(4);
  const [newBookingCleaner, setNewBookingCleaner] = useState("");
  const [newBookingStatus, setNewBookingStatus] = useState<Booking["status"]>("CONFIRMED");
  const [newBookingFrequency, setNewBookingFrequency] = useState<string>("once");
  const [newBookingPrice, setNewBookingPrice] = useState<number>(143000);
  const [newBookingExtras, setNewBookingExtras] = useState<string[]>([]);
  const [isSubmittingNewBooking, setIsSubmittingNewBooking] = useState(false);

  // Modal para editar reserva individual
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [modalStatus, setModalStatus] = useState<Booking["status"]>("PENDING");
  const [modalCleaner, setModalCleaner] = useState("");
  const [modalCustomerName, setModalCustomerName] = useState("");
  const [modalCustomerPhone, setModalCustomerPhone] = useState("");
  const [modalCustomerEmail, setModalCustomerEmail] = useState("");
  const [modalAddress, setModalAddress] = useState("");
  const [modalServiceDate, setModalServiceDate] = useState("");
  const [modalServiceTime, setModalServiceTime] = useState("08:00");
  const [modalServiceHours, setModalServiceHours] = useState<number>(6);
  const [modalTotalPrice, setModalTotalPrice] = useState<number>(0);
  const [modalPaymentMethod, setModalPaymentMethod] = useState<string>("cash");
  const [modalPaymentStatus, setModalPaymentStatus] = useState<string>("PENDING");
  const [modalNotes, setModalNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Modal para agregar nuevo empleado
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpCi, setNewEmpCi] = useState("");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpZone, setNewEmpZone] = useState("Asunción (Villa Morra / Ykua Satî)");
  const [newEmpIps, setNewEmpIps] = useState(true);
  const [isSubmittingEmp, setIsSubmittingEmp] = useState(false);

  // Modal para editar dirección y datos del cliente
  const [editingCustomer, setEditingCustomer] = useState<AdminUser | null>(null);
  const [customerEditName, setCustomerEditName] = useState("");
  const [customerEditPhone, setCustomerEditPhone] = useState("");
  const [customerEditAddress, setCustomerEditAddress] = useState("");
  const [customerEditRuc, setCustomerEditRuc] = useState("");
  const [customerEditTaxName, setCustomerEditTaxName] = useState("");
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  const handleOpenEditCustomer = (u: AdminUser) => {
    setEditingCustomer(u);
    setCustomerEditName(u.name || "");
    setCustomerEditPhone(u.phone || "");
    setCustomerEditAddress(u.address || "");
    setCustomerEditRuc((u as any).ruc || "");
    setCustomerEditTaxName((u as any).taxName || "");
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setIsSavingCustomer(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingCustomer.id,
          name: customerEditName.trim(),
          phone: customerEditPhone.trim(),
          address: customerEditAddress.trim(),
          ruc: customerEditRuc.trim(),
          taxName: customerEditTaxName.trim(),
        }),
      });

      if (res.ok) {
        showNotification(`✓ Dirección y datos de ${customerEditName || "cliente"} actualizados.`);
        setEditingCustomer(null);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar datos del cliente.");
      }
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      alert("Error al conectar con el servidor.");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Estados de Login para Administrador
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setAdminAuthLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail.trim().toLowerCase(),
          password: adminPassword,
        }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: "No se pudo procesar la respuesta del servidor." };
      }

      if (res.ok && data.ok) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: adminEmail.trim().toLowerCase(),
          password: adminPassword,
          callbackUrl: "/admin",
        });

        if (loginRes?.ok) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/admin";
        }
      } else {
        setAdminAuthError(data.error || "Credenciales incorrectas.");
        setAdminAuthLoading(false);
      }
    } catch (err: any) {
      console.error("Error en login admin:", err);
      setAdminAuthError("No se pudo alcanzar el servidor. Verifica tu conexión e intenta de nuevo.");
      setAdminAuthLoading(false);
    }
  };

  // Cargar datos solo si es ADMIN
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      loadData();
    }
  }, [status, session]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bRes, lRes, uRes, eRes, sRes] = await Promise.all([
        fetch("/api/bookings?limit=200", { cache: "no-store" }),
        fetch("/api/corporate", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/employees", { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" })
      ]);

      if (bRes.ok) {
        const data = await bRes.json();
        setBookings(data.bookings || []);
      }
      if (lRes.ok) {
        const data = await lRes.json();
        setLeads(data.leads || []);
      }
      if (uRes.ok) {
        const data = await uRes.json();
        setUsers(data.users || []);
      }
      if (eRes.ok) {
        const data = await eRes.json();
        setEmployees(data.employees || []);
      }
      if (sRes.ok) {
        const data = await sRes.json();
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Error al cargar datos del panel:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 4000);
  };

  // Asignar Empleado Rápido con 1 Clic
  const handleQuickAssignCleaner = async (bookingId: string, cleanerName: string) => {
    try {
      if (cleanerName === "RANDOM") {
        const activeEmployees = employees.filter((e) => e.status === "ACTIVE");
        if (activeEmployees.length === 0) {
          alert("No hay empleados activos disponibles para asignar.");
          return;
        }
        const randomIndex = Math.floor(Math.random() * activeEmployees.length);
        cleanerName = `${activeEmployees[randomIndex].name}`;
      } else if (cleanerName === "UNASSIGNED") {
        cleanerName = "";
      }

      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedCleaner: cleanerName || null }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, assignedCleaner: cleanerName } : b))
        );
        showNotification(
          cleanerName
            ? `✓ Personal "${cleanerName}" asignado con éxito.`
            : "✓ Asignación retirada de la reserva."
        );
      }
    } catch (err) {
      console.error("Error en asignación rápida:", err);
    }
  };

  // Asignación Aleatoria Masiva a Todas las Reservas sin Asignar
  const handleAutoAssignAll = async () => {
    const unassigned = bookings.filter(
      (b) => !b.assignedCleaner || b.assignedCleaner === "Sin Asignar" || b.assignedCleaner === "Sin asignar"
    );

    if (unassigned.length === 0) {
      alert("Todas las reservas ya tienen personal asignado.");
      return;
    }

    setIsAutoAssigning(true);
    try {
      const res = await fetch("/api/admin/bookings/auto-assign", {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(`🎲 ¡Éxito! Se asignó personal al azar a ${data.assignedCount} reservas.`);
        loadData();
      } else {
        alert(data.error || "Error al realizar asignación automática.");
      }
    } catch (err) {
      console.error("Error en auto-assign:", err);
      alert("Error de conexión al asignar personal.");
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Crear Nuevo Empleado
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpPhone.trim()) {
      alert("Por favor completa el nombre y teléfono.");
      return;
    }

    setIsSubmittingEmp(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEmpName.trim(),
          ci: newEmpCi.trim(),
          phone: newEmpPhone.trim(),
          email: newEmpEmail.trim() || undefined,
          zone: newEmpZone.trim(),
          ipsVerified: newEmpIps,
        }),
      });

      if (res.ok) {
        showNotification(`✓ Empleado "${newEmpName}" agregado exitosamente.`);
        setIsCreatingEmployee(false);
        setNewEmpName("");
        setNewEmpCi("");
        setNewEmpPhone("");
        setNewEmpEmail("");
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al crear empleado.");
      }
    } catch (err) {
      alert("Error de conexión.");
    } finally {
      setIsSubmittingEmp(false);
    }
  };

  // Eliminar empleado
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de quitar al empleado "${name}"? Las reservas que tenga asignadas quedarán sin asignar.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/employees?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification(`✓ Empleado "${name}" eliminado del sistema.`);
        loadData();
      } else {
        alert("Error al eliminar el empleado.");
      }
    } catch (err) {
      console.error("Error al eliminar empleado:", err);
    }
  };

  // Alternar estado de IPS (Verificado / En Trámite) con 1 Clic
  const handleToggleIps = async (id: string, currentIps: boolean) => {
    try {
      const newIps = !currentIps;
      const res = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ipsVerified: newIps }),
      });
      if (res.ok) {
        showNotification(
          newIps 
            ? "✓ Estado IPS actualizado: IPS Activo y Verificado." 
            : "⏳ Estado IPS actualizado: En Trámite."
        );
        loadData();
      }
    } catch (err) {
      console.error("Error al actualizar IPS:", err);
    }
  };

  // Cambiar estado de empleado (Activo / Inactivo / Licencia)
  const handleEmployeeStatusChange = async (id: string, newStatus: Employee["status"]) => {
    try {
      const res = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Error al actualizar estado de empleado:", err);
    }
  };

  // Funciones de sincronización y vista estilo Google Spreadsheet
  const getAssignedEmployee = (cleanerName?: string | null): Employee | null => {
    if (!cleanerName) return null;
    const clean = cleanerName.toLowerCase().trim();
    return (
      employees.find((e) => {
        const empName = e.name.toLowerCase().trim();
        return clean.includes(empName) || empName.includes(clean);
      }) || null
    );
  };

  const handleQuickStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus as any } : b))
        );
        showNotification(`✓ Estado de reserva actualizado a "${newStatus}".`);
      }
    } catch (err) {
      console.error("Error al actualizar estado rápido:", err);
    }
  };

  const EMPLOYEE_COLORS = [
    { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    { bg: "bg-purple-500", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
    { bg: "bg-sky-500", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
    { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
    { bg: "bg-indigo-500", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
    { bg: "bg-teal-500", text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-500" },
    { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
    { bg: "bg-cyan-500", text: "text-cyan-700", border: "border-cyan-200", dot: "bg-cyan-500" },
  ];

  const getEmployeeColor = (name?: string | null) => {
    if (!name || name === "UNASSIGNED" || name === "Sin Asignar") {
      return { bg: "bg-slate-300", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-300" };
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % EMPLOYEE_COLORS.length;
    return EMPLOYEE_COLORS[index];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { label: "Confirmado", bg: "bg-emerald-50/90 hover:bg-emerald-100/80", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/80" };
      case "IN_PROGRESS":
        return { label: "En Curso", bg: "bg-amber-50/90 hover:bg-amber-100/80", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-200/80" };
      case "COMPLETED":
        return { label: "Finalizado", bg: "bg-slate-100/90 hover:bg-slate-200/80", text: "text-slate-800", dot: "bg-slate-500", border: "border-slate-300/80" };
      case "CANCELLED":
        return { label: "Cancelado", bg: "bg-rose-50/90 hover:bg-rose-100/80", text: "text-rose-800", dot: "bg-rose-500", border: "border-rose-200/80" };
      default:
        return { label: "Pendiente", bg: "bg-sky-50/90 hover:bg-sky-100/80", text: "text-sky-800", dot: "bg-sky-500", border: "border-sky-200/80" };
    }
  };

  const generateWhatsAppCustomerUrl = (b: Booking) => {
    const raw = (b.customerPhone || "").replace(/\D/g, "");
    const phone = raw.startsWith("595") ? raw : raw.startsWith("0") ? `595${raw.substring(1)}` : `595${raw}`;
    const extrasStr = b.extras && b.extras.length > 0 ? b.extras.join(", ") : "Ninguno";
    const mapsLink = b.latitude && b.longitude
      ? `https://www.google.com/maps?q=${b.latitude},${b.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
    const msg = `¡Hola ${b.customerName}! 🧼 Te saludamos de *Aquí Estamos*. Te confirmamos tu servicio de limpieza agendado:\n\n📅 *Fecha:* ${b.serviceDate}\n⏰ *Hora:* ${b.serviceTime} hs (${b.serviceHours} Horas)\n📍 *Dirección:* ${b.address}\n🗺️ *Ubicación en Google Maps:* ${mapsLink}\n✨ *Extras:* ${extrasStr}\n💰 *Total:* ${formatGs(b.totalPrice)}\n👤 *Personal:* ${b.assignedCleaner || "Asignación en curso"}\n\n¿Deseas confirmar o tienes alguna consulta?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const generateWhatsAppEmployeeUrl = (b: Booking, emp: Employee) => {
    const raw = (emp.phone || "").replace(/\D/g, "");
    const phone = raw.startsWith("595") ? raw : raw.startsWith("0") ? `595${raw.substring(1)}` : `595${raw}`;
    const extrasStr = b.extras && b.extras.length > 0 ? b.extras.join(", ") : "Ninguno";
    const mapsLink = b.latitude && b.longitude
      ? `https://www.google.com/maps?q=${b.latitude},${b.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
    const msg = `¡Hola ${emp.name}! 👋 Tienes un nuevo servicio de limpieza asignado:\n\n📅 *Fecha:* ${b.serviceDate}\n⏰ *Hora:* ${b.serviceTime} hs (${b.serviceHours} Horas)\n👤 *Cliente:* ${b.customerName} (Tel: ${b.customerPhone})\n📍 *Dirección:* ${b.address}\n🗺️ *Ubicación en Google Maps:* ${mapsLink}\n✨ *Extras:* ${extrasStr}\n📝 *Notas:* ${b.notes || "Ninguna"}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const generateGoogleCalendarUrl = (b: Booking) => {
    const dateFormatted = b.serviceDate.replace(/-/g, "");
    const timeParts = (b.serviceTime || "09:00").split(":");
    const startHour = parseInt(timeParts[0] || "9", 10);
    const startMin = timeParts[1] || "00";
    const endHour = startHour + (b.serviceHours || 4);
    
    const startIso = `${dateFormatted}T${startHour.toString().padStart(2, "0")}${startMin}00`;
    const endIso = `${dateFormatted}T${endHour.toString().padStart(2, "0")}${startMin}00`;
    
    const title = `Limpieza Aquí Estamos - ${b.customerName} (${b.bookingNumber})`;
    const details = `Servicio de Limpieza (${b.serviceHours} Horas)\nCliente: ${b.customerName}\nTeléfono: ${b.customerPhone}\nEmail: ${b.customerEmail}\nPersonal: ${b.assignedCleaner || "Por confirmar"}\nTotal: ${formatGs(b.totalPrice)}`;
    const location = b.address;
    const calId = "6995kk35n4bc196tnd07q3onahg0t2lh@import.calendar.google.com";
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&src=${encodeURIComponent(calId)}&add=${encodeURIComponent(calId)}&ctz=America/Asuncion`;
  };

  const exportToCSV = () => {
    const headers = [
      "Fecha Registro",
      "Nombre",
      "Teléfono",
      "Email",
      "Horas",
      "Extras",
      "Total",
      "Fecha Servicio",
      "Hora",
      "Dirección",
      "Ubicación Maps",
      "Frecuencia",
      "Empleado Asignado",
      "Estatus",
      "Telefono del Empleado",
      "E-mail Empleados"
    ];

    const rows = sortedBookings.map((b) => {
      const emp = getAssignedEmployee(b.assignedCleaner);
      const extrasStr = b.extras && b.extras.length > 0 ? b.extras.join(", ") : "Ninguno";
      const mapsLink = b.latitude && b.longitude
        ? `https://www.google.com/maps?q=${b.latitude},${b.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
      
      const createdDate = b.createdAt ? new Date(b.createdAt).toLocaleString("es-PY") : "";

      return [
        `"${createdDate}"`,
        `"${(b.customerName || "").replace(/"/g, '""')}"`,
        `"${b.customerPhone || ""}"`,
        `"${b.customerEmail || ""}"`,
        `"${b.serviceHours || ""}"`,
        `"${extrasStr.replace(/"/g, '""')}"`,
        `"${b.totalPrice || 0}"`,
        `"${b.serviceDate || ""}"`,
        `"${b.serviceTime || ""}"`,
        `"${(b.address || "").replace(/"/g, '""')}"`,
        `"${mapsLink}"`,
        `"${b.frequency || "once"}"`,
        `"${(b.assignedCleaner || "").replace(/"/g, '""')}"`,
        `"${b.status || "PENDING"}"`,
        `"${emp?.phone || ""}"`,
        `"${emp?.email || ""}"`
      ].join(",");
    });

    const csvString = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encoded = encodeURI(csvString);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `Aqui_Estamos_Reservas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("✓ Planilla exportada a archivo CSV exitosamente.");
  };

  const openEditModal = (b: Booking) => {
    setEditingBooking(b);
    setModalStatus(b.status);
    setModalCleaner(b.assignedCleaner || "");
    setModalCustomerName(b.customerName || "");
    setModalCustomerPhone(b.customerPhone || "");
    setModalCustomerEmail(b.customerEmail || "");
    setModalAddress(b.address || "");
    setModalServiceDate(b.serviceDate || "");
    setModalServiceTime(b.serviceTime || "08:00");
    setModalServiceHours(b.serviceHours || 6);
    setModalTotalPrice(b.totalPrice || 0);
    setModalPaymentMethod(b.paymentMethod || "cash");
    setModalPaymentStatus(b.paymentStatus || "PENDING");
    setModalNotes(b.notes || "");
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: modalStatus,
          assignedCleaner: modalCleaner || null,
          customerName: modalCustomerName.trim(),
          customerPhone: modalCustomerPhone.trim(),
          customerEmail: modalCustomerEmail.trim(),
          address: modalAddress.trim(),
          serviceDate: modalServiceDate,
          serviceTime: modalServiceTime,
          serviceHours: modalServiceHours,
          totalPrice: modalTotalPrice,
          paymentMethod: modalPaymentMethod,
          paymentStatus: modalPaymentStatus,
          notes: modalNotes.trim(),
        }),
      });

      if (res.ok) {
        showNotification(`✓ Reserva ${editingBooking.bookingNumber} actualizada con éxito.`);
        setEditingBooking(null);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar la reserva.");
      }
    } catch (err) {
      console.error("Error al guardar reserva:", err);
      alert("Error al conectar con el servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingName.trim() || !newBookingPhone.trim() || !newBookingAddress.trim()) {
      alert("Por favor completa el nombre, teléfono y dirección del cliente.");
      return;
    }

    setIsSubmittingNewBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newBookingName.trim(),
          customerPhone: newBookingPhone.trim(),
          customerEmail: newBookingEmail.trim() || "cliente@aquiestamos.com",
          address: newBookingAddress.trim(),
          serviceDate: newBookingDate,
          serviceTime: newBookingTime,
          serviceHours: newBookingHours,
          extras: newBookingExtras,
          frequency: newBookingFrequency,
          totalPrice: newBookingPrice,
          assignedCleaner: newBookingCleaner || null,
          status: newBookingStatus,
          paymentMethod: "cash",
          paymentStatus: "PENDING",
        }),
      });

      if (res.ok) {
        showNotification("✓ ¡Nueva cita creada exitosamente!");
        setIsCreatingBooking(false);
        setNewBookingName("");
        setNewBookingPhone("");
        setNewBookingEmail("");
        setNewBookingAddress("");
        setNewBookingCleaner("");
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al crear la cita.");
      }
    } catch (err) {
      alert("Error al conectar con el servidor.");
    } finally {
      setIsSubmittingNewBooking(false);
    }
  };

  const handleDeleteBooking = async (id: string, bookingNumber: string) => {
    if (!confirm(`¿Estás seguro de eliminar la reserva ${bookingNumber}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification(`✓ Reserva ${bookingNumber} eliminada.`);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar la reserva.");
      }
    } catch (err) {
      console.error("Error al eliminar reserva:", err);
    }
  };

  const handleLeadStatusChange = async (leadId: string, newStatus: CorporateLead["status"]) => {
    try {
      const res = await fetch("/api/corporate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Error al actualizar lead:", err);
    }
  };

  // Filtrado Principal
  const filteredBookings = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return bookings.filter((b) => {
      // Filtro de Pestaña Rápida
      if (quickViewFilter === "TODAY" && b.serviceDate !== todayStr) return false;
      if (quickViewFilter === "UNASSIGNED" && b.assignedCleaner && b.assignedCleaner !== "Sin Asignar") return false;
      if (quickViewFilter === "CONFIRMED" && b.status !== "CONFIRMED") return false;
      if (quickViewFilter === "COMPLETED" && b.status !== "COMPLETED") return false;
      
      // Filtro desplegable de estado
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      
      // Buscador
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.customerName.toLowerCase().includes(q) ||
        b.bookingNumber.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        (b.assignedCleaner && b.assignedCleaner.toLowerCase().includes(q)) ||
        b.address.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, quickViewFilter, statusFilter, searchTerm]);

  // Ordenamiento Dinámico de Menor a Mayor / Mayor a Menor para cualquier columna
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (sortField) {
        case "createdAt":
          valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case "customerName":
          valA = (a.customerName || "").toLowerCase();
          valB = (b.customerName || "").toLowerCase();
          break;
        case "customerPhone":
          valA = (a.customerPhone || "").replace(/\D/g, "");
          valB = (b.customerPhone || "").replace(/\D/g, "");
          break;
        case "customerEmail":
          valA = (a.customerEmail || "").toLowerCase();
          valB = (b.customerEmail || "").toLowerCase();
          break;
        case "serviceHours":
          valA = Number(a.serviceHours) || 0;
          valB = Number(b.serviceHours) || 0;
          break;
        case "extras":
          valA = (a.extras || []).length;
          valB = (b.extras || []).length;
          break;
        case "totalPrice":
          valA = Number(a.totalPrice) || 0;
          valB = Number(b.totalPrice) || 0;
          break;
        case "serviceDate":
          valA = (a.serviceDate || "") + " " + (a.serviceTime || "");
          valB = (b.serviceDate || "") + " " + (b.serviceTime || "");
          break;
        case "serviceTime":
          valA = a.serviceTime || "";
          valB = b.serviceTime || "";
          break;
        case "address":
          valA = (a.address || "").toLowerCase();
          valB = (b.address || "").toLowerCase();
          break;
        case "frequency":
          valA = (a.frequency || "").toLowerCase();
          valB = (b.frequency || "").toLowerCase();
          break;
        case "assignedCleaner":
          valA = (a.assignedCleaner || "").toLowerCase();
          valB = (b.assignedCleaner || "").toLowerCase();
          break;
        case "status":
          valA = (a.status || "").toLowerCase();
          valB = (b.status || "").toLowerCase();
          break;
        case "employeePhone": {
          const empA = getAssignedEmployee(a.assignedCleaner);
          const empB = getAssignedEmployee(b.assignedCleaner);
          valA = (empA?.phone || "").replace(/\D/g, "");
          valB = (empB?.phone || "").replace(/\D/g, "");
          break;
        }
        case "employeeEmail": {
          const empA = getAssignedEmployee(a.assignedCleaner);
          const empB = getAssignedEmployee(b.assignedCleaner);
          valA = (empA?.email || "").toLowerCase();
          valB = (empB?.email || "").toLowerCase();
          break;
        }
        default:
          valA = (a as any)[sortField] || "";
          valB = (b as any)[sortField] || "";
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredBookings, sortField, sortDirection, employees]);

  const renderSortHeader = (label: string, field: string, align: "left" | "center" | "right" = "left", minWidth?: string) => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`px-4 py-3.5 border-r border-slate-200/80 cursor-pointer select-none hover:bg-slate-100/80 transition-colors group ${
          align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
        } ${minWidth || ""}`}
        title={`Clic para ordenar por "${label}" (${isActive && sortDirection === "asc" ? "Mayor a Menor" : "Menor a Mayor"})`}
      >
        <div className={`inline-flex items-center gap-1.5 ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-electric-600 font-black" : "text-slate-600 group-hover:text-slate-900"}`}>
            {label}
          </span>
          {isActive ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-3.5 h-3.5 text-electric-600 shrink-0 font-bold" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-electric-600 shrink-0 font-bold" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
      </th>
    );
  };

  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      (e.ci && e.ci.toLowerCase().includes(q)) ||
      e.zone.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = userSearchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.address && u.address.toLowerCase().includes(q))
    );
  });

  const unassignedCount = bookings.filter(
    (b) => !b.assignedCleaner || b.assignedCleaner === "Sin Asignar" || b.assignedCleaner === "Sin asignar"
  ).length;

  // Métricas reales calculadas
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalHoursWorked = bookings.reduce((acc, b) => acc + (b.serviceHours || 0), 0);
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status === "ACTIVE").length;
  const verifiedIpsEmployeesCount = employees.filter((e) => Boolean(e.ipsVerified)).length;
  const ipsCoveragePercentage = totalEmployeesCount > 0 
    ? Math.round((verifiedIpsEmployeesCount / totalEmployeesCount) * 100) 
    : 100;

  // Datos para Gráfico de Operaciones y Servicios
  const chartData = useMemo(() => {
    const map: { [date: string]: { date: string; revenue: number; count: number } } = {};
    bookings.slice(0, 15).forEach((b) => {
      const d = b.serviceDate || "2026-03-01";
      if (!map[d]) map[d] = { date: d, revenue: 0, count: 0 };
      map[d].revenue += b.totalPrice || 0;
      map[d].count += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [bookings]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 300000);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 flex items-center justify-center text-slate-800">
        <div className="text-center space-y-3 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="w-10 h-10 border-4 border-electric-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Cargando Panel de Control...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado como administrador, mostrar el formulario de acceso exclusivo
  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <div className="relative h-14 w-52 mx-auto">
                <Image
                  src="/images/logo.jpeg"
                  alt="Aquí Estamos Limpieza"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-bold shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Área Administrativa Restringida</span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
              Ingreso al Panel Operativo
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Acceso exclusivo para el administrador maestro de Aquí Estamos.
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-slate-200/80">
            {adminAuthError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Correo Electrónico Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="juanas89@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contraseña Maestra
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full mt-2 py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {adminAuthLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ingresar al Panel de Control</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex flex-col antialiased">
      
      {/* Notificación Flotante Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contenedor Principal Estilo App Dashboard de Alta Gama */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================== */}
        {/* SIDEBAR DE NAVEGACIÓN (Estilo Screenshot Figma/Stripe) */}
        {/* ======================================================== */}
        <aside className="w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between hidden lg:flex shrink-0">
          <div className="space-y-6">
            
            {/* Header del Equipo / Organización */}
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">Aquí Estamos</p>
                <p className="text-[10px] font-semibold text-slate-500">Panel de Operaciones</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Menú Principal */}
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Operaciones Diarias
              </p>

              <button
                onClick={() => setActiveTab("BOOKINGS")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "BOOKINGS"
                    ? "bg-electric-50 text-electric-700 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className={`w-4 h-4 ${activeTab === "BOOKINGS" ? "text-electric-600" : "text-slate-400"}`} />
                  <span>Citas & Reservas</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "BOOKINGS" ? "bg-electric-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("EMPLOYEES")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "EMPLOYEES"
                    ? "bg-electric-50 text-electric-700 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className={`w-4 h-4 ${activeTab === "EMPLOYEES" ? "text-electric-600" : "text-slate-400"}`} />
                  <span>Personal & IPS</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "EMPLOYEES" ? "bg-electric-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {employees.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("CUSTOMERS")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "CUSTOMERS"
                    ? "bg-electric-50 text-electric-700 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${activeTab === "CUSTOMERS" ? "text-electric-600" : "text-slate-400"}`} />
                  <span>Clientes Registrados</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "CUSTOMERS" ? "bg-electric-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {users.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("LEADS")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "LEADS"
                    ? "bg-electric-50 text-electric-700 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className={`w-4 h-4 ${activeTab === "LEADS" ? "text-electric-600" : "text-slate-400"}`} />
                  <span>Empresas B2B</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "LEADS" ? "bg-electric-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {leads.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("CALENDAR")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "CALENDAR"
                    ? "bg-electric-50 text-electric-700 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className={`w-4 h-4 ${activeTab === "CALENDAR" ? "text-electric-600" : "text-slate-400"}`} />
                  <span>Google Calendar</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  En Vivo
                </span>
              </button>
            </div>

            {/* Accesos Rápidos Operativos */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Acciones Rápidas
              </p>

              <button
                type="button"
                onClick={() => setIsCreatingBooking(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r from-electric-600 to-cyan-600 hover:from-electric-700 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nueva Cita Manual</span>
              </button>

              <button
                type="button"
                onClick={handleAutoAssignAll}
                disabled={isAutoAssigning || unassignedCount === 0}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100/80 text-amber-800 font-bold text-xs rounded-xl border border-amber-200/80 transition-all active:scale-98 disabled:opacity-50"
              >
                <Shuffle className={`w-4 h-4 text-amber-600 ${isAutoAssigning ? "animate-spin" : ""}`} />
                <span>Asignar al Azar ({unassignedCount})</span>
              </button>
            </div>
          </div>

          {/* Tarjeta Inferior de Cobertura IPS & Perfil */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">Seguro IPS Activo</p>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-base font-black text-white">{ipsCoveragePercentage}% Cobertura</p>
              <p className="text-[10px] text-slate-300 mt-0.5">
                {verifiedIpsEmployeesCount} de {totalEmployeesCount} asegurados
              </p>
            </div>

            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-electric-100 text-electric-700 font-black text-xs flex items-center justify-center shrink-0">
                  JS
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Juan Solalinde</p>
                  <p className="text-[10px] text-slate-500">Admin Maestro</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* CONTENIDO PRINCIPAL DEL DASHBOARD */}
        {/* ======================================================== */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Barra Superior de Búsqueda y Acciones (Estilo Screenshot) */}
          <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center sticky top-0 z-20">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {activeTab === "BOOKINGS" && "Citas & Reservas Operativas"}
                  {activeTab === "EMPLOYEES" && "Cuadrilla & Personal IPS"}
                  {activeTab === "CUSTOMERS" && "Directorio de Clientes"}
                  {activeTab === "LEADS" && "Solicitudes Empresas B2B"}
                  {activeTab === "CALENDAR" && "Google Calendar en Vivo"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Control de operaciones, asignación de personal y seguimiento en tiempo real.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Buscador Global Rápido */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cliente, teléfono, email..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-electric-600 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Botón Exportar CSV */}
              <button
                type="button"
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-all active:scale-95"
                title="Exportar a archivo CSV (Compatible con Excel y Google Sheets)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar</span>
              </button>

              {/* Botón Alternar Gráficos */}
              <button
                type="button"
                onClick={() => setShowCharts(!showCharts)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border shadow-xs transition-all active:scale-95 ${
                  showCharts
                    ? "bg-electric-50 text-electric-700 border-electric-200 hover:bg-electric-100"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                title={showCharts ? "Ocultar sección de gráficos y métricas" : "Mostrar sección de gráficos y métricas"}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{showCharts ? "Ocultar Gráficos" : "Ver Gráficos"}</span>
              </button>

              {/* Botón Nueva Cita */}
              <button
                type="button"
                onClick={() => setIsCreatingBooking(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nueva Cita</span>
              </button>

              {/* Actualizar Datos */}
              <button
                type="button"
                onClick={loadData}
                className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-xs transition-all"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            
            {/* ======================================================== */}
            {/* SECCIÓN DE ACTIVIDAD & SPARKLINE CARDS (Estilo Screenshot Linear/GitHub/Raycast) */}
            {/* ======================================================== */}
            {showCharts && (
              <div className="bg-[#080c14] text-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-800/80 shadow-2xl space-y-12 animate-in fade-in duration-300 font-sans">
                
                {/* ======================================================== */}
                {/* FILA 1: ACTIVIDAD OPERATIVA / MÉTRICAS CON SPARKLINES */}
                {/* ======================================================== */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
                  
                  {/* Título de la fila */}
                  <div className="w-full lg:w-44 shrink-0">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Actividad</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Métricas de limpieza</p>
                  </div>

                  {/* 4 Columnas de Métricas con Sparklines para Empresa de Limpieza */}
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
                    
                    {/* Métrica 1: Facturación Total */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                          <DollarSign className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300">Ingresos Totales</span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate" title={formatGs(totalRevenue)}>
                        {formatGs(totalRevenue)}
                      </p>
                      <p className="text-[11px] font-bold text-[#22c55e] pb-1">+120% este mes</p>
                      <div className="h-7 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 30" preserveAspectRatio="none">
                          <path
                            d="M 0 24 C 20 25, 35 22, 50 18 C 65 14, 80 20, 95 16 C 110 12, 125 10, 140 8 C 155 6, 170 12, 185 7 L 200 4"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Métrica 2: Servicios Confirmados */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300">Servicios Confirmados</span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        {bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length} Citas
                      </p>
                      <p className="text-[11px] font-bold text-[#22c55e] pb-1">+238% de demanda</p>
                      <div className="h-7 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 30" preserveAspectRatio="none">
                          <path
                            d="M 0 26 C 20 28, 35 22, 50 25 C 65 28, 75 14, 90 6 C 105 16, 120 8, 135 12 C 150 16, 170 8, 185 10 L 200 5"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Métrica 3: Clientes Registrados */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-purple-400">
                          <Users className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300">Clientes Registrados</span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        {users.length} Clientes
                      </p>
                      <p className="text-[11px] font-bold text-[#22c55e] pb-1">+34% este mes</p>
                      <div className="h-7 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 30" preserveAspectRatio="none">
                          <path
                            d="M 0 26 C 25 24, 45 28, 70 18 C 95 8, 120 16, 145 10 C 170 4, 185 8, 200 3"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Métrica 4: Visitas a la página (Últimos 7 días) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
                          <Eye className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300">Visitas (Últimos 7 días)</span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        1.8K Visitas
                      </p>
                      <p className="text-[11px] font-bold text-[#22c55e] pb-1">+18% esta semana</p>
                      <div className="h-7 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 30" preserveAspectRatio="none">
                          <path
                            d="M 0 25 C 30 22, 60 18, 90 16 C 120 14, 150 10, 175 8 L 200 5"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ======================================================== */}
                {/* FILA 2: OPERACIONES / ONDA DE PILARES MULTI-CAPA */}
                {/* ======================================================== */}
                <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 pt-4">
                  
                  {/* Columna Izquierda: Título Operaciones + Menú Tipo de Servicio + Leyenda */}
                  <div className="w-full lg:w-44 shrink-0 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white">Operaciones</h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Distribución de demanda</p>
                    </div>

                    <div className="space-y-3">
                      {/* Botón Selector con Icono y Caret */}
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors">
                        <div className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
                          <SlidersHorizontal className="w-2.5 h-2.5" />
                        </div>
                        <span>Servicios & Citas</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Lista de Leyendas de Limpieza */}
                      <div className="space-y-1.5 pl-1 text-[11px] font-medium text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#9333ea]" />
                          <span className="text-slate-300">Finalizadas / Premium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#334155]" />
                          <span className="text-slate-400">En Curso / Regulares</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                          <span className="text-slate-300">Confirmadas & Nuevas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Onda de 58 Pilares Segmentados (Curva Exacta de la Imagen) */}
                  <div className="flex-1 w-full">
                    <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-[3px] sm:gap-[4px] px-1 select-none overflow-x-auto">
                      {[52, 46, 44, 40, 41, 45, 47, 48, 42, 36, 34, 35, 38, 41, 43, 45, 47, 50, 53, 56, 58, 61, 64, 67, 70, 73, 76, 78, 81, 84, 86, 88, 90, 93, 95, 97, 96, 94, 92, 95, 97, 98, 96, 93, 95, 97, 98, 96, 94, 92, 95, 97, 96, 94, 96, 98, 99, 100].map((heightPct, i) => {
                        const totalHeightPx = Math.round((heightPct / 100) * 250);
                        const topH = Math.max(10, Math.round(totalHeightPx * 0.28));
                        const midH = Math.max(6, Math.round(totalHeightPx * 0.20));
                        const botH = Math.max(12, Math.round(totalHeightPx * 0.52));

                        const dayNum = (i % 30) + 1;
                        const estAmount = Math.round((heightPct / 100) * 950000);

                        return (
                          <div
                            key={i}
                            className="flex-1 min-w-[5px] max-w-[12px] flex flex-col items-center justify-end gap-[2px] group relative cursor-pointer h-full"
                          >
                            {/* Tooltip Interactivo */}
                            <div className="absolute -top-20 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-30 bg-slate-900/95 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap -translate-x-1/2 left-1/2 border border-slate-700">
                              <p className="text-slate-400 font-normal">Día {dayNum} de Servicios</p>
                              <p className="text-emerald-400 font-extrabold text-xs">{formatGs(estAmount)}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                                <span className="text-[#c084fc]">🟣 {Math.round(topH / 4)} Fin.</span>
                                <span className="text-slate-400">⚫ {Math.round(midH / 3)} Cur.</span>
                                <span className="text-[#22c55e]">🟢 {Math.round(botH / 3)} Conf.</span>
                              </div>
                            </div>

                            {/* Segmento Superior: Violeta / Púrpura */}
                            <div
                              style={{ height: (topH + "px") }}
                              className="w-full rounded-full bg-[#9333ea] group-hover:bg-[#a855f7] transition-all duration-150"
                            />

                            {/* Segmento Medio: Charcoal / Dark Slate */}
                            <div
                              style={{ height: (midH + "px") }}
                              className="w-full rounded-full bg-[#334155] group-hover:bg-[#475569] transition-all duration-150"
                            />

                            {/* Segmento Inferior: Gradiente Cyan a Verde Neón */}
                            <div
                              style={{ height: (botH + "px") }}
                              className="w-full rounded-full bg-gradient-to-t from-[#06b6d4] to-[#22c55e] group-hover:from-[#0891b2] group-hover:to-[#16a34a] transition-all duration-150"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TABLA PRINCIPAL ESTILO DATA GRID DE ALTO CONTRASTE */}
            {/* ======================================================== */}
            {activeTab === "BOOKINGS" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                
                {/* Barra de Filtros Rápidos (Pestañas de Vista) */}
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-50/50">
                  
                  {/* Selector de Vistas Rápidas */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setQuickViewFilter("ALL")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        quickViewFilter === "ALL"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Todas ({bookings.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickViewFilter("UNASSIGNED")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        quickViewFilter === "UNASSIGNED"
                          ? "bg-white text-amber-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ⏳ Sin Asignar ({unassignedCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickViewFilter("CONFIRMED")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        quickViewFilter === "CONFIRMED"
                          ? "bg-white text-emerald-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ✅ Confirmadas ({bookings.filter((b) => b.status === "CONFIRMED").length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickViewFilter("COMPLETED")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        quickViewFilter === "COMPLETED"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🎉 Finalizadas ({bookings.filter((b) => b.status === "COMPLETED").length})
                    </button>
                  </div>

                  {/* Filtro por Estado y Opciones */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-electric-600 shadow-xs"
                      >
                        <option value="ALL">Todos los estados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="CONFIRMED">Confirmadas</option>
                        <option value="IN_PROGRESS">En Curso</option>
                        <option value="COMPLETED">Finalizadas</option>
                        <option value="CANCELLED">Canceladas</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCharts(!showCharts)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{showCharts ? "Ocultar Gráficos" : "Ver Gráficos"}</span>
                    </button>
                  </div>
                </div>

                {/* Tabla de Datos Limpia y Moderna */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 whitespace-nowrap sticky top-0 z-10">
                      <tr>
                        {renderSortHeader("Fecha Registro", "createdAt", "left")}
                        {renderSortHeader("Cliente", "customerName", "left")}
                        {renderSortHeader("Teléfono", "customerPhone", "left")}
                        {renderSortHeader("Email", "customerEmail", "left")}
                        {renderSortHeader("Horas", "serviceHours", "center")}
                        {renderSortHeader("Extras", "extras", "left")}
                        {renderSortHeader("Total", "totalPrice", "left")}
                        {renderSortHeader("Fecha Servicio", "serviceDate", "left")}
                        {renderSortHeader("Hora", "serviceTime", "center")}
                        {renderSortHeader("Dirección", "address", "left", "min-w-[220px]")}
                        <th className="px-3 py-3.5 border-r border-slate-200 text-center font-bold uppercase text-[11px] tracking-wider text-slate-600">
                          Mapa
                        </th>
                        {renderSortHeader("Frecuencia", "frequency", "center")}
                        {renderSortHeader("Empleado Asignado", "assignedCleaner", "left", "min-w-[190px]")}
                        {renderSortHeader("Estatus", "status", "center")}
                        {renderSortHeader("Teléfono Empleado", "employeePhone", "left")}
                        {renderSortHeader("E-mail Empleados", "employeeEmail", "left")}
                        <th className="px-4 py-3.5 border-r border-slate-200 text-center font-bold uppercase text-[11px] tracking-wider text-slate-600">
                          Enviar WhatsApp
                        </th>
                        <th className="px-4 py-3.5 text-center font-bold uppercase text-[11px] tracking-wider text-slate-600">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans text-xs">
                      {sortedBookings.map((b) => {
                        const assignedEmp = getAssignedEmployee(b.assignedCleaner);
                        const mapsQueryUrl = b.latitude && b.longitude
                          ? `https://www.google.com/maps?q=${b.latitude},${b.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
                        
                        const formatExtras = () => {
                          if (!b.extras || b.extras.length === 0) return <span className="text-slate-400">Ninguno</span>;
                          return (
                            <span className="flex flex-wrap gap-1">
                              {b.extras.map((ex, i) => (
                                <span key={i} className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200/60 text-[10px] font-medium">
                                  {ex}
                                </span>
                              ))}
                            </span>
                          );
                        };

                        const formatFrequency = () => {
                          switch (b.frequency as string) {
                            case "weekly_2_4":
                            case "weekly":
                            case "semanal":
                              return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">Semanal</span>;
                            case "biweekly":
                            case "quincenal":
                              return <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">Quincenal</span>;
                            case "monthly":
                            case "mensual":
                              return <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold text-[10px] border border-cyan-200">Mensual</span>;
                            default:
                              return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">Una vez</span>;
                          }
                        };

                        const formatCreatedDate = () => {
                          if (!b.createdAt) return "-";
                          try {
                            const d = new Date(b.createdAt);
                            return d.toLocaleString("es-PY", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            });
                          } catch (e) {
                            return b.createdAt;
                          }
                        };

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* 1. Fecha Registro */}
                            <td className="px-4 py-3 border-r border-slate-100 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {formatCreatedDate()}
                            </td>

                            {/* 2. Nombre */}
                            <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-900 whitespace-nowrap">
                              <p>{b.customerName}</p>
                              <span className="text-[10px] font-mono text-slate-400 font-normal">{b.bookingNumber}</span>
                            </td>

                            {/* 3. Teléfono */}
                            <td className="px-4 py-3 border-r border-slate-100 text-slate-700 whitespace-nowrap">
                              <a
                                href={generateWhatsAppCustomerUrl(b)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-medium"
                                title="Abrir WhatsApp del cliente"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>{b.customerPhone}</span>
                              </a>
                            </td>

                            {/* 4. Email */}
                            <td className="px-4 py-3 border-r border-slate-100 text-slate-600 truncate max-w-[150px]">
                              <a href={`mailto:${b.customerEmail}`} className="hover:text-slate-900 hover:underline">
                                {b.customerEmail}
                              </a>
                            </td>

                            {/* 5. Horas */}
                            <td className="px-3 py-3 border-r border-slate-100 text-center font-bold text-slate-900">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                                {b.serviceHours} hs
                              </span>
                            </td>

                            {/* 6. Extras */}
                            <td className="px-4 py-3 border-r border-slate-100 max-w-[180px]">
                              {formatExtras()}
                            </td>

                            {/* 7. Total */}
                            <td className="px-4 py-3 border-r border-slate-100 font-black text-slate-900 whitespace-nowrap">
                              {formatGs(b.totalPrice)}
                            </td>

                            {/* 8. Fecha Servicio */}
                            <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-900 whitespace-nowrap">
                              {b.serviceDate}
                            </td>

                            {/* 9. Hora */}
                            <td className="px-3 py-3 border-r border-slate-100 text-center font-semibold text-slate-700 whitespace-nowrap">
                              {b.serviceTime} hs
                            </td>

                            {/* 10. Dirección */}
                            <td className="px-4 py-3 border-r border-slate-100 text-slate-700">
                              <p className="line-clamp-2 max-w-[240px]" title={b.address}>
                                {b.address}
                              </p>
                            </td>

                            {/* 11. Ubicación Maps */}
                            <td className="px-3 py-3 border-r border-slate-100 text-center whitespace-nowrap">
                              <a
                                href={mapsQueryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-electric-50 text-slate-700 hover:text-electric-700 text-[11px] font-bold border border-slate-200 transition-colors shadow-2xs"
                              >
                                <MapPin className="w-3 h-3 text-electric-600" />
                                <span>Mapa</span>
                              </a>
                            </td>

                            {/* 12. Frecuencia */}
                            <td className="px-3 py-3 border-r border-slate-100 text-center whitespace-nowrap">
                              {formatFrequency()}
                            </td>

                            {/* 13. Empleado Asignado (Selector Apple Style con Punto de Color) */}
                            <td className="px-3 py-2.5 border-r border-slate-100 min-w-[175px]">
                              {(() => {
                                const empColor = getEmployeeColor(b.assignedCleaner);
                                return (
                                  <div className="relative inline-block w-full">
                                    {/* Apple Pill Presentation */}
                                    <div className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full border shadow-2xs transition-all duration-150 ${
                                      b.assignedCleaner
                                        ? "bg-white/95 hover:bg-slate-50 border-slate-200/90 text-slate-800"
                                        : "bg-slate-50/80 hover:bg-slate-100/80 border-dashed border-slate-300 text-slate-500"
                                    }`}>
                                      <div className="flex items-center gap-2 truncate min-w-0">
                                        <span
                                          className={`w-2 h-2 rounded-full shrink-0 ${empColor.bg} ring-2 ring-white shadow-2xs`}
                                        />
                                        <span className="text-xs font-semibold tracking-tight truncate">
                                          {b.assignedCleaner || "Sin Asignar"}
                                        </span>
                                      </div>
                                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                                    </div>

                                    {/* Native Select Overlay */}
                                    <select
                                      value={b.assignedCleaner || "UNASSIGNED"}
                                      onChange={(e) => handleQuickAssignCleaner(b.id, e.target.value)}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                                      title="Cambiar empleado asignado"
                                    >
                                      <option value="UNASSIGNED">⚪ Sin Asignar</option>
                                      <option value="RANDOM">🎲 Asignar al Azar</option>
                                      <optgroup label="Personal Activo">
                                        {employees
                                          .filter((e) => e.status === "ACTIVE")
                                          .map((emp) => (
                                            <option key={emp.id} value={`${emp.name}`}>
                                              ● {emp.name} ({emp.zone.split(" ")[0]})
                                            </option>
                                          ))}
                                      </optgroup>
                                    </select>
                                  </div>
                                );
                              })()}
                            </td>

                            {/* 14. Estatus (Selector Apple Style con Indicador LED) */}
                            <td className="px-3 py-2.5 border-r border-slate-100 text-center whitespace-nowrap min-w-[130px]">
                              {(() => {
                                const st = getStatusBadge(b.status);
                                return (
                                  <div className="relative inline-block">
                                    {/* Apple Pill Presentation */}
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-tight border shadow-2xs transition-all duration-150 ${st.bg} ${st.text} ${st.border}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot} ring-1 ring-white/60`} />
                                      <span>{st.label}</span>
                                      <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                                    </div>

                                    {/* Native Select Overlay */}
                                    <select
                                      value={b.status}
                                      onChange={(e) => handleQuickStatusChange(b.id, e.target.value)}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                                      title="Cambiar estado del servicio"
                                    >
                                      <option value="PENDING">Pendiente</option>
                                      <option value="CONFIRMED">Confirmado</option>
                                      <option value="IN_PROGRESS">En Curso</option>
                                      <option value="COMPLETED">Finalizado</option>
                                      <option value="CANCELLED">Cancelado</option>
                                    </select>
                                  </div>
                                );
                              })()}
                            </td>

                            {/* 15. Teléfono del Empleado */}
                            <td className="px-4 py-3 border-r border-slate-100 text-slate-700 whitespace-nowrap">
                              {assignedEmp ? (
                                <a
                                  href={generateWhatsAppEmployeeUrl(b, assignedEmp)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-medium"
                                  title="Enviar orden con ubicación al empleado por WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                                  <span>{assignedEmp.phone}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            {/* 16. E-mail Empleados */}
                            <td className="px-4 py-3 border-r border-slate-100 text-slate-600 truncate max-w-[140px]">
                              {assignedEmp?.email ? (
                                <a href={`mailto:${assignedEmp.email}`} className="hover:text-slate-900 hover:underline">
                                  {assignedEmp.email}
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            {/* 17. Enviar Mensaje WhatsApp */}
                            <td className="px-4 py-3 border-r border-slate-100 text-center whitespace-nowrap">
                              {assignedEmp ? (
                                <div className="inline-flex items-center gap-1.5 justify-center">
                                  <a
                                    href={generateWhatsAppEmployeeUrl(b, assignedEmp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95"
                                    title={`Enviar orden con ubicación en Google Maps a ${assignedEmp.name}`}
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>WhatsApp Empleado</span>
                                  </a>
                                  <a
                                    href={generateWhatsAppCustomerUrl(b)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-200 transition-all"
                                    title="Enviar confirmación al cliente"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={generateWhatsAppCustomerUrl(b)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95"
                                  title="Enviar WhatsApp al cliente"
                                >
                                  <Send className="w-3 h-3 text-emerald-400" />
                                  <span>WhatsApp Cliente</span>
                                </a>
                              )}
                            </td>

                            {/* 18. Acciones: Google Calendar, Editar, Eliminar */}
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <a
                                  href={generateGoogleCalendarUrl(b)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-[10px] border border-blue-200 transition-all flex items-center gap-1"
                                  title="Crear Evento en Google Calendar"
                                >
                                  <CalendarPlus className="w-3 h-3" />
                                  <span>Calendar</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(b)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-200 transition-all"
                                  title="Editar reserva"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBooking(b.id, b.bookingNumber)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold border border-rose-200 transition-all"
                                  title="Eliminar reserva"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {sortedBookings.length === 0 && (
                        <tr>
                          <td colSpan={18} className="px-6 py-12 text-center text-slate-400">
                            No se encontraron reservas con los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: PERSONAL & EMPLEADOS */}
            {/* ======================================================== */}
            {activeTab === "EMPLOYEES" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Directorio de Cuadrilla & Personal</h2>
                    <p className="text-xs text-slate-500">Gestión de personal operativo, zonas y cobertura de seguro IPS.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingEmployee(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Agregar Empleado</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map((emp) => (
                    <div key={emp.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-electric-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900">{emp.name}</h3>
                            <p className="text-[11px] text-slate-500 font-mono">CI: {emp.ci || "Sin CI"}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          emp.status === "ACTIVE" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600"
                        }`}>
                          {emp.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.phone}</span>
                        </p>
                        {emp.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{emp.email}</span>
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.zone}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleIps(emp.id, Boolean(emp.ipsVerified))}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
                            emp.ipsVerified 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{emp.ipsVerified ? "IPS Verificado" : "IPS en Trámite"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Eliminar empleado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: CLIENTES REGISTRADOS */}
            {/* ======================================================== */}
            {activeTab === "CUSTOMERS" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-sm font-black text-slate-900">Directorio de Clientes ({users.length})</h2>
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Filtrar clientes..."
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3 font-bold">Cliente</th>
                        <th className="px-5 py-3 font-bold">Contacto</th>
                        <th className="px-5 py-3 font-bold">Dirección Registrada</th>
                        <th className="px-5 py-3 font-bold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80">
                          <td className="px-5 py-3 font-bold text-slate-900">{u.name}</td>
                          <td className="px-5 py-3 text-slate-600">
                            <p>{u.phone || "Sin teléfono"}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{u.address || "Sin dirección"}</td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCustomer(u)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: SOLICITUDES EMPRESAS B2B */}
            {/* ======================================================== */}
            {activeTab === "LEADS" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-black text-slate-900">Solicitudes Corporativas B2B ({leads.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3 font-bold">Empresa / Contacto</th>
                        <th className="px-5 py-3 font-bold">Teléfono / Email</th>
                        <th className="px-5 py-3 font-bold">Detalle del Requerimiento</th>
                        <th className="px-5 py-3 font-bold">Estado Pipeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/80">
                          <td className="px-5 py-3 font-bold text-slate-900">
                            <p>{l.companyName}</p>
                            <p className="text-[10px] text-slate-500 font-normal">{l.contactName}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            <p>{l.phone}</p>
                            <p className="text-[10px] text-slate-400">{l.email}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-600 font-sans">
                            <p className="font-semibold text-slate-800">{l.facilityType}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{l.requirements || "Sin requerimientos específicos"}</p>
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={l.status}
                              onChange={(e) => handleLeadStatusChange(l.id, e.target.value as any)}
                              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            >
                              <option value="NEW">Nuevo Lead</option>
                              <option value="CONTACTED">Contactado</option>
                              <option value="QUOTE_SENT">Presupuesto Enviado</option>
                              <option value="WON">Cerrado Ganado</option>
                              <option value="CLOSED">Cerrado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: GOOGLE CALENDAR EN VIVO & SINCRONIZACIÓN */}
            {/* ======================================================== */}
            {activeTab === "CALENDAR" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 sm:p-7 space-y-6 animate-in fade-in duration-200">
                
                {/* Cabecera y Botones de Sincronización */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-electric-600" />
                      <span>Calendario Operativo Google Calendar</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualización y sincronización en tiempo real de todas las citas y limpiezas agendadas.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Botón Suscribir en Google Calendar */}
                    <a
                      href="https://calendar.google.com/calendar/r?cid=https%3A%2F%2Fcalendar.google.com%2Fcalendar%2Fical%2F6995kk35n4bc196tnd07q3onahg0t2lh%40import.calendar.google.com%2Fpublic%2Fbasic.ics"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                      title="Sincronizar automáticamente en tu cuenta de Google Calendar"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>+ Suscribir en Google Calendar</span>
                    </a>

                    {/* Botón Apple Calendar / iOS */}
                    <a
                      href="webcal://calendar.google.com/calendar/ical/6995kk35n4bc196tnd07q3onahg0t2lh%40import.calendar.google.com/public/basic.ics"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                      title="Sincronizar en iPhone, iPad, Mac o Outlook"
                    >
                      <span>🍏 Apple / Outlook</span>
                    </a>

                    {/* Descargar Archivo iCal */}
                    <a
                      href="/api/calendar/feed"
                      download="aquiestamos-agenda.ics"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Descargar .ics</span>
                    </a>
                    
                    <button
                      type="button"
                      onClick={() => setIsCreatingBooking(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Nueva Cita</span>
                    </button>
                  </div>
                </div>

                {/* Banner Informativo con URLs de Integración iCal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Enlace iCal Público (.ics):</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://calendar.google.com/calendar/ical/6995kk35n4bc196tnd07q3onahg0t2lh%40import.calendar.google.com/public/basic.ics"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-600 truncate select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("https://calendar.google.com/calendar/ical/6995kk35n4bc196tnd07q3onahg0t2lh%40import.calendar.google.com/public/basic.ics");
                          showNotification("✓ Enlace iCal copiado al portapapeles.");
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px] shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-electric-500"></span>
                      <span>ID Oficial de Calendario:</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="6995kk35n4bc196tnd07q3onahg0t2lh@import.calendar.google.com"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-600 truncate select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("6995kk35n4bc196tnd07q3onahg0t2lh@import.calendar.google.com");
                          showNotification("✓ ID de Calendario copiado.");
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px] shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Google Calendar Iframe Embebido */}
                <div className="w-full h-[650px] sm:h-[750px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 relative">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=6995kk35n4bc196tnd07q3onahg0t2lh%40import.calendar.google.com&ctz=America%2FAsuncion"
                    style={{ border: 0 }}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    className="w-full h-full"
                    title="Calendario Operativo Aquí Estamos"
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL PARA CREAR NUEVA CITA MANUALMENTE */}
      {/* ======================================================== */}
      {isCreatingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-electric-600" />
                <span>Agendar Nueva Cita Manual</span>
              </h3>
              <button onClick={() => setIsCreatingBooking(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={newBookingName}
                  onChange={(e) => setNewBookingName(e.target.value)}
                  placeholder="Ej: Marcelo Gómez"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={newBookingPhone}
                    onChange={(e) => setNewBookingPhone(e.target.value)}
                    placeholder="0981 123 456"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newBookingEmail}
                    onChange={(e) => setNewBookingEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección Completa *</label>
                <input
                  type="text"
                  required
                  value={newBookingAddress}
                  onChange={(e) => setNewBookingAddress(e.target.value)}
                  placeholder="Ej: Avda. Santa Teresa 2250, Asunción"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newBookingDate}
                    onChange={(e) => setNewBookingDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={newBookingTime}
                    onChange={(e) => setNewBookingTime(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horas</label>
                  <select
                    value={newBookingHours}
                    onChange={(e) => setNewBookingHours(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  >
                    <option value={4}>4 Horas</option>
                    <option value={6}>6 Horas</option>
                    <option value={8}>8 Horas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asignar Empleado</label>
                  <select
                    value={newBookingCleaner}
                    onChange={(e) => setNewBookingCleaner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  >
                    <option value="">Sin Asignar (Pendiente)</option>
                    {employees.filter((e) => e.status === "ACTIVE").map((emp) => (
                      <option key={emp.id} value={emp.name}>👤 {emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monto Total (Gs.)</label>
                  <input
                    type="number"
                    value={newBookingPrice}
                    onChange={(e) => setNewBookingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingBooking(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewBooking}
                  className="px-5 py-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmittingNewBooking ? "Guardando..." : "Crear y Agendar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PARA EDITAR RESERVA */}
      {/* ======================================================== */}
      {editingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-electric-600" />
                <span>Editar Reserva {editingBooking.bookingNumber}</span>
              </h3>
              <button onClick={() => setEditingBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={modalCustomerName}
                  onChange={(e) => setModalCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={modalCustomerPhone}
                    onChange={(e) => setModalCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={modalCustomerEmail}
                    onChange={(e) => setModalCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  required
                  value={modalAddress}
                  onChange={(e) => setModalAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={modalServiceDate}
                    onChange={(e) => setModalServiceDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={modalServiceTime}
                    onChange={(e) => setModalServiceTime(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horas</label>
                  <select
                    value={modalServiceHours}
                    onChange={(e) => setModalServiceHours(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  >
                    <option value={4}>4 Horas</option>
                    <option value={6}>6 Horas</option>
                    <option value={8}>8 Horas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Empleado Asignado</label>
                  <select
                    value={modalCleaner}
                    onChange={(e) => setModalCleaner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  >
                    <option value="">Sin Asignar</option>
                    {employees.filter((e) => e.status === "ACTIVE").map((emp) => (
                      <option key={emp.id} value={emp.name}>👤 {emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="IN_PROGRESS">En Curso</option>
                    <option value="COMPLETED">Finalizado</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total (Gs.)</label>
                  <input
                    type="number"
                    value={modalTotalPrice}
                    onChange={(e) => setModalTotalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notas Internas</label>
                  <input
                    type="text"
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Instrucciones especiales..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PARA CREAR EMPLEADO */}
      {/* ======================================================== */}
      {isCreatingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-electric-600" />
                <span>Agregar Nuevo Empleado</span>
              </h3>
              <button onClick={() => setIsCreatingEmployee(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Ej: Carmen Benítez"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">C.I. Nº</label>
                  <input
                    type="text"
                    value={newEmpCi}
                    onChange={(e) => setNewEmpCi(e.target.value)}
                    placeholder="3.456.789"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="0981 234 567"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  placeholder="carmen@aquiestamos.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Zona Operativa</label>
                <select
                  value={newEmpZone}
                  onChange={(e) => setNewEmpZone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                >
                  <option value="Asunción (Villa Morra / Ykua Satî)">Asunción (Villa Morra / Ykua Satî)</option>
                  <option value="Asunción (Centro / Barrio Jara)">Asunción (Centro / Barrio Jara)</option>
                  <option value="Gran Asunción (Lambaré / Fernando)">Gran Asunción (Lambaré / Fernando)</option>
                  <option value="Gran Asunción (Luque / San Lorenzo)">Gran Asunción (Luque / San Lorenzo)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newEmpIpsCheck"
                  checked={newEmpIps}
                  onChange={(e) => setNewEmpIps(e.target.checked)}
                  className="w-4 h-4 text-electric-600 rounded border-slate-300"
                />
                <label htmlFor="newEmpIpsCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Tiene Seguro IPS Activo y Verificado
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingEmployee(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmp}
                  className="px-5 py-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmittingEmp ? "Guardando..." : "Guardar Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PARA EDITAR CLIENTE */}
      {/* ======================================================== */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Editar Datos del Cliente</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={customerEditName}
                  onChange={(e) => setCustomerEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={customerEditPhone}
                  onChange={(e) => setCustomerEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección Habitual</label>
                <input
                  type="text"
                  value={customerEditAddress}
                  onChange={(e) => setCustomerEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RUC / CI</label>
                  <input
                    type="text"
                    value={customerEditRuc}
                    onChange={(e) => setCustomerEditRuc(e.target.value)}
                    placeholder="80012345-6"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Razón Social</label>
                  <input
                    type="text"
                    value={customerEditTaxName}
                    onChange={(e) => setCustomerEditTaxName(e.target.value)}
                    placeholder="Nombre Facturación"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-electric-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-5 py-2 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSavingCustomer ? "Guardando..." : "Guardar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
