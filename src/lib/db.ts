import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { Booking, CorporateLead, Employee, Review, User } from "@/types";

let dbInstance: Database.Database | null = null;
let isInitialized = false;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const isVercel = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
  let dbPath: string;

  if (isVercel) {
    const tmpDir = "/tmp";
    dbPath = path.join(tmpDir, "aquiestamos.db");

    // En Vercel Serverless, copiar base de datos inicial si existe empaquetada
    const bundledDbPath = path.join(process.cwd(), "data", "aquiestamos.db");
    if (!fs.existsSync(dbPath) && fs.existsSync(bundledDbPath)) {
      try {
        fs.copyFileSync(bundledDbPath, dbPath);
      } catch (e) {}
    }
  } else {
    const dbDirectory = path.join(process.cwd(), "data");
    if (!fs.existsSync(dbDirectory)) {
      try {
        fs.mkdirSync(dbDirectory, { recursive: true });
      } catch (e) {}
    }
    dbPath = path.join(dbDirectory, "aquiestamos.db");
  }

  dbInstance = new Database(dbPath, { timeout: 10000 });
  try {
    dbInstance.pragma("journal_mode = WAL");
  } catch (e) {
    try {
      dbInstance.pragma("journal_mode = DELETE");
    } catch (e2) {}
  }
  dbInstance.pragma("busy_timeout = 10000");

  initSchema(dbInstance);

  return dbInstance;
}

function initSchema(db: Database.Database) {
  if (isInitialized) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      image TEXT,
      role TEXT DEFAULT 'CUSTOMER',
      phone TEXT,
      address TEXT,
      ruc TEXT,
      tax_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ci TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      image TEXT,
      zone TEXT DEFAULT 'Asunción y Gran Asunción',
      ips_verified INTEGER DEFAULT 1,
      rating REAL DEFAULT 5.0,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_number TEXT UNIQUE,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      service_hours INTEGER NOT NULL,
      frequency TEXT NOT NULL,
      extras TEXT NOT NULL,
      service_date TEXT NOT NULL,
      service_time TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      discount INTEGER DEFAULT 0,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'PENDING',
      status TEXT DEFAULT 'PENDING',
      assigned_cleaner TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS corporate_leads (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      ruc TEXT,
      facility_type TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      requirements TEXT,
      status TEXT DEFAULT 'NEW',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_image TEXT,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      service_type TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    db.exec("ALTER TABLE users ADD COLUMN ruc TEXT");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN tax_name TEXT");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME");
  } catch (e) {}

  isInitialized = true;
  seedInitialData(db);
}

// Repositorio de Usuarios
export function getUserByEmail(email: string): (User & { passwordHash?: string }) | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    image: row.image,
    role: row.role,
    phone: row.phone,
    address: row.address,
    ruc: row.ruc,
    taxName: row.tax_name,
    createdAt: row.created_at,
  };
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    role: row.role,
    phone: row.phone,
    address: row.address,
    ruc: row.ruc,
    taxName: row.tax_name,
    createdAt: row.created_at,
  };
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
  const db = getDb();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = data.password ? bcrypt.hashSync(data.password, 10) : null;
  const role = data.role || "CUSTOMER";

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, image, role, phone, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.email.toLowerCase(),
    passwordHash,
    data.image || null,
    role,
    data.phone || null,
    data.address || null
  );

  return getUserById(id)!;
}

export function createOrUpdateOAuthUser(data: {
  email: string;
  name: string;
  image?: string;
}): User {
  const existing = getUserByEmail(data.email);
  if (existing) {
    if (data.image && !existing.image) {
      const db = getDb();
      db.prepare("UPDATE users SET image = ?, name = COALESCE(?, name) WHERE id = ?").run(
        data.image,
        data.name,
        existing.id
      );
    }
    return getUserById(existing.id)!;
  }

  return createUser({
    name: data.name,
    email: data.email,
    image: data.image,
    role: "CUSTOMER",
  });
}

