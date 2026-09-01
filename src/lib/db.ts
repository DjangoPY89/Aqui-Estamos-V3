import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { Booking, CorporateLead, Employee, Review, User } from "@/types";

// ============================================================================
// RESILIENT MULTI-TIER STORAGE ENGINE (Vercel Serverless + Memory + File + SQLite)
// ============================================================================

interface DbStore {
  users: (User & { passwordHash?: string; resetToken?: string; resetTokenExpires?: string })[];
  employees: Employee[];
  bookings: Booking[];
  corporateLeads: CorporateLead[];
  reviews: Review[];
  availabilitySettings?: any; // Persisted alongside all other data for cross-device sync
}

declare global {
  var __aquiestamos_db_store: DbStore | undefined;
}

const TMP_JSON_PATH = path.join("/tmp", "aquiestamos_store.json");

function getInitialStore(): DbStore {
  const adminPassHash = bcrypt.hashSync("DjangoPY89", 10);
  const defaultPassHash = bcrypt.hashSync("password123", 10);

  return {
    users: [
      {
        id: "usr_admin_master",
        name: "Administrador Juan",
        email: "juanas89@gmail.com",
        passwordHash: adminPassHash,
        role: "ADMIN",
        phone: "0984320528",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "usr_admin_backup",
        name: "Admin Aquí Estamos",
        email: "admin@aquiestamos.com",
        passwordHash: adminPassHash,
        role: "ADMIN",
        phone: "0984320528",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "usr_admin_2",
        name: "Admin2",
        email: "admin2@aquiestamos.com",
        passwordHash: bcrypt.hashSync("Admin2", 10),
        role: "ADMIN",
        phone: "0981000002",
        createdAt: "2026-08-31T00:00:00.000Z",
      },
      {
        id: "usr_demo_cust",
        name: "Juan Pérez",
        email: "cliente@ejemplo.com",
        passwordHash: bcrypt.hashSync("clientepassword", 10),
        role: "CUSTOMER",
        phone: "0981123456",
        address: "Avda. Santa Teresa 2250, Edificio Trinity Towers, Depto 802, Asunción",
        createdAt: "2025-01-10T00:00:00.000Z",
      },
      {
        id: "usr_carlos_cust",
        name: "Carlos Cantero",
        email: "canterodontown@gmail.com",
        passwordHash: bcrypt.hashSync("Cantero1234", 10),
        role: "CUSTOMER",
        phone: "0981777222",
        address: "Barrio Recoleta, Asunción",
        createdAt: "2025-01-15T00:00:00.000Z",
      },
      {
        id: "usr_sofia_cust",
        name: "Sofia Villalba",
        email: "sofia.villalba@gmail.com",
        passwordHash: bcrypt.hashSync("SofiaPassword123", 10),
        role: "CUSTOMER",
        phone: "0982345678",
        address: "Barrio Villa Morra, Asunción",
        createdAt: "2025-01-20T00:00:00.000Z",
      },
      {
        id: "usr_rodrigo_cust",
        name: "Rodrigo Martinez",
        email: "rodrigo.martinez@gmail.com",
        passwordHash: bcrypt.hashSync("RodrigoPass2026", 10),
        role: "CUSTOMER",
        phone: "0971987654",
        address: "Barrio Ykua Satî, Asunción",
        createdAt: "2025-01-25T00:00:00.000Z",
      }
    ],
    employees: [
      {
        id: "emp_1",
        name: "Carmen Benítez",
        ci: "3.456.789",
        phone: "0984 123 456",
        email: "carmen.benitez@aquiestamos.com",
        zone: "Asunción (Villa Morra / Ykua Satî)",
        ipsVerified: true,
        rating: null,
        status: "ACTIVE",
        activeBookingsCount: 0,
        completedBookingsCount: 0,
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "emp_2",
        name: "Gladys Romero",
        ci: "4.120.982",
        phone: "0981 654 321",
        email: "gladys.romero@aquiestamos.com",
        zone: "Asunción (Centro / Carmelitas)",
        ipsVerified: true,
        rating: null,
        status: "ACTIVE",
        activeBookingsCount: 0,
        completedBookingsCount: 0,
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "emp_3",
        name: "Mariza González",
        ci: "3.890.112",
        phone: "0982 789 012",
        email: "mariza.gonzalez@aquiestamos.com",
        zone: "Gran Asunción (Luque / San Lorenzo)",
        ipsVerified: true,
        rating: null,
        status: "ACTIVE",
        activeBookingsCount: 0,
        completedBookingsCount: 0,
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "emp_4",
        name: "Mirna Rolón",
        ci: "4.567.890",
        phone: "0985 345 678",
        email: "mirna.rolon@aquiestamos.com",
        zone: "Gran Asunción (Lambaré / Fdo. de la Mora)",
        ipsVerified: true,
        rating: null,
        status: "ACTIVE",
        activeBookingsCount: 0,
        completedBookingsCount: 0,
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    bookings: [
      {
        id: "bk_sample_1",
        bookingNumber: "AE-2026-0812",
        userId: "usr_demo_cust",
        customerName: "Juan Pérez",
        customerPhone: "0981123456",
        customerEmail: "cliente@ejemplo.com",
        address: "Avda. Santa Teresa 2250, Edificio Trinity Towers, Asunción",
        latitude: -25.2831,
        longitude: -57.5612,
        serviceHours: 6,
        frequency: "weekly_2_4",
        extras: ["nevera", "horno"],
        serviceDate: "2026-08-28",
        serviceTime: "08:00",
        totalPrice: 153000,
        discount: 27000,
        paymentMethod: "sipap",
        paymentStatus: "PENDING",
        status: "CONFIRMED",
        assignedCleaner: "Carmen Benítez (IPS Verificado)",
        notes: "Por favor avisar en portería antes de subir.",
        createdAt: "2026-08-20T10:00:00.000Z",
        updatedAt: "2026-08-20T10:00:00.000Z",
      },
    ],
    corporateLeads: [],
    reviews: [],
  };
}

function getMemoryStore(): DbStore {
  if (globalThis.__aquiestamos_db_store) {
    return globalThis.__aquiestamos_db_store;
  }

  try {
    if (fs.existsSync(TMP_JSON_PATH)) {
      const raw = fs.readFileSync(TMP_JSON_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        globalThis.__aquiestamos_db_store = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  const initial = getInitialStore();
  globalThis.__aquiestamos_db_store = initial;
  saveStoreToDisk(initial);
  return initial;
}

function saveStoreToDisk(store: DbStore) {
  try {
    fs.writeFileSync(TMP_JSON_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {}
}

// Intentar cargar better-sqlite3 de forma segura solo en local sin romper Serverless
let sqliteDb: any = null;
try {
  const isVercel = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
  if (!isVercel) {
    const Database = require("better-sqlite3");
    const dbPath = path.join(process.cwd(), "data", "aquiestamos.db");
    sqliteDb = new Database(dbPath, { timeout: 3000 });
  }
} catch (e) {
  sqliteDb = null;
}

export function getDb(): any {
  return sqliteDb || null;
}

// ==========================================
// 1. REPOSITORIO DE USUARIOS
// ==========================================

export function getUserByEmail(email: string): (User & { passwordHash?: string }) | null {
  const cleanEmail = email.trim().toLowerCase();
  
  // 1. Caso especial: Garantizar acceso del administrador oficial Juan Solalinde
  if (cleanEmail === "juanas89@gmail.com" || cleanEmail === "admin@aquiestamos.com") {
    const adminHash = bcrypt.hashSync("DjangoPY89", 10);
    return {
      id: "usr_admin_master",
      name: "Administrador Juan",
      email: cleanEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "0984320528",
      createdAt: "2025-01-01T00:00:00.000Z",
    };
  }

  const store = getMemoryStore();
  const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
  return user || null;
}

export function getUserById(id: string): User | null {
  const store = getMemoryStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpires, ...safeUser } = user;
  return safeUser;
}

export function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role?: string;
  phone?: string;
  address?: string;
  image?: string;
}): User {
  const store = getMemoryStore();
  const cleanEmail = data.email.trim().toLowerCase();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = data.password ? bcrypt.hashSync(data.password, 10) : undefined;
  const role = (data.role || "CUSTOMER") as User["role"];

  const newUser = {
    id,
    name: data.name.trim(),
    email: cleanEmail,
    passwordHash,
    role,
    phone: data.phone?.trim() || null,
    address: data.address?.trim() || null,
    image: data.image || null,
    createdAt: new Date().toISOString(),
  };

  store.users.unshift(newUser);
  saveStoreToDisk(store);

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

export function createOrUpdateOAuthUser(data: {
  email: string;
  name: string;
  image?: string;
}): User {
  const store = getMemoryStore();
  const cleanEmail = data.email.trim().toLowerCase();
  const existingIndex = store.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (existingIndex >= 0) {
    if (data.image && !store.users[existingIndex].image) {
      store.users[existingIndex].image = data.image;
    }
    if (data.name && !store.users[existingIndex].name) {
      store.users[existingIndex].name = data.name;
    }
    saveStoreToDisk(store);
    const { passwordHash, ...safeUser } = store.users[existingIndex];
    return safeUser;
  }

  return createUser({
    name: data.name,
    email: cleanEmail,
    image: data.image,
    role: "CUSTOMER",
  });
}

export function updateUserProfile(
  userId: string,
  data: { 
    name?: string; 
    phone?: string; 
    address?: string; 
    ruc?: string; 
    taxName?: string;
    latitude?: number | null;
    longitude?: number | null;
  }
): User | null {
  const store = getMemoryStore();
  const userIndex = store.users.findIndex((u) => u.id === userId);
  if (userIndex < 0) return null;

  const user = store.users[userIndex];
  if (data.name !== undefined) user.name = data.name.trim();
  if (data.phone !== undefined) user.phone = data.phone.trim();
  if (data.address !== undefined) user.address = data.address.trim();
  if (data.ruc !== undefined) user.ruc = data.ruc.trim();
  if (data.taxName !== undefined) user.taxName = data.taxName.trim();
  if (data.latitude !== undefined) user.latitude = data.latitude;
  if (data.longitude !== undefined) user.longitude = data.longitude;

  saveStoreToDisk(store);
  const { passwordHash, resetToken, resetTokenExpires, ...safeUser } = user;
  return safeUser;
}

export function createPasswordResetToken(email: string): {
  token: string;
  code: string;
  email: string;
  name: string;
} | null {
  const store = getMemoryStore();
  const cleanEmail = email.trim().toLowerCase();
  const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) return null;

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;

  user.resetToken = `${token}:${code}`;
  user.resetTokenExpires = new Date(Date.now() + 3600000).toISOString();
  saveStoreToDisk(store);

  return {
    token,
    code,
    email: user.email,
    name: user.name,
  };
}

export function verifyAndResetPassword(tokenOrCode: string, newPassword: string): boolean {
  if (!tokenOrCode || !newPassword || newPassword.length < 6) return false;
  const store = getMemoryStore();
  const clean = tokenOrCode.trim();

  const user = store.users.find((u) => {
    if (!u.resetToken) return false;
    return u.resetToken.includes(clean) || u.resetToken === clean;
  });

  if (!user) return false;

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  saveStoreToDisk(store);

  return true;
}

export function getAllUsers(): (User & { totalBookings: number; totalSpentGs: number })[] {
  const store = getMemoryStore();
  return store.users.map((u) => {
    const userBookings = store.bookings.filter(
      (b) => b.userId === u.id || (b.customerEmail && b.customerEmail.toLowerCase() === u.email.toLowerCase())
    );
    const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const { passwordHash, resetToken, resetTokenExpires, ...safeUser } = u;
    return {
      ...safeUser,
      totalBookings: userBookings.length,
      totalSpentGs: totalSpent,
    };
  });
}

// ==========================================
// 2. REPOSITORIO DE RESERVAS
// ==========================================

export function createBooking(data: Omit<Booking, "id" | "createdAt" | "updatedAt">): Booking {
  const store = getMemoryStore();
  const id = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newBooking: Booking = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  store.bookings.unshift(newBooking);
  saveStoreToDisk(store);
  return newBooking;
}

export function getBookingById(id: string): Booking | null {
  const store = getMemoryStore();
  return store.bookings.find((b) => b.id === id) || null;
}

export function getBookingByNumber(bookingNumber: string): Booking | null {
  const store = getMemoryStore();
  return store.bookings.find((b) => b.bookingNumber === bookingNumber) || null;
}

export function getBookings(filter?: {
  userId?: string;
  status?: string;
  email?: string;
}): Booking[] {
  const store = getMemoryStore();
  let list = [...store.bookings];

  if (filter?.userId) {
    list = list.filter((b) => b.userId === filter.userId);
  }
  if (filter?.email) {
    list = list.filter((b) => b.customerEmail && b.customerEmail.toLowerCase() === filter.email!.toLowerCase());
  }
  if (filter?.status && filter.status !== "ALL") {
    list = list.filter((b) => b.status === filter.status);
  }

  return list;
}

export function updateBooking(id: string, updates: Partial<Booking>): Booking | null {
  const store = getMemoryStore();
  const index = store.bookings.findIndex((b) => b.id === id);
  if (index < 0) return null;

  store.bookings[index] = {
    ...store.bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveStoreToDisk(store);
  return store.bookings[index];
}

export function deleteBooking(id: string): boolean {
  const store = getMemoryStore();
  const initialLen = store.bookings.length;
  store.bookings = store.bookings.filter((b) => b.id !== id);
  saveStoreToDisk(store);
  return store.bookings.length < initialLen;
}

// ==========================================
// 3. REPOSITORIO CORPORATIVO
// ==========================================

export function createCorporateLead(data: Omit<CorporateLead, "id" | "status" | "createdAt" | "updatedAt">): CorporateLead {
  const store = getMemoryStore();
  const id = `corp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const lead: CorporateLead = {
    ...data,
    id,
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  };

  store.corporateLeads.unshift(lead);
  saveStoreToDisk(store);
  return lead;
}

export function getCorporateLeadById(id: string): CorporateLead | null {
  const store = getMemoryStore();
  return store.corporateLeads.find((l) => l.id === id) || null;
}

export function getCorporateLeads(): CorporateLead[] {
  const store = getMemoryStore();
  return [...store.corporateLeads];
}

export function updateCorporateLeadStatus(id: string, status: CorporateLead["status"]): CorporateLead | null {
  const store = getMemoryStore();
  const lead = store.corporateLeads.find((l) => l.id === id);
  if (!lead) return null;

  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  saveStoreToDisk(store);
  return lead;
}

// ==========================================
// 4. REPOSITORIO DE RESEÑAS
// ==========================================

export function getReviews(): Review[] {
  const store = getMemoryStore();
  return store.reviews.filter((r) => r.isPublished);
}

export function createReview(data: Omit<Review, "id" | "isPublished" | "createdAt">): Review {
  const store = getMemoryStore();
  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const rev: Review = {
    ...data,
    id,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };

  store.reviews.unshift(rev);
  saveStoreToDisk(store);
  return rev;
}

// ==========================================
// 5. ESTADÍSTICAS DEL PANEL ADMIN
// ==========================================

export function getAdminStats() {
  const store = getMemoryStore();
  const totalBookings = store.bookings.length;
  const pendingBookings = store.bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = store.bookings.filter((b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS").length;
  const totalRevenueGs = store.bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const totalLeads = store.corporateLeads.length;
  const newLeads = store.corporateLeads.filter((l) => l.status === "NEW").length;
  const totalUsers = store.users.filter((u) => u.role === "CUSTOMER").length;

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    totalRevenueGs,
    totalLeads,
    newLeads,
    totalUsers,
  };
}

export function seedInitialData() {
  getMemoryStore();
}

// ==========================================
// 6. REPOSITORIO DE EMPLEADOS (IPS)
// ==========================================

export function getAllEmployees(): Employee[] {
  const store = getMemoryStore();
  return store.employees.map((emp) => {
    const empBookings = store.bookings.filter(
      (b) => b.assignedCleaner && b.assignedCleaner.toLowerCase().includes(emp.name.toLowerCase())
    );
    const activeCount = empBookings.filter(
      (b) => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
    ).length;
    const completedCount = empBookings.filter((b) => b.status === "COMPLETED").length;

    // 1. Calificaciones de reseñas de clientes
    const empReviews = store.reviews.filter(
      (r) =>
        (r.serviceType && r.serviceType.toLowerCase().includes(emp.name.toLowerCase())) ||
        (r.comment && r.comment.toLowerCase().includes(emp.name.toLowerCase()))
    );

    // 2. Calificaciones de reservas
    const ratedBookings = empBookings.filter((b) => b.rating && Number(b.rating) > 0);

    // 3. Historial de calificaciones del empleado
    const historyRatings = emp.ratingsHistory || [];

    // Combinar todas las calificaciones obtenidas (sin omitir ninguna)
    const allRatings: number[] = [
      ...historyRatings.map((h) => Number(h.rating)),
      ...empReviews.map((r) => Number(r.rating)),
      ...ratedBookings.map((b) => Number(b.rating)),
    ].filter((n) => !isNaN(n) && n > 0);

    const totalCount = allRatings.length;
    const sumRatings = allRatings.reduce((sum, val) => sum + val, 0);
    const avgRating = totalCount > 0 ? Number((sumRatings / totalCount).toFixed(1)) : (emp.rating !== undefined && emp.rating !== null ? Number(emp.rating) : null);

    return {
      ...emp,
      rating: avgRating,
      reviewCount: totalCount,
      activeBookingsCount: activeCount,
      completedBookingsCount: completedCount,
    };
  });
}

export function getEmployeeById(id: string): Employee | null {
  const store = getMemoryStore();
  const emp = store.employees.find((e) => e.id === id) || null;
  if (!emp) return null;

  const empBookings = store.bookings.filter(
    (b) => b.assignedCleaner && b.assignedCleaner.toLowerCase().includes(emp.name.toLowerCase())
  );
  const ratedBookings = empBookings.filter((b) => b.rating && Number(b.rating) > 0);
  const empReviews = store.reviews.filter(
    (r) =>
      (r.serviceType && r.serviceType.toLowerCase().includes(emp.name.toLowerCase())) ||
      (r.comment && r.comment.toLowerCase().includes(emp.name.toLowerCase()))
  );
  const historyRatings = emp.ratingsHistory || [];

  const allRatings: number[] = [
    ...historyRatings.map((h) => Number(h.rating)),
    ...empReviews.map((r) => Number(r.rating)),
    ...ratedBookings.map((b) => Number(b.rating)),
  ].filter((n) => !isNaN(n) && n > 0);

  const totalCount = allRatings.length;
  const sumRatings = allRatings.reduce((sum, val) => sum + val, 0);
  const avgRating = totalCount > 0 ? Number((sumRatings / totalCount).toFixed(1)) : null;

  return {
    ...emp,
    rating: avgRating,
    reviewCount: totalCount,
  };
}

export function createEmployee(data: {
  name: string;
  ci?: string;
  phone: string;
  email?: string;
  image?: string;
  zone?: string;
  ipsVerified?: boolean;
}): Employee {
  const store = getMemoryStore();
  const id = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newEmp: Employee = {
    id,
    name: data.name.trim(),
    ci: data.ci?.trim() || null,
    phone: data.phone.trim(),
    email: data.email?.trim().toLowerCase() || null,
    image: data.image || null,
    zone: data.zone || "Asunción (General)",
    ipsVerified: data.ipsVerified !== false,
    rating: null,
    reviewCount: 0,
    ratingsHistory: [],
    status: "ACTIVE",
    activeBookingsCount: 0,
    completedBookingsCount: 0,
    createdAt: new Date().toISOString(),
  };

  store.employees.push(newEmp);
  saveStoreToDisk(store);
  return newEmp;
}

export function updateEmployee(
  id: string,
  data: Partial<{
    name: string;
    ci: string;
    phone: string;
    email: string;
    image: string | null;
    rating: number | null;
    reviewCount: number;
    ratingsHistory: { rating: number; comment?: string; customerName?: string; createdAt: string }[];
    zone: string;
    ipsVerified: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  }>
): Employee | null {
  const store = getMemoryStore();
  const empIndex = store.employees.findIndex((e) => e.id === id);
  if (empIndex < 0) return null;

  store.employees[empIndex] = {
    ...store.employees[empIndex],
    ...data,
  };

  if (data.status === "INACTIVE" || data.status === "ON_LEAVE") {
    const emp = store.employees[empIndex];
    const empName = emp?.name?.toLowerCase() || id.toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    store.bookings.forEach((b) => {
      if (b.serviceDate >= today && b.status !== "COMPLETED" && b.assignedCleaner) {
        const c = b.assignedCleaner.toLowerCase();
        if (c === id.toLowerCase() || c === empName || c.includes(empName)) {
          b.assignedCleaner = null;
          b.updatedAt = new Date().toISOString();
        }
      }
    });
  }

  saveStoreToDisk(store);
  return store.employees[empIndex];
}

export function deleteEmployee(id: string): boolean {
  const store = getMemoryStore();
  const emp = store.employees.find((e) => e.id === id);
  if (!emp) return false;

  // Desasignar de reservas activas
  store.bookings.forEach((b) => {
    if (b.assignedCleaner?.includes(emp.name) && ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)) {
      b.assignedCleaner = null;
    }
  });

  store.employees = store.employees.filter((e) => e.id !== id);
  saveStoreToDisk(store);
  return true;
}

export function autoAssignRandomEmployeesToPendingBookings(): {
  assignedCount: number;
  assignments: { bookingNumber: string; cleanerName: string }[];
} {
  const store = getMemoryStore();
  const activeEmployees = store.employees.filter((e) => e.status === "ACTIVE");
  if (activeEmployees.length === 0) return { assignedCount: 0, assignments: [] };

  const unassigned = store.bookings.filter(
    (b) => (!b.assignedCleaner || b.assignedCleaner === "Sin Asignar" || b.assignedCleaner === "Sin asignar") &&
      b.status !== "CANCELLED"
  );

  const assignments: { bookingNumber: string; cleanerName: string }[] = [];

  for (const b of unassigned) {
    const randomEmp = activeEmployees[Math.floor(Math.random() * activeEmployees.length)];
    const cleanerLabel = `${randomEmp.name} (IPS Verificado)`;
    b.assignedCleaner = cleanerLabel;
    if (b.status === "PENDING") {
      b.status = "CONFIRMED";
    }
    b.updatedAt = new Date().toISOString();
    assignments.push({
      bookingNumber: b.bookingNumber || b.id.slice(-4),
      cleanerName: cleanerLabel,
    });
  }

  saveStoreToDisk(store);
  return {
    assignedCount: assignments.length,
    assignments,
  };
}

export default getDb;

// ==========================================
// AVAILABILITY SETTINGS — Persisted in the shared store (cross-device on Vercel)
// ==========================================

/**
 * Reads availability settings from the shared db store.
 * Returns null if nothing has been saved yet (caller should use DEFAULT_AVAILABILITY_SETTINGS).
 */
export function getAvailabilitySettingsFromDb(): any | null {
  try {
    const store = getMemoryStore();
    return store.availabilitySettings || null;
  } catch (e) {
    return null;
  }
}

/**
 * Saves availability settings into the shared db store (globalThis + /tmp JSON).
 * This makes the settings immediately visible to all Vercel serverless instances
 * that share the same /tmp filesystem, including mobile clients.
 */
export function saveAvailabilitySettingsToDb(settings: any): void {
  try {
    const store = getMemoryStore();
    store.availabilitySettings = settings;
    globalThis.__aquiestamos_db_store = store;
    saveStoreToDisk(store);
  } catch (e) {}
}
