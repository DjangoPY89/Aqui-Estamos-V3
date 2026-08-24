"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
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
  Check
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
  const [activeTab, setActiveTab] = useState<"BOOKINGS" | "EMPLOYEES" | "CUSTOMERS" | "LEADS">("BOOKINGS");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // Estado de Asignación Automática
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  const handleSaveCustomerAddress = async (e: React.FormEvent) => {
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
      const res = await signIn("credentials", {
        redirect: false,
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword,
        callbackUrl: "/admin",
      });

      if (res?.error) {
        setAdminAuthError("Correo o clave de administrador incorrecta.");
        setAdminAuthLoading(false);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setAdminAuthError("Error al conectar con el servidor.");
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
    try {
      setIsLoading(true);
      const t = Date.now();
      const [statsRes, bookingsRes, leadsRes, usersRes, empRes] = await Promise.all([
        fetch(`/api/admin/stats?_t=${t}`, { cache: "no-store", headers: { Pragma: "no-cache" } }),
        fetch(`/api/bookings?_t=${t}`, { cache: "no-store", headers: { Pragma: "no-cache" } }),
        fetch(`/api/corporate?_t=${t}`, { cache: "no-store", headers: { Pragma: "no-cache" } }),
        fetch(`/api/admin/users?_t=${t}`, { cache: "no-store", headers: { Pragma: "no-cache" } }),
        fetch(`/api/admin/employees?_t=${t}`, { cache: "no-store", headers: { Pragma: "no-cache" } }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      }
    } catch (err) {
      console.error("Error al cargar datos de admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((session?.user as any)?.role === "ADMIN") {
      loadData();
    }
  }, [session]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Asignación rápida / Reasignación / Quitar personal desde la tabla
  const handleQuickAssignCleaner = async (bookingId: string, cleanerValue: string) => {
    try {
      let finalCleaner: string | null = cleanerValue;

      if (cleanerValue === "UNASSIGNED") {
        finalCleaner = null;
      } else if (cleanerValue === "RANDOM") {
        const activeEmps = employees.filter((e) => e.status === "ACTIVE");
        if (activeEmps.length > 0) {
          const randomEmp = activeEmps[Math.floor(Math.random() * activeEmps.length)];
          finalCleaner = `${randomEmp.name} (IPS Verificado)`;
        } else {
          finalCleaner = "Carmen Benítez (IPS Verificado)";
        }
      }

      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedCleaner: finalCleaner,
          status: finalCleaner ? "CONFIRMED" : undefined,
        }),
      });

      if (res.ok) {
        showNotification(
          finalCleaner 
            ? `✓ Personal asignado: ${finalCleaner}` 
            : "✓ Personal desasignado de la reserva."
        );
        loadData();
      } else {
        alert("Error al actualizar la asignación.");
      }
    } catch (err) {
      console.error("Error en asignación:", err);
    }
  };

  // Asignación Aleatoria Masiva de todas las reservas sin asignar
  const handleAutoAssignAll = async () => {
    setIsAutoAssigning(true);
    try {
      const res = await fetch("/api/admin/bookings/auto-assign", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`🎲 ¡${data.assignedCount} reservas asignadas aleatoriamente con éxito!`);
        loadData();
      } else {
        alert(data.error || "Error al auto-asignar.");
      }
    } catch (err) {
      console.error("Error en auto-assign:", err);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Crear nuevo empleado
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
      console.error("Error al actualizar estado:", err);
    }
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

    if (!modalCustomerName.trim() || !modalCustomerPhone.trim() || !modalAddress.trim()) {
      alert("Por favor completa los datos obligatorios del cliente y la dirección.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: modalStatus,
          assignedCleaner: modalCleaner.trim() || null,
          customerName: modalCustomerName.trim(),
          customerPhone: modalCustomerPhone.trim(),
          customerEmail: modalCustomerEmail.trim(),
          address: modalAddress.trim(),
          serviceDate: modalServiceDate,
          serviceTime: modalServiceTime,
          serviceHours: Number(modalServiceHours),
          totalPrice: Number(modalTotalPrice),
          paymentMethod: modalPaymentMethod,
          paymentStatus: modalPaymentStatus,
          notes: modalNotes,
        }),
      });

      if (res.ok) {
        setEditingBooking(null);
        showNotification(`✓ Reserva ${editingBooking.bookingNumber} actualizada con éxito.`);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar la reserva.");
      }
    } catch (err) {
      alert("Error de conexión al actualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBooking = async (id: string, bookingNumber: string) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente la reserva ${bookingNumber}?\n\nEsta acción la borrará para siempre de la base de datos.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (editingBooking?.id === id) setEditingBooking(null);
        showNotification(`✓ Reserva ${bookingNumber} eliminada de la base de datos.`);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar la reserva.");
      }
    } catch (err) {
      console.error("Error al eliminar reserva:", err);
      alert("Error de conexión al eliminar la reserva.");
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

  const handleReseed = async () => {
    if (confirm("¿Deseas reiniciar y sembrar datos de prueba iniciales?")) {
      await fetch("/api/seed", { method: "POST" });
      loadData();
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.assignedCleaner && b.assignedCleaner.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  // Métricas reales calculadas de empleados e IPS
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status === "ACTIVE").length;
  const verifiedIpsEmployeesCount = employees.filter((e) => Boolean(e.ipsVerified)).length;
  const pendingIpsEmployeesCount = employees.filter((e) => !Boolean(e.ipsVerified)).length;
  const ipsCoveragePercentage = totalEmployeesCount > 0 
    ? Math.round((verifiedIpsEmployeesCount / totalEmployeesCount) * 100) 
    : 0;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 py-16 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-electric-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">Cargando Panel Administrativo...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado como administrador, mostrar el formulario de acceso exclusivo
  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-48 mx-auto">
                <Image
                  src="/images/logo.jpeg"
                  alt="Aquí Estamos Limpieza"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Área Restringida</span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-white tracking-tight">
              Panel de Administración
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Ingreso exclusivo para administradores y supervisores autorizados.
            </p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
            {adminAuthError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Correo o Usuario de Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="juanas89@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-electric-500 focus:border-electric-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-electric-500 focus:border-electric-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 p-0.5"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full py-3 bg-electric-600 hover:bg-electric-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-electric-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adminAuthLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ingresar al Panel de Control</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80">
              <Link
                href="/portal"
                className="text-xs text-slate-400 hover:text-slate-200 font-medium"
              >
                ← Volver al Portal de Clientes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 py-16 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-electric-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">Cargando Panel Administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Notificación de Acción */}
        {actionNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Cabecera del Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-electric-600/20 text-electric-400 flex items-center justify-center border border-electric-500/30">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Panel de Administración</h1>
                <span className="text-[10px] font-bold uppercase bg-electric-600 text-white px-2 py-0.5 rounded">
                  Aquí Estamos 3.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestión en tiempo real de clientes, reservas, personal y solicitudes B2B.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReseed}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title="Sembrar datos de prueba"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sembrar Demo</span>
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-electric-600 hover:bg-electric-500 text-white font-bold text-xs rounded-xl shadow-electric transition-all"
            >
              <span>Actualizar Datos</span>
            </button>
          </div>
        </div>

        {/* Tarjetas KPI de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Ingresos Totales (Gs.)</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {formatGs(stats.totalRevenueGs)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Servicios completados y activos</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total Reservas</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.totalBookings}</p>
            <p className="text-[11px] text-electric-400 mt-1">{stats.confirmedBookings} confirmadas</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Personal Activo</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {activeEmployeesCount} Empleados
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {verifiedIpsEmployeesCount} de {totalEmployeesCount} con IPS ({ipsCoveragePercentage}%)
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Clientes Registrados</p>
            <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-2">{users.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Hogares y empresas registradas</p>
          </div>
        </div>

        {/* Pestañas Principales */}
        <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("BOOKINGS")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "BOOKINGS"
                ? "bg-electric-600 text-white shadow-electric-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Reservas Residenciales ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("EMPLOYEES")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "EMPLOYEES"
                ? "bg-electric-600 text-white shadow-electric-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Personal & Empleados ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("CUSTOMERS")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "CUSTOMERS"
                ? "bg-electric-600 text-white shadow-electric-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes Registrados ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("LEADS")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "LEADS"
                ? "bg-electric-600 text-white shadow-electric-sm"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Solicitudes Empresas B2B ({leads.length})</span>
          </button>
        </div>

        {/* TAB 1: Tabla de Reservas */}
        {activeTab === "BOOKINGS" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Filtros, Buscador y Botón de Asignación Aleatoria */}
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cliente, código o personal..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Botón de Asignación Aleatoria Automática */}
                <button
                  type="button"
                  onClick={handleAutoAssignAll}
                  disabled={isAutoAssigning || unassignedCount === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-electric-600 hover:from-amber-400 hover:to-electric-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  title="Asigna personal disponible al azar a todas las reservas pendientes"
                >
                  <Shuffle className={`w-3.5 h-3.5 ${isAutoAssigning ? "animate-spin" : ""}`} />
                  <span>
                    {isAutoAssigning 
                      ? "Asignando..." 
                      : unassignedCount > 0 
                      ? `🎲 Asignar Aleatorio (${unassignedCount} sin asignar)` 
                      : "✓ Todo Asignado"}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="ALL">Todos los estados</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="CONFIRMED">Confirmadas</option>
                    <option value="IN_PROGRESS">En Curso</option>
                    <option value="COMPLETED">Completadas</option>
                    <option value="CANCELLED">Canceladas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de Reservas */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Código / Cliente</th>
                    <th className="px-6 py-4">Fecha & Hora</th>
                    <th className="px-6 py-4">Horas / Extras</th>
                    <th className="px-6 py-4">Total (Gs.)</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Personal Asignado (1-Clic)</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-white text-sm">{b.bookingNumber}</p>
                        <p className="text-slate-300 font-medium">{b.customerName}</p>
                        <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{b.address}</p>
                          {b.latitude && b.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-electric-400 hover:text-electric-300 shrink-0"
                              title="Ver en Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{b.serviceDate}</p>
                        <p className="text-slate-400">{b.serviceTime} hs</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-electric-400">{b.serviceHours} Horas</span>
                        {b.extras && b.extras.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {b.extras.join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-white">
                        {formatGs(b.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : b.status === "IN_PROGRESS"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : b.status === "COMPLETED"
                              ? "bg-slate-700 text-slate-300"
                              : b.status === "CANCELLED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-electric-500/20 text-electric-400 border border-electric-500/30"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Selector Rápido de Personal (Asignar / Reasignar / Quitar) */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <select
                            value={b.assignedCleaner || "UNASSIGNED"}
                            onChange={(e) => handleQuickAssignCleaner(b.id, e.target.value)}
                            className={`w-full max-w-[210px] px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition-colors border ${
                              b.assignedCleaner
                                ? "bg-slate-800 text-emerald-400 border-slate-700 hover:border-emerald-500/50"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400"
                            }`}
                          >
                            <option value="UNASSIGNED">❌ Sin Asignar (Quitar)</option>
                            <option value="RANDOM">🎲 Asignar al Azar</option>
                            <optgroup label="Personal Activo">
                              {employees
                                .filter((e) => e.status === "ACTIVE")
                                .map((emp) => (
                                  <option key={emp.id} value={`${emp.name} (IPS Verificado)`}>
                                    👤 {emp.name} ({emp.zone.split(" ")[0]})
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                          {b.assignedCleaner && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="truncate">{b.assignedCleaner}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(b)}
                            className="px-2.5 py-1.5 bg-electric-600/20 hover:bg-electric-600 text-electric-300 hover:text-white rounded-lg font-bold text-xs border border-electric-500/30 transition-all flex items-center gap-1"
                            title="Editar todos los datos de la reserva"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b.id, b.bookingNumber)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg font-bold text-xs border border-rose-500/20 transition-all"
                            title="Eliminar reserva permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No se encontraron reservas con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL & EMPLEADOS */}
        {activeTab === "EMPLOYEES" && (
          <div className="space-y-6">
            
            {/* Tarjetas KPI de Personal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Personal Registrado</p>
                <p className="text-2xl font-black text-white mt-1.5">{employees.length} Empleados</p>
                <p className="text-[11px] text-emerald-400 mt-1">
                  {employees.filter((e) => e.status === "ACTIVE").length} Activos en servicio
                </p>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Cobertura Seguro IPS</p>
                <p className={`text-2xl font-black mt-1.5 ${ipsCoveragePercentage === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                  {ipsCoveragePercentage}% ({verifiedIpsEmployeesCount}/{totalEmployeesCount})
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {verifiedIpsEmployeesCount} asegurados • {pendingIpsEmployeesCount} en trámite
                </p>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Servicios Asignados</p>
                <p className="text-2xl font-black text-electric-400 mt-1.5">
                  {employees.reduce((acc, e) => acc + (e.activeBookingsCount || 0), 0)} Activos
                </p>
                <p className="text-[11px] text-slate-400 mt-1">En curso o programados</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Calificación Promedio</p>
                <p className="text-2xl font-black text-amber-400 mt-1.5 flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>4.93 / 5.0</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Evaluación de clientes satisfechos</p>
              </div>
            </div>

            {/* Cabecera y Controles de la Tabla de Empleados */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-electric-400" />
                    <span>Nómina de Personal de Limpieza ({filteredEmployees.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personal contratado formalmente bajo normativa laboral paraguaya e IPS.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, C.I. o zona..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingEmployee(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-electric-600 hover:bg-electric-500 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Agregar Empleado</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Empleados */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Empleado / C.I.</th>
                      <th className="px-6 py-4">Contacto Directo</th>
                      <th className="px-6 py-4">Zona Principal</th>
                      <th className="px-6 py-4">Seguro IPS (1-Clic)</th>
                      <th className="px-6 py-4">Trabajos Asignados</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Avatar & Nombre */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-electric-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center border border-electric-400/40 shadow-sm">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-white text-sm">{emp.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                C.I.: {emp.ci || "Sin registrar"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contacto */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <a
                              href={`https://wa.me/595${emp.phone.replace(/\D/g, "").replace(/^0+/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-xs"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{emp.phone}</span>
                            </a>
                            {emp.email && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{emp.email}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Zona */}
                        <td className="px-6 py-4">
                          <p className="text-slate-300 font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-electric-400 shrink-0" />
                            <span>{emp.zone}</span>
                          </p>
                        </td>

                        {/* Seguro IPS con Toggle de 1 Clic */}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleIps(emp.id, Boolean(emp.ipsVerified))}
                            title="Haz clic para alternar entre IPS Verificado y En Trámite"
                            className="group transition-all active:scale-95 text-left"
                          >
                            {emp.ipsVerified ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>IPS Activo</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>En Trámite</span>
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Trabajos Asignados */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold border border-slate-700">
                              <Calendar className="w-3 h-3 text-electric-400" />
                              <span>{emp.activeBookingsCount || 0} activos</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({emp.completedBookingsCount || 0} hechos)
                            </span>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <select
                            value={emp.status}
                            onChange={(e) => handleEmployeeStatusChange(emp.id, e.target.value as any)}
                            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-[11px] font-medium focus:outline-none"
                          >
                            <option value="ACTIVE">🟢 Activo</option>
                            <option value="ON_LEAVE">🟡 De Licencia</option>
                            <option value="INACTIVE">🔴 Inactivo</option>
                          </select>
                        </td>

                        {/* Quitar Empleado */}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-500/30 transition-colors"
                            title="Quitar / Eliminar empleado"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          No se encontraron empleados registrados con ese criterio.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CLIENTES REGISTRADOS */}
        {activeTab === "CUSTOMERS" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Cabecera y Buscador de Clientes */}
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-electric-400" />
                  <span>Base de Datos de Clientes ({filteredUsers.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clientes registrados mediante Google y reservas online.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, email o teléfono..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => loadData()}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  title="Recargar lista de clientes"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-electric-400" />
                  <span className="hidden sm:inline">Actualizar</span>
                </button>
              </div>
            </div>

            {/* Tabla de Clientes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Dirección Principal</th>
                    <th className="px-6 py-4">Reservas</th>
                    <th className="px-6 py-4">Facturación Total</th>
                    <th className="px-6 py-4">Tipo de Cuenta</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Avatar y Nombre */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.image ? (
                            <img
                              src={u.image}
                              alt={u.name || "Cliente"}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-electric-600/30 text-electric-400 font-bold text-sm flex items-center justify-center border border-electric-500/40">
                              {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{u.name || "Usuario Sin Nombre"}</p>
                            <p className="text-[11px] text-slate-400">Registrado: {u.createdAt ? u.createdAt.split(" ")[0] : "Reciente"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-200 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </p>
                        {u.phone ? (
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{u.phone}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">Sin teléfono registrado</p>
                        )}
                      </td>

                      {/* Dirección */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            {u.address ? (
                              <p className="text-slate-300 font-normal max-w-xs truncate" title={u.address}>
                                {u.address}
                              </p>
                            ) : (
                              <span className="text-slate-500 italic">No especificada</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditCustomer(u)}
                            className="p-1 text-slate-400 hover:text-electric-400 hover:bg-slate-800 rounded transition-colors shrink-0"
                            title="Editar dirección de este cliente"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Total de Reservas */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold border border-slate-700">
                          <Calendar className="w-3 h-3 text-electric-400" />
                          <span>{u.totalBookings} servicios</span>
                        </span>
                      </td>

                      {/* Facturación Total Acumulada */}
                      <td className="px-6 py-4 font-black text-emerald-400">
                        {formatGs(u.totalSpentGs)}
                      </td>

                      {/* Tipo de Cuenta */}
                      <td className="px-6 py-4">
                        {u.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <ShieldCheck className="w-3 h-3" />
                            Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-electric-500/20 text-electric-300 border border-electric-500/30">
                            Cliente Verificado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCustomer(u)}
                            className="p-1.5 bg-electric-500/20 hover:bg-electric-500/30 text-electric-400 rounded-lg border border-electric-500/30 transition-colors flex items-center gap-1 text-[11px] font-bold px-2.5"
                            title="Editar dirección y datos del cliente"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          {u.phone && (
                            <a
                              href={`https://wa.me/595${u.phone.replace(/\D/g, "").replace(/^0+/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg border border-emerald-500/30 transition-colors"
                              title="Enviar WhatsApp al cliente"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a
                            href={`mailto:${u.email}`}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                            title="Enviar correo"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No se encontraron clientes registrados con ese criterio de búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Leads Corporativos B2B */}
        {activeTab === "LEADS" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span>Solicitudes y Propuestas Corporativas B2B ({leads.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Empresas, oficinas y locales comerciales que solicitaron cotización formal.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Empresa / RUC</th>
                    <th className="px-6 py-4">Instalación</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Requerimientos</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Gestionar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-white text-sm">{l.companyName}</p>
                        <p className="text-purple-400 font-mono text-[11px]">{l.ruc || "RUC Sin especificar"}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">{l.facilityType}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{l.contactName}</p>
                        <a
                          href={`https://wa.me/595${l.phone.replace(/\D/g, "").replace(/^0+/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{l.phone}</span>
                        </a>
                        {l.email && <p className="text-[11px] text-slate-400">{l.email}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-400 max-w-xs line-clamp-2" title={l.requirements || ""}>
                          {l.requirements || "Sin notas adicionales."}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            l.status === "NEW"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : l.status === "CONTACTED"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : l.status === "QUOTE_SENT"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : l.status === "WON"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={l.status}
                          onChange={(e) => handleLeadStatusChange(l.id, e.target.value as any)}
                          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-[11px] focus:outline-none font-medium"
                        >
                          <option value="NEW">Nuevo</option>
                          <option value="CONTACTED">Contactado</option>
                          <option value="QUOTE_SENT">Cotización Enviada</option>
                          <option value="WON">Ganado / Contratado</option>
                          <option value="CLOSED">Cerrado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No hay solicitudes corporativas registradas aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal para Agregar Nuevo Empleado */}
      {isCreatingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-electric-600/20 text-electric-400 flex items-center justify-center border border-electric-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Registrar Nuevo Empleado</h3>
                  <p className="text-xs text-slate-400">Personal operativo de limpieza profesional</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingEmployee(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nombre y Apellido Completo *</label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Ej: Carmen Benítez"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Cédula de Identidad (C.I.)</label>
                  <input
                    type="text"
                    value={newEmpCi}
                    onChange={(e) => setNewEmpCi(e.target.value)}
                    placeholder="Ej: 3.456.789"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="Ej: 0984 123 456"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  placeholder="ejemplo@aquiestamos.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Barrio / Zona Principal de Cobertura</label>
                <input
                  type="text"
                  value={newEmpZone}
                  onChange={(e) => setNewEmpZone(e.target.value)}
                  placeholder="Ej: Asunción (Villa Morra / Ykua Satî / Carmelitas)"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Estado del Seguro IPS</label>
                <div 
                  onClick={() => setNewEmpIps(!newEmpIps)}
                  className="flex items-center gap-3 bg-slate-800 hover:bg-slate-750 p-3 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    id="empIpsCheck"
                    checked={newEmpIps}
                    onChange={(e) => setNewEmpIps(e.target.checked)}
                    className="w-4 h-4 rounded text-electric-600 bg-slate-900 border-slate-600 focus:ring-electric-500 cursor-pointer"
                  />
                  <label htmlFor="empIpsCheck" className="text-xs font-medium cursor-pointer flex-1">
                    {newEmpIps ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>IPS Activo y Verificado (Inscripción formal confirmada)</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>En Trámite (Pendiente de alta formal en IPS)</span>
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingEmployee(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmp}
                  className="px-5 py-2.5 bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold rounded-xl shadow-electric transition-all disabled:opacity-50"
                >
                  {isSubmittingEmp ? "Guardando..." : "Guardar Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición de Reserva Completa */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <p className="text-xs font-bold uppercase text-electric-400">Administración de Reservas</p>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Reserva {editingBooking.bookingNumber}</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      modalStatus === "CONFIRMED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : modalStatus === "IN_PROGRESS"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : modalStatus === "COMPLETED"
                        ? "bg-slate-700 text-slate-300"
                        : modalStatus === "CANCELLED"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-electric-500/20 text-electric-400 border border-electric-500/30"
                    }`}
                  >
                    {modalStatus}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4">
              {/* Sección 1: Estado & Asignación de Personal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-800/60 rounded-2xl border border-slate-750">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Estado del Servicio</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  >
                    <option value="PENDING">PENDING (Pendiente de confirmación)</option>
                    <option value="CONFIRMED">CONFIRMED (Confirmada / Programada)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (En Curso)</option>
                    <option value="COMPLETED">COMPLETED (Completada con éxito)</option>
                    <option value="CANCELLED">CANCELLED (Cancelada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Personal / Limpiador Asignado</label>
                  <select
                    value={modalCleaner}
                    onChange={(e) => setModalCleaner(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  >
                    <option value="">❌ Sin Asignar</option>
                    {employees
                      .filter((e) => e.status === "ACTIVE")
                      .map((emp) => (
                        <option key={emp.id} value={`${emp.name} (IPS Verificado)`}>
                          👤 {emp.name} — {emp.zone.split(" ")[0]}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Sección 2: Fecha, Horario y Horas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha del Servicio</label>
                  <input
                    type="date"
                    required
                    value={modalServiceDate}
                    onChange={(e) => setModalServiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Horario de Inicio</label>
                  <select
                    value={modalServiceTime}
                    onChange={(e) => setModalServiceTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  >
                    <option value="07:00">07:00 hs (Madrugada)</option>
                    <option value="07:30">07:30 hs</option>
                    <option value="08:00">08:00 hs (Mañana - Recomendado)</option>
                    <option value="08:30">08:30 hs</option>
                    <option value="09:00">09:00 hs</option>
                    <option value="12:00">12:00 hs (Mediodía)</option>
                    <option value="13:00">13:00 hs (Tarde)</option>
                    <option value="14:00">14:00 hs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Horas de Servicio</label>
                  <select
                    value={modalServiceHours}
                    onChange={(e) => setModalServiceHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  >
                    <option value={4}>4 Horas (Básico)</option>
                    <option value={6}>6 Horas (Estándar)</option>
                    <option value={8}>8 Horas (Profundo Completo)</option>
                  </select>
                </div>
              </div>

              {/* Sección 3: Datos del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Cliente *</label>
                  <input
                    type="text"
                    required
                    value={modalCustomerName}
                    onChange={(e) => setModalCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={modalCustomerPhone}
                    onChange={(e) => setModalCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={modalCustomerEmail}
                    onChange={(e) => setModalCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sección 4: Dirección del Inmueble */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Dirección Completa *</label>
                <input
                  type="text"
                  required
                  value={modalAddress}
                  onChange={(e) => setModalAddress(e.target.value)}
                  placeholder="Ej: Avda. Santa Teresa 2250 c/ Herminio Maldonado, Torre 2, Depto 802"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
                {/* Chips de Zonas Rápidas */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    "Villa Morra",
                    "Carmelitas",
                    "Santa Teresa",
                    "Centro",
                    "Luque",
                    "San Lorenzo",
                    "Lambaré",
                    "Fernando de la Mora",
                  ].map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => {
                        if (!modalAddress.includes(zone)) {
                          setModalAddress(modalAddress ? `${modalAddress}, ${zone}` : zone);
                        }
                      }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-electric-500 transition-colors"
                    >
                      + {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección 5: Precio, Método y Estado de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Total a Cobrar (Gs.)</label>
                  <input
                    type="number"
                    value={modalTotalPrice}
                    onChange={(e) => setModalTotalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400 focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Método de Pago</label>
                  <select
                    value={modalPaymentMethod}
                    onChange={(e) => setModalPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  >
                    <option value="cash">💵 Efectivo al finalizar</option>
                    <option value="transfer">🏦 Transferencia SIPAP</option>
                    <option value="card">💳 Tarjeta Débito / Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estado del Cobro</label>
                  <select
                    value={modalPaymentStatus}
                    onChange={(e) => setModalPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  >
                    <option value="PENDING">⏳ Pendiente de Cobro</option>
                    <option value="PAID">✅ Pagado / Cobrado</option>
                    <option value="REFUNDED">↩️ Reembolsado</option>
                  </select>
                </div>
              </div>

              {/* Sección 6: Notas Operativas */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Notas Operativas & Referencias</label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Instrucciones para el personal, acceso al edificio, timbres o notas de cobro..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
              </div>

              {/* Footer con Botón Eliminar a la izquierda y Guardar/Cancelar a la derecha */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(editingBooking.id, editingBooking.bookingNumber)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold rounded-xl border border-rose-500/20 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Reserva</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold rounded-xl shadow-electric transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición de Dirección y Datos del Cliente */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <p className="text-xs font-bold uppercase text-electric-400">Administración de Clientes</p>
                <h3 className="text-lg font-black text-white">Editar Dirección y Contacto</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingCustomer.email}</p>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomerAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={customerEditName}
                  onChange={(e) => setCustomerEditName(e.target.value)}
                  placeholder="Ej: María Benítez"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={customerEditPhone}
                  onChange={(e) => setCustomerEditPhone(e.target.value)}
                  placeholder="Ej: 0981 123 456"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    📍 Dirección Principal de Limpieza *
                  </label>
                  <span className="text-[10px] text-slate-400">Calle, Nro, Depto / Edificio</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={customerEditAddress}
                  onChange={(e) => setCustomerEditAddress(e.target.value)}
                  placeholder="Ej: Avda. Santa Teresa 2250, Edificio Trinity Towers, Depto 802, Asunción"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                />

                {/* Chips de sugerencias de zona rápida */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 self-center">Añadir zona:</span>
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
                        if (!customerEditAddress.includes(zone)) {
                          setCustomerEditAddress((prev) => prev ? `${prev}, ${zone}` : zone);
                        }
                      }}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-[10px] text-slate-300 transition-colors"
                    >
                      + {zone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">RUC (Opcional)</label>
                  <input
                    type="text"
                    value={customerEditRuc}
                    onChange={(e) => setCustomerEditRuc(e.target.value)}
                    placeholder="Ej: 80098765-4"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Razón Social (Opcional)</label>
                  <input
                    type="text"
                    value={customerEditTaxName}
                    onChange={(e) => setCustomerEditTaxName(e.target.value)}
                    placeholder="Ej: Empresa S.A."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-electric-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-5 py-2.5 bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold rounded-xl shadow-electric transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingCustomer ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Dirección</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