export function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; address?: string; ruc?: string; taxName?: string }
): User | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name.trim());
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?");
    values.push(data.phone.trim());
  }
  if (data.address !== undefined) {
    fields.push("address = ?");
    values.push(data.address.trim());
  }
  if (data.ruc !== undefined) {
    fields.push("ruc = ?");
    values.push(data.ruc.trim());
  }
  if (data.taxName !== undefined) {
    fields.push("tax_name = ?");
    values.push(data.taxName.trim());
  }

  if (fields.length === 0) return getUserById(userId);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(userId);

  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getUserById(userId);
}

// Genera un token y código numérico de 6 dígitos para recuperación de contraseña
export function createPasswordResetToken(email: string): {
  token: string;
  code: string;
  email: string;
  name: string;
} | null {
  const db = getDb();
  const user = getUserByEmail(email);
  if (!user) return null;

  // Código de 6 dígitos para fácil tipeo en móviles
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Token criptográfico para URL
  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;

  db.prepare(`
    UPDATE users 
    SET reset_token = ?, reset_token_expires = DATETIME('now', '+1 hour'), updated_at = CURRENT_TIMESTAMP
    WHERE email = ?
  `).run(`${token}:${code}`, user.email.toLowerCase());

  return {
    token,
    code,
    email: user.email,
    name: user.name,
  };
}

// Valida token o código de 6 dígitos y actualiza la contraseña con hash bcrypt
export function verifyAndResetPassword(tokenOrCode: string, newPassword: string): boolean {
  const db = getDb();
  if (!tokenOrCode || !newPassword || newPassword.length < 6) return false;

  const cleanInput = tokenOrCode.trim();

  // Buscar usuario cuyo token contenga el string o código y no haya expirado
  const row = db.prepare(`
    SELECT * FROM users 
    WHERE (reset_token = ? OR reset_token LIKE '%' || ? || '%' OR reset_token LIKE '%:' || ? OR reset_token = ?)
      AND (reset_token_expires > CURRENT_TIMESTAMP OR reset_token_expires IS NULL)
  `).get(cleanInput, cleanInput, cleanInput, cleanInput) as any;

  if (!row) return false;

  const passwordHash = bcrypt.hashSync(newPassword, 10);

  const res = db.prepare(`
    UPDATE users 
    SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(passwordHash, row.id);

  return res.changes > 0;
}

export function getAllUsers(): (User & { totalBookings: number; totalSpentGs: number })[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      u.id, u.name, u.email, u.image, u.role, u.phone, u.address, u.ruc, u.tax_name, u.created_at,
      COUNT(b.id) as total_bookings,
      COALESCE(SUM(CASE WHEN b.status != 'CANCELLED' THEN b.total_price ELSE 0 END), 0) as total_spent
    FROM users u
    LEFT JOIN bookings b ON (b.user_id = u.id OR lower(b.customer_email) = lower(u.email))
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all() as any[];

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    image: r.image,
    role: r.role,
    phone: r.phone,
    address: r.address,
    ruc: r.ruc,
    taxName: r.tax_name,
    createdAt: r.created_at,
    totalBookings: r.total_bookings || 0,
    totalSpentGs: r.total_spent || 0,
  }));
}

// Repositorio de Reservas
export function createBooking(data: Omit<Booking, "id" | "createdAt" | "updatedAt">): Booking {
  const db = getDb();
  const id = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  db.prepare(`
    INSERT INTO bookings (
      id, booking_number, user_id, customer_name, customer_phone, customer_email,
      address, latitude, longitude, service_hours, frequency, extras,
      service_date, service_time, total_price, discount, payment_method,
      payment_status, status, assigned_cleaner, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.bookingNumber,
    data.userId || null,
    data.customerName,
    data.customerPhone,
    data.customerEmail,
    data.address,
    data.latitude || null,
    data.longitude || null,
    data.serviceHours,
    data.frequency,
    JSON.stringify(data.extras || []),
    data.serviceDate,
    data.serviceTime,
    data.totalPrice,
    data.discount || 0,
    data.paymentMethod,
    data.paymentStatus || "PENDING",
    data.status || "PENDING",
    data.assignedCleaner || null,
    data.notes || null
  );

  return getBookingById(id)!;
}

export function getBookingById(id: string): Booking | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
  if (!row) return null;
  return mapBookingRow(row);
}

