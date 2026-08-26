import { getSupabase } from "./supabase";
import bcrypt from "bcryptjs";
import { Booking, CorporateLead, Employee, Review, User } from "@/types";

// ==========================================
// 1. REPOSITORIO DE USUARIOS
// ==========================================

export async function supabaseGetUserByEmail(email: string): Promise<(User & { passwordHash?: string }) | null> {
  const supabase = getSupabase();
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    image: data.image,
    role: data.role || "CUSTOMER",
    phone: data.phone,
    address: data.address,
    ruc: data.ruc,
    taxName: data.tax_name,
    createdAt: data.created_at,
  };
}

export async function supabaseGetUserById(id: string): Promise<User | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    image: data.image,
    role: data.role || "CUSTOMER",
    phone: data.phone,
    address: data.address,
    ruc: data.ruc,
    taxName: data.tax_name,
    createdAt: data.created_at,
  };
}

export async function supabaseCreateUser(data: {
  name: string;
  email: string;
  password?: string;
  role?: string;
  phone?: string;
  address?: string;
  image?: string;
}): Promise<User> {
  const supabase = getSupabase();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = data.password ? bcrypt.hashSync(data.password, 10) : null;
  const role = data.role || "CUSTOMER";
  const cleanEmail = data.email.trim().toLowerCase();

  const { data: inserted, error } = await supabase
    .from("users")
    .insert({
      id,
      name: data.name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      image: data.image || null,
      role,
      phone: data.phone ? data.phone.trim() : null,
      address: data.address ? data.address.trim() : null,
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || "Error al crear usuario en Supabase");
  }

  return {
    id: inserted.id,
    name: inserted.name,
    email: inserted.email,
    image: inserted.image,
    role: inserted.role,
    phone: inserted.phone,
    address: inserted.address,
    ruc: inserted.ruc,
    taxName: inserted.tax_name,
    createdAt: inserted.created_at,
  };
}

export async function supabaseCreateOrUpdateOAuthUser(data: {
  email: string;
  name: string;
  image?: string;
}): Promise<User> {
  const cleanEmail = data.email.trim().toLowerCase();
  const existing = await supabaseGetUserByEmail(cleanEmail);

  if (existing) {
    if (data.image && !existing.image) {
      const supabase = getSupabase();
      await supabase
        .from("users")
        .update({ image: data.image, name: data.name })
        .eq("id", existing.id);
    }
    return (await supabaseGetUserById(existing.id))!;
  }

  return await supabaseCreateUser({
    name: data.name,
    email: cleanEmail,
    image: data.image,
    role: "CUSTOMER",
  });
}

export async function supabaseGetAllUsers(): Promise<(User & { totalBookings: number; totalSpentGs: number })[]> {
  const supabase = getSupabase();

  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (usersErr || !users) return [];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("user_id, customer_email, total_price");

  return users.map((u) => {
    const userBookings = (bookings || []).filter(
      (b) => b.user_id === u.id || (b.customer_email && b.customer_email.toLowerCase() === u.email.toLowerCase())
    );
    const totalSpent = userBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role || "CUSTOMER",
      phone: u.phone,
      address: u.address,
      ruc: u.ruc,
      taxName: u.tax_name,
      createdAt: u.created_at,
      totalBookings: userBookings.length,
      totalSpentGs: totalSpent,
    };
  });
}

export async function supabaseUpdateUser(
  id: string,
  data: Partial<{
    name: string;
    phone: string;
    address: string;
    ruc: string;
    taxName: string;
    image: string;
  }>
): Promise<User | null> {
  const supabase = getSupabase();
  const updatePayload: any = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.address !== undefined) updatePayload.address = data.address;
  if (data.ruc !== undefined) updatePayload.ruc = data.ruc;
  if (data.taxName !== undefined) updatePayload.tax_name = data.taxName;
  if (data.image !== undefined) updatePayload.image = data.image;
  updatePayload.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) return null;

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    image: updated.image,
    role: updated.role,
    phone: updated.phone,
    address: updated.address,
    ruc: updated.ruc,
    taxName: updated.tax_name,
    createdAt: updated.created_at,
  };
}

export async function supabaseCreatePasswordResetToken(email: string) {
  const supabase = getSupabase();
  const cleanEmail = email.trim().toLowerCase();
  const user = await supabaseGetUserByEmail(cleanEmail);
  if (!user) return null;

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

  await supabase
    .from("users")
    .update({
      reset_token: `${code}|${token}`,
      reset_token_expires: expiresAt,
    })
    .eq("id", user.id);

  return {
    email: user.email,
    name: user.name || "Cliente",
    code,
    token,
  };
}

export async function supabaseVerifyAndResetPassword(tokenOrCode: string, newPassword: string): Promise<boolean> {
  const supabase = getSupabase();
  const clean = tokenOrCode.trim();

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .not("reset_token", "is", null);

  if (error || !users) return false;

  const user = users.find((u) => {
    if (!u.reset_token) return false;
    const parts = u.reset_token.split("|");
    const matches = parts.includes(clean);
    const notExpired = u.reset_token_expires ? new Date(u.reset_token_expires) > new Date() : true;
    return matches && notExpired;
  });

  if (!user) return false;

  const newHash = bcrypt.hashSync(newPassword, 10);
  await supabase
    .from("users")
    .update({
      password_hash: newHash,
      reset_token: null,
      reset_token_expires: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return true;
}

// ==========================================
// 2. REPOSITORIO DE EMPLEADOS
// ==========================================

export async function supabaseGetAllEmployees(): Promise<Employee[]> {
  const supabase = getSupabase();
  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .order("name", { ascending: true });

  if (error || !employees) return [];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("assigned_cleaner, status");

  return employees.map((e) => {
    const activeCount = (bookings || []).filter(
      (b) => b.assigned_cleaner && b.assigned_cleaner.includes(e.name) && ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
    ).length;

    const completedCount = (bookings || []).filter(
      (b) => b.assigned_cleaner && b.assigned_cleaner.includes(e.name) && b.status === "COMPLETED"
    ).length;

    return {
      id: e.id,
      name: e.name,
      ci: e.ci,
      phone: e.phone,
      email: e.email,
      image: e.image,
      zone: e.zone || "Asunción y Gran Asunción",
      ipsVerified: Boolean(e.ips_verified),
      rating: Number(e.rating || 5.0),
      status: e.status as Employee["status"],
      activeBookingsCount: activeCount,
      completedBookingsCount: completedCount,
      createdAt: e.created_at,
    };
  });
}

export async function supabaseGetEmployeeById(id: string): Promise<Employee | null> {
  const supabase = getSupabase();
  const { data: e, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !e) return null;

  return {
    id: e.id,
    name: e.name,
    ci: e.ci,
    phone: e.phone,
    email: e.email,
    image: e.image,
    zone: e.zone || "Asunción y Gran Asunción",
    ipsVerified: Boolean(e.ips_verified),
    rating: Number(e.rating || 5.0),
    status: e.status as Employee["status"],
    createdAt: e.created_at,
  };
}

export async function supabaseCreateEmployee(data: {
  name: string;
  ci?: string;
  phone: string;
  email?: string;
  image?: string;
  zone?: string;
  ipsVerified?: boolean;
}): Promise<Employee> {
  const supabase = getSupabase();
  const id = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const { data: inserted, error } = await supabase
    .from("employees")
    .insert({
      id,
      name: data.name.trim(),
      ci: data.ci ? data.ci.trim() : null,
      phone: data.phone.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      image: data.image || null,
      zone: data.zone || "Asunción (General)",
      ips_verified: data.ipsVerified !== false,
      rating: 5.0,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || "Error al crear empleado en Supabase");
  }

  return (await supabaseGetEmployeeById(id))!;
}

export async function supabaseUpdateEmployee(
  id: string,
  data: Partial<{
    name: string;
    ci: string;
    phone: string;
    email: string;
    image: string;
    zone: string;
    ipsVerified: boolean;
    rating: number;
    status: Employee["status"];
  }>
): Promise<Employee | null> {
  const supabase = getSupabase();
  const updatePayload: any = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.ci !== undefined) updatePayload.ci = data.ci;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.image !== undefined) updatePayload.image = data.image;
  if (data.zone !== undefined) updatePayload.zone = data.zone;
  if (data.ipsVerified !== undefined) updatePayload.ips_verified = data.ipsVerified;
  if (data.rating !== undefined) updatePayload.rating = data.rating;
  if (data.status !== undefined) updatePayload.status = data.status;
  updatePayload.updated_at = new Date().toISOString();

  await supabase.from("employees").update(updatePayload).eq("id", id);
  return await supabaseGetEmployeeById(id);
}