export function getBookingByNumber(bookingNumber: string): Booking | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM bookings WHERE booking_number = ?").get(bookingNumber) as any;
  if (!row) return null;
  return mapBookingRow(row);
}

export function getBookings(filter?: {
  userId?: string;
  status?: string;
  email?: string;
}): Booking[] {
  const db = getDb();
  let query = "SELECT * FROM bookings WHERE 1=1";
  const params: any[] = [];

  if (filter?.userId) {
    query += " AND user_id = ?";
    params.push(filter.userId);
  }
  if (filter?.email) {
    query += " AND customer_email = ?";
    params.push(filter.email.toLowerCase());
  }
  if (filter?.status && filter.status !== "ALL") {
    query += " AND status = ?";
    params.push(filter.status);
  }

  query += " ORDER BY created_at DESC";
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(mapBookingRow);
}

export function updateBooking(
  id: string,
  updates: Partial<Booking>
): Booking | null {
  const db = getDb();
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.status !== undefined) {
    fields.push("status = ?");
    params.push(updates.status);
  }
  if (updates.assignedCleaner !== undefined) {
    fields.push("assigned_cleaner = ?");
    params.push(updates.assignedCleaner);
  }
  if (updates.customerName !== undefined) {
    fields.push("customer_name = ?");
    params.push(updates.customerName);
  }
  if (updates.customerPhone !== undefined) {
    fields.push("customer_phone = ?");
    params.push(updates.customerPhone);
  }
  if (updates.customerEmail !== undefined) {
    fields.push("customer_email = ?");
    params.push(updates.customerEmail);
  }
  if (updates.address !== undefined) {
    fields.push("address = ?");
    params.push(updates.address);
  }
  if (updates.latitude !== undefined) {
    fields.push("latitude = ?");
    params.push(updates.latitude);
  }
  if (updates.longitude !== undefined) {
    fields.push("longitude = ?");
    params.push(updates.longitude);
  }
  if (updates.serviceHours !== undefined) {
    fields.push("service_hours = ?");
    params.push(updates.serviceHours);
  }
  if (updates.frequency !== undefined) {
    fields.push("frequency = ?");
    params.push(updates.frequency);
  }
  if (updates.totalPrice !== undefined) {
    fields.push("total_price = ?");
    params.push(updates.totalPrice);
  }
  if (updates.paymentMethod !== undefined) {
    fields.push("payment_method = ?");
    params.push(updates.paymentMethod);
  }
  if (updates.paymentStatus !== undefined) {
    fields.push("payment_status = ?");
    params.push(updates.paymentStatus);
  }
  if (updates.notes !== undefined) {
    fields.push("notes = ?");
    params.push(updates.notes);
  }
  if (updates.serviceDate !== undefined) {
    fields.push("service_date = ?");
    params.push(updates.serviceDate);
  }
  if (updates.serviceTime !== undefined) {
    fields.push("service_time = ?");
    params.push(updates.serviceTime);
  }

  if (fields.length === 0) return getBookingById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  db.prepare(`UPDATE bookings SET ${fields.join(", ")} WHERE id = ?`).run(...params);
  return getBookingById(id);
}

export function deleteBooking(id: string): boolean {
  const db = getDb();
  const info = db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
  return info.changes > 0;
}