export async function supabaseDeleteEmployee(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  return !error;
}

// ==========================================
// 3. REPOSITORIO DE RESERVAS
// ==========================================

export async function supabaseGetAllBookings(): Promise<Booking[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("service_date", { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    bookingNumber: r.booking_number,
    userId: r.user_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    serviceHours: r.service_hours,
    frequency: r.frequency,
    extras: typeof r.extras === "string" ? JSON.parse(r.extras) : (r.extras || []),
    serviceDate: r.service_date,
    serviceTime: r.service_time,
    totalPrice: r.total_price,
    discount: r.discount || 0,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    status: r.status,
    assignedCleaner: r.assigned_cleaner,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at || r.created_at,
  }));
}

export async function supabaseGetBookingById(id: string): Promise<Booking | null> {
  const supabase = getSupabase();
  const { data: r, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !r) return null;

  return {
    id: r.id,
    bookingNumber: r.booking_number,
    userId: r.user_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    serviceHours: r.service_hours,
    frequency: r.frequency,
    extras: typeof r.extras === "string" ? JSON.parse(r.extras) : (r.extras || []),
    serviceDate: r.service_date,
    serviceTime: r.service_time,
    totalPrice: r.total_price,
    discount: r.discount || 0,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    status: r.status,
    assignedCleaner: r.assigned_cleaner,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at || r.created_at,
  };
}

export async function supabaseGetBookingsByUserId(userId: string): Promise<Booking[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("service_date", { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    bookingNumber: r.booking_number,
    userId: r.user_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    serviceHours: r.service_hours,
    frequency: r.frequency,
    extras: typeof r.extras === "string" ? JSON.parse(r.extras) : (r.extras || []),
    serviceDate: r.service_date,
    serviceTime: r.service_time,
    totalPrice: r.total_price,
    discount: r.discount || 0,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    status: r.status,
    assignedCleaner: r.assigned_cleaner,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at || r.created_at,
  }));
}

export async function supabaseCreateBooking(data: {
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  latitude?: number;
  longitude?: number;
  serviceHours: number;
  frequency: string;
  extras: string[];
  serviceDate: string;
  serviceTime: string;
  totalPrice: number;
  discount?: number;
  paymentMethod: string;
  notes?: string;
}): Promise<Booking> {
  const supabase = getSupabase();
  const id = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const dateStr = data.serviceDate.replace(/-/g, "").substring(2);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const bookingNumber = `AE-${dateStr}-${randomSuffix}`;

  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      id,
      booking_number: bookingNumber,
      user_id: data.userId || null,
      customer_name: data.customerName.trim(),
      customer_phone: data.customerPhone.trim(),
      customer_email: data.customerEmail.trim().toLowerCase(),
      address: data.address.trim(),
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      service_hours: data.serviceHours,
      frequency: data.frequency,
      extras: data.extras || [],
      service_date: data.serviceDate,
      service_time: data.serviceTime,
      total_price: data.totalPrice,
      discount: data.discount || 0,
      payment_method: data.paymentMethod,
      payment_status: "PENDING",
      status: "PENDING",
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || "Error al registrar reserva en Supabase");
  }

  return (await supabaseGetBookingById(id))!;
}