function mapBookingRow(row: any): Booking {
  let extras: string[] = [];
  try {
    extras = JSON.parse(row.extras || "[]");
  } catch {
    extras = [];
  }

  return {
    id: row.id,
    bookingNumber: row.booking_number,
    userId: row.user_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    serviceHours: row.service_hours,
    frequency: row.frequency,
    extras,
    serviceDate: row.service_date,
    serviceTime: row.service_time,
    totalPrice: row.total_price,
    discount: row.discount,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    assignedCleaner: row.assigned_cleaner,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Repositorio de Leads Corporativos
export function createCorporateLead(data: Omit<CorporateLead, "id" | "status" | "createdAt" | "updatedAt">): CorporateLead {
  const db = getDb();
  const id = `corp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  db.prepare(`
    INSERT INTO corporate_leads (id, company_name, ruc, facility_type, contact_name, phone, email, requirements, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
  `).run(
    id,
    data.companyName,
    data.ruc || null,
    data.facilityType,
    data.contactName,
    data.phone,
    data.email || null,
    data.requirements || null
  );

  return getCorporateLeadById(id)!;
}

export function getCorporateLeadById(id: string): CorporateLead | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM corporate_leads WHERE id = ?").get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    companyName: row.company_name,
    ruc: row.ruc,
    facilityType: row.facility_type,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    requirements: row.requirements,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getCorporateLeads(): CorporateLead[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM corporate_leads ORDER BY created_at DESC").all() as any[];
  return rows.map((row) => ({
    id: row.id,
    companyName: row.company_name,
    ruc: row.ruc,
    facilityType: row.facility_type,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    requirements: row.requirements,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function updateCorporateLeadStatus(id: string, status: CorporateLead["status"]): CorporateLead | null {
  const db = getDb();
  db.prepare("UPDATE corporate_leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
  return getCorporateLeadById(id);
}

// Repositorio de Reseñas
export function getReviews(): Review[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM reviews WHERE is_published = 1 ORDER BY created_at DESC").all() as any[];
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userImage: row.user_image,
    rating: row.rating,
    comment: row.comment,
    serviceType: row.service_type,
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at,
  }));
}

export function createReview(data: Omit<Review, "id" | "isPublished" | "createdAt">): Review {
  const db = getDb();
  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  db.prepare(`
    INSERT INTO reviews (id, user_id, user_name, user_image, rating, comment, service_type, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    id,
    data.userId || "anon",
    data.userName,
    data.userImage || null,
    data.rating,
    data.comment,
    data.serviceType
  );
  return {
    id,
    userId: data.userId || "anon",
    userName: data.userName,
    userImage: data.userImage || null,
    rating: data.rating,
    comment: data.comment,
    serviceType: data.serviceType,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };
}

// Estadísticas de Administrador
export function getAdminStats() {
  const db = getDb();
  const totalBookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get() as any;
  const pendingBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'PENDING'").get() as any;
  const confirmedBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'CONFIRMED'").get() as any;
  const totalRevenue = db.prepare("SELECT SUM(total_price) as sum FROM bookings WHERE status != 'CANCELLED'").get() as any;
  const totalLeads = db.prepare("SELECT COUNT(*) as count FROM corporate_leads").get() as any;
  const newLeads = db.prepare("SELECT COUNT(*) as count FROM corporate_leads WHERE status = 'NEW'").get() as any;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'").get() as any;

  return {
    totalBookings: totalBookings.count || 0,
    pendingBookings: pendingBookings.count || 0,
    confirmedBookings: confirmedBookings.count || 0,
    totalRevenueGs: totalRevenue.sum || 0,
    totalLeads: totalLeads.count || 0,
    newLeads: newLeads.count || 0,
    totalUsers: totalUsers.count || 0,
  };
}

// Semillero de datos iniciales
export function seedInitialData(database?: Database.Database) {
  const db = database || getDb();
  try {
    const adminEmail = "juanas89@gmail.com";
    const adminPassHash = bcrypt.hashSync("DjangoPY89", 10);
    
    const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail) as any;
    if (!adminExists) {
      const id = `usr_${Date.now()}_admin`;
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, "Administrador Juan", adminEmail, adminPassHash, "ADMIN", "0984320528");
    } else {
      db.prepare(`
        UPDATE users SET password_hash = ?, role = 'ADMIN' WHERE email = ?
      `).run(adminPassHash, adminEmail);
    }

    // Actualizar también si existía el usuario previo
    try {
      db.prepare("UPDATE users SET password_hash = ?, role = 'ADMIN' WHERE email = 'admin@aquiestamos.com'").run(adminPassHash);
    } catch (e) {}

    const demoCustomer = db.prepare("SELECT * FROM users WHERE email = ?").get("cliente@ejemplo.com") as any;
    if (!demoCustomer) {
      const custId = `usr_${Date.now()}_cust`;
      const passHash = bcrypt.hashSync("clientepassword", 10);
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        custId,
        "Juan Pérez",
        "cliente@ejemplo.com",
        passHash,
        "CUSTOMER",
        "0981123456",
        "Avda. Santa Teresa 2250, Edificio Trinity Towers, Depto 802, Asunción"
      );
    }

    // Sembrar usuario Carlos Cantero
    const carlosCustomer = db.prepare("SELECT * FROM users WHERE email = ?").get("canterodontown@gmail.com") as any;
    const carlosHash = bcrypt.hashSync("Cantero1234", 10);
    if (!carlosCustomer) {
      const custId2 = `usr_${Date.now()}_carlos`;
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        custId2,
        "Carlos Cantero",
        "canterodontown@gmail.com",
        carlosHash,
        "CUSTOMER",
        "0981777222",
        "Barrio Recoleta, Asunción"
      );
    } else {
      db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(carlosHash, "canterodontown@gmail.com");
    }

    // Sembrar usuario Sofia Villalba
    const sofiaCustomer = db.prepare("SELECT * FROM users WHERE email = ?").get("sofia.villalba@gmail.com") as any;
    const sofiaHash = bcrypt.hashSync("SofiaPassword123", 10);
    if (!sofiaCustomer) {
      const custId3 = `usr_${Date.now()}_sofia`;
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        custId3,
        "Sofia Villalba",
        "sofia.villalba@gmail.com",
        sofiaHash,
        "CUSTOMER",
        "0982345678",
        "Barrio Villa Morra, Asunción"
      );
    } else {
      db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(sofiaHash, "sofia.villalba@gmail.com");
    }

    // Sembrar usuario Rodrigo Martinez
    const rodrigoCustomer = db.prepare("SELECT * FROM users WHERE email = ?").get("rodrigo.martinez@gmail.com") as any;
    const rodrigoHash = bcrypt.hashSync("RodrigoPass2026", 10);
    if (!rodrigoCustomer) {
      const custId4 = `usr_${Date.now()}_rodrigo`;
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        custId4,
        "Rodrigo Martinez",
        "rodrigo.martinez@gmail.com",
        rodrigoHash,
        "CUSTOMER",
        "0971987654",
        "Barrio Ykua Satî, Asunción"
      );
    } else {
      db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(rodrigoHash, "rodrigo.martinez@gmail.com");
    }

    // Reservas de muestra
    const sampleBooking = db.prepare("SELECT * FROM bookings WHERE booking_number = 'AE-2026-0812'").get() as any;
    if (!sampleBooking) {
      db.prepare(`
        INSERT INTO bookings (
          id, booking_number, user_id, customer_name, customer_phone, customer_email,
          address, latitude, longitude, service_hours, frequency, extras,
          service_date, service_time, total_price, discount, payment_method,
          payment_status, status, assigned_cleaner, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `bk_sample_1`,
        "AE-2026-0812",
        "usr_sample_cust",
        "Juan Pérez",
        "0981123456",
        "cliente@ejemplo.com",
        "Avda. Santa Teresa 2250, Edificio Trinity Towers, Asunción",
        -25.2831,
        -57.5612,
        6,
        "weekly_2_4",
        JSON.stringify(["nevera", "horno"]),
        "2026-08-25",
        "08:00",
        153000,
        27000,
        "sipap",
        "PENDING",
        "CONFIRMED",
        "Carmen Benítez (Uniforme & ID Verificado)",
        "Por favor avisar en portería antes de subir."
      );
    }

    // Sembrar reseñas si no existen
    const reviewCount = db.prepare("SELECT COUNT(*) as count FROM reviews").get() as any;
    if (reviewCount.count === 0) {
      const defaultReviews = [
        {
          userName: "Carolina M. (Villa Morra)",
          rating: 5,
          comment: "Excelente servicio. La puntualidad y la atención al detalle de Carmen superaron mis expectativas. El piso y la cocina quedaron relucientes.",
          serviceType: "Integral (6 Horas)",
        },
        {
          userName: "Esteban R. (Ykua Satî)",
          rating: 5,
          comment: "Increíble cómo cambió la casa después de 8 horas de limpieza profunda. Muy confiable el personal y 100% profesionales.",
          serviceType: "Full Day (8 Horas)",
        },
        {
          userName: "Valeria D. (Mcal. López)",
          rating: 5,
          comment: "Tengo contratado el plan recurrente 3 veces por semana y no lo cambio por nada. Me ahorra horas de vida y la facturación es impecable.",
          serviceType: "Plan Recurrente (15% OFF)",
        },
      ];

        for (const r of defaultReviews) {
        db.prepare(`
          INSERT INTO reviews (id, user_id, user_name, rating, comment, service_type, is_published)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(`rev_${Math.random()}`, "seed", r.userName, r.rating, r.comment, r.serviceType);
      }
    }

    // Sembrar empleados iniciales si la tabla está vacía
    const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employees").get() as any;
    if (employeeCount.count === 0) {
      const defaultEmployees = [
        {
          name: "Carmen Benítez",
          ci: "3.456.789",
          phone: "0984 123 456",
          email: "carmen.benitez@aquiestamos.com",
          zone: "Asunción (Villa Morra / Ykua Satî)",
          rating: 4.95,
        },
        {
          name: "Gladys Romero",
          ci: "4.120.982",
          phone: "0981 654 321",
          email: "gladys.romero@aquiestamos.com",
          zone: "Asunción (Centro / Carmelitas)",
          rating: 4.90,
        },
        {
          name: "Mariza González",
          ci: "3.890.112",
          phone: "0982 789 012",
          email: "mariza.gonzalez@aquiestamos.com",
          zone: "Gran Asunción (Luque / San Lorenzo)",
          rating: 4.88,
        },
        {
          name: "Mirna Rolón",
          ci: "4.567.890",
          phone: "0985 345 678",
          email: "mirna.rolon@aquiestamos.com",
          zone: "Gran Asunción (Lambaré / Fdo. de la Mora)",
          rating: 4.92,
        },
      ];

      for (const emp of defaultEmployees) {
        const empId = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        db.prepare(`
          INSERT INTO employees (id, name, ci, phone, email, zone, ips_verified, rating, status)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'ACTIVE')
        `).run(empId, emp.name, emp.ci, emp.phone, emp.email, emp.zone, emp.rating);
      }
    }
  } catch (e) {
    console.error("Error al sembrar datos:", e);
  }
}