export async function supabaseUpdateBooking(
  id: string,
  data: Partial<{
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address: string;
    serviceDate: string;
    serviceTime: string;
    serviceHours: number;
    totalPrice: number;
    paymentMethod: string;
    paymentStatus: string;
    status: Booking["status"];
    assignedCleaner: string;
    notes: string;
  }>
): Promise<Booking | null> {
  const supabase = getSupabase();
  const updatePayload: any = {};
  if (data.customerName !== undefined) updatePayload.customer_name = data.customerName;
  if (data.customerPhone !== undefined) updatePayload.customer_phone = data.customerPhone;
  if (data.customerEmail !== undefined) updatePayload.customer_email = data.customerEmail;
  if (data.address !== undefined) updatePayload.address = data.address;
  if (data.serviceDate !== undefined) updatePayload.service_date = data.serviceDate;
  if (data.serviceTime !== undefined) updatePayload.service_time = data.serviceTime;
  if (data.serviceHours !== undefined) updatePayload.service_hours = data.serviceHours;
  if (data.totalPrice !== undefined) updatePayload.total_price = data.totalPrice;
  if (data.paymentMethod !== undefined) updatePayload.payment_method = data.paymentMethod;
  if (data.paymentStatus !== undefined) updatePayload.payment_status = data.paymentStatus;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.assignedCleaner !== undefined) updatePayload.assigned_cleaner = data.assignedCleaner;
  if (data.notes !== undefined) updatePayload.notes = data.notes;
  updatePayload.updated_at = new Date().toISOString();

  await supabase.from("bookings").update(updatePayload).eq("id", id);
  return await supabaseGetBookingById(id);
}

export async function supabaseDeleteBooking(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  return !error;
}

// ==========================================
// 4. LEADS CORPORATIVOS
// ==========================================

export async function supabaseGetAllCorporateLeads(): Promise<CorporateLead[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("corporate_leads")
    .select("*")
    .neq("id", "sys_availability_settings")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((l) => ({
    id: l.id,
    companyName: l.company_name,
    ruc: l.ruc,
    facilityType: l.facility_type,
    contactName: l.contact_name,
    phone: l.phone,
    email: l.email,
    requirements: l.requirements,
    status: l.status as CorporateLead["status"],
    createdAt: l.created_at,
    updatedAt: l.updated_at || l.created_at,
  }));
}

export async function supabaseCreateCorporateLead(data: {
  companyName: string;
  ruc?: string;
  facilityType: string;
  contactName: string;
  phone: string;
  email?: string;
  requirements?: string;
}): Promise<CorporateLead> {
  const supabase = getSupabase();
  const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const { data: inserted, error } = await supabase
    .from("corporate_leads")
    .insert({
      id,
      company_name: data.companyName.trim(),
      ruc: data.ruc ? data.ruc.trim() : null,
      facility_type: data.facilityType,
      contact_name: data.contactName.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      requirements: data.requirements || null,
      status: "NEW",
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || "Error al registrar solicitud corporativa");
  }

  return {
    id: inserted.id,
    companyName: inserted.company_name,
    ruc: inserted.ruc,
    facilityType: inserted.facility_type,
    contactName: inserted.contact_name,
    phone: inserted.phone,
    email: inserted.email,
    requirements: inserted.requirements,
    status: inserted.status as CorporateLead["status"],
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at || inserted.created_at,
  };
}

export async function supabaseUpdateCorporateLeadStatus(
  id: string,
  status: CorporateLead["status"]
): Promise<CorporateLead | null> {
  const supabase = getSupabase();
  const { data: updated, error } = await supabase
    .from("corporate_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) return null;

  return {
    id: updated.id,
    companyName: updated.company_name,
    ruc: updated.ruc,
    facilityType: updated.facility_type,
    contactName: updated.contact_name,
    phone: updated.phone,
    email: updated.email,
    requirements: updated.requirements,
    status: updated.status as CorporateLead["status"],
    createdAt: updated.created_at,
    updatedAt: updated.updated_at || updated.created_at,
  };
}

// ==========================================
// 5. RESEÑAS
// ==========================================

export async function supabaseGetAllReviews(): Promise<Review[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    userImage: r.user_image,
    rating: r.rating,
    comment: r.comment,
    serviceType: r.service_type,
    isPublished: Boolean(r.is_published),
    createdAt: r.created_at,
  }));
}

export async function supabaseCreateReview(data: {
  userId?: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  serviceType: string;
}): Promise<Review> {
  const supabase = getSupabase();
  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const { data: inserted, error } = await supabase
    .from("reviews")
    .insert({
      id,
      user_id: data.userId || null,
      user_name: data.userName.trim(),
      user_image: data.userImage || null,
      rating: data.rating,
      comment: data.comment.trim(),
      service_type: data.serviceType,
      is_published: true,
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(error?.message || "Error al crear reseña en Supabase");
  }

  return {
    id: inserted.id,
    userId: inserted.user_id,
    userName: inserted.user_name,
    userImage: inserted.user_image,
    rating: inserted.rating,
    comment: inserted.comment,
    serviceType: inserted.service_type,
    isPublished: Boolean(inserted.is_published),
    createdAt: inserted.created_at,
  };
}

// ==========================================
// 6. ESTADÍSTICAS DEL PANEL ADMINISTRATIVO
// ==========================================

export async function supabaseGetAdminStats() {
  const supabase = getSupabase();

  const [bookingsRes, leadsRes, usersRes] = await Promise.all([
    supabase.from("bookings").select("status, total_price"),
    supabase.from("corporate_leads").select("status").neq("id", "sys_availability_settings"),
    supabase.from("users").select("role", { count: "exact", head: true }),
  ]);

  const bookings = bookingsRes.data || [];
  const leads = leadsRes.data || [];

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = bookings.filter((b) => ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(b.status)).length;
  const totalRevenueGs = bookings
    .filter((b) => ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(b.status))
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const totalUsers = usersRes.count || 0;

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

// ==========================================
// 7. CONFIGURACIÓN DE DISPONIBILIDAD Y BLOQUEOS (SUPABASE PERSISTENTE)
// ==========================================

export async function supabaseGetAvailabilitySettings(): Promise<any | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("corporate_leads")
      .select("requirements")
      .eq("id", "sys_availability_settings")
      .maybeSingle();

    if (error || !data || !data.requirements) {
      return null;
    }

    const parsed = JSON.parse(data.requirements);
    return parsed;
  } catch (err) {
    console.error("Error reading availability settings from Supabase:", err);
    return null;
  }
}

export async function supabaseSaveAvailabilitySettings(settings: any): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const jsonStr = JSON.stringify(settings);

    const { data: existing } = await supabase
      .from("corporate_leads")
      .select("id")
      .eq("id", "sys_availability_settings")
      .maybeSingle();

    if (!existing) {
      const { error: insErr } = await supabase
        .from("corporate_leads")
        .insert({
          id: "sys_availability_settings",
          company_name: "SYSTEM_CONFIG",
          facility_type: "SYSTEM_SETTINGS",
          contact_name: "Admin System",
          phone: "0000000000",
          requirements: jsonStr,
          status: "NEW",
        });
      return !insErr;
    } else {
      const { error: updErr } = await supabase
        .from("corporate_leads")
        .update({
          requirements: jsonStr,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "sys_availability_settings");
      return !updErr;
    }
  } catch (err) {
    console.error("Error saving availability settings to Supabase:", err);
    return false;
  }
}