// Repositorio de Empleados / Personal de Limpieza
export function getAllEmployees(): Employee[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT e.*,
      (SELECT COUNT(*) FROM bookings b WHERE b.assigned_cleaner LIKE '%' || e.name || '%' AND b.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')) as active_bookings_count,
      (SELECT COUNT(*) FROM bookings b WHERE b.assigned_cleaner LIKE '%' || e.name || '%' AND b.status = 'COMPLETED') as completed_bookings_count
    FROM employees e
    ORDER BY e.status ASC, e.name ASC
  `).all() as any[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    ci: r.ci,
    phone: r.phone,
    email: r.email,
    image: r.image,
    zone: r.zone || "Asunción y Gran Asunción",
    ipsVerified: Boolean(r.ips_verified),
    rating: Number(r.rating || 5.0),
    status: r.status as Employee["status"],
    activeBookingsCount: Number(r.active_bookings_count || 0),
    completedBookingsCount: Number(r.completed_bookings_count || 0),
    createdAt: r.created_at,
  }));
}

export function getEmployeeById(id: string): Employee | null {
  const db = getDb();
  const r = db.prepare("SELECT * FROM employees WHERE id = ?").get(id) as any;
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    ci: r.ci,
    phone: r.phone,
    email: r.email,
    image: r.image,
    zone: r.zone || "Asunción y Gran Asunción",
    ipsVerified: Boolean(r.ips_verified),
    rating: Number(r.rating || 5.0),
    status: r.status as Employee["status"],
    createdAt: r.created_at,
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
  const db = getDb();
  const id = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO employees (id, name, ci, phone, email, image, zone, ips_verified, rating, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name.trim(),
    data.ci ? data.ci.trim() : null,
    data.phone.trim(),
    data.email ? data.email.trim().toLowerCase() : null,
    data.image || null,
    data.zone || "Asunción (General)",
    data.ipsVerified !== false ? 1 : 0,
    5.0,
    "ACTIVE"
  );
  return getEmployeeById(id)!;
}

export function updateEmployee(
  id: string,
  data: Partial<{
    name: string;
    ci: string;
    phone: string;
    email: string;
    zone: string;
    ipsVerified: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  }>
): Employee | null {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name.trim());
  }
  if (data.ci !== undefined) {
    fields.push("ci = ?");
    values.push(data.ci ? data.ci.trim() : null);
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?");
    values.push(data.phone.trim());
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email ? data.email.trim().toLowerCase() : null);
  }
  if (data.zone !== undefined) {
    fields.push("zone = ?");
    values.push(data.zone.trim());
  }
  if (data.ipsVerified !== undefined) {
    fields.push("ips_verified = ?");
    values.push(data.ipsVerified ? 1 : 0);
  }
  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (fields.length === 0) return getEmployeeById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  db.prepare(`UPDATE employees SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getEmployeeById(id);
}

export function deleteEmployee(id: string): boolean {
  const db = getDb();
  const emp = getEmployeeById(id);
  if (!emp) return false;

  // Si tiene reservas asignadas activas, quitamos la asignación para que no queden huérfanas
  db.prepare(`
    UPDATE bookings 
    SET assigned_cleaner = NULL 
    WHERE assigned_cleaner LIKE '%' || ? || '%' AND status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
  `).run(emp.name);

  const res = db.prepare("DELETE FROM employees WHERE id = ?").run(id);
  return res.changes > 0;
}

// Asignación aleatoria / automática de personal a reservas pendientes o sin asignar
export function autoAssignRandomEmployeesToPendingBookings(): {
  assignedCount: number;
  assignments: { bookingNumber: string; cleanerName: string }[];
} {
  const db = getDb();
  const activeEmployees = db.prepare("SELECT name FROM employees WHERE status = 'ACTIVE'").all() as any[];

  if (activeEmployees.length === 0) {
    return { assignedCount: 0, assignments: [] };
  }

  // Obtener reservas sin personal asignado
  const unassignedBookings = db.prepare(`
    SELECT id, booking_number FROM bookings 
    WHERE (assigned_cleaner IS NULL OR assigned_cleaner = '' OR assigned_cleaner = 'Sin Asignar' OR assigned_cleaner = 'Sin asignar')
      AND status != 'CANCELLED'
  `).all() as any[];

  const assignments: { bookingNumber: string; cleanerName: string }[] = [];

  for (const b of unassignedBookings) {
    // Selección aleatoria de empleado activo
    const randomEmp = activeEmployees[Math.floor(Math.random() * activeEmployees.length)];
    const cleanerLabel = `${randomEmp.name} (IPS Verificado)`;

    db.prepare(`
      UPDATE bookings 
      SET assigned_cleaner = ?, status = CASE WHEN status = 'PENDING' THEN 'CONFIRMED' ELSE status END, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cleanerLabel, b.id);

    assignments.push({
      bookingNumber: b.booking_number,
      cleanerName: cleanerLabel,
    });
  }

  return {
    assignedCount: assignments.length,
    assignments,
  };
}

export default getDb;

