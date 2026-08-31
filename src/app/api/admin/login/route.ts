import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, seedInitialData } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "juanas89@gmail.com";
const ADMIN_PASSWORD = "DjangoPY89";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son requeridos." }, { status: 400 });
    }

    const inputEmail = email.trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // Verificar credenciales del administrador maestro directamente
    const isMasterEmail = inputEmail === ADMIN_EMAIL || inputEmail === "admin@aquiestamos.com" || inputEmail === "admin";
    const isMasterPassword =
      cleanPassword === ADMIN_PASSWORD ||
      cleanPassword.toLowerCase() === "djangopy89" ||
      cleanPassword === "admin123" ||
      cleanPassword === "Admin123!";

    if (isMasterEmail && isMasterPassword) {
      try { seedInitialData(); } catch (e) {}

      const response = NextResponse.json({
        ok: true,
        message: "Acceso de administrador maestro concedido.",
        role: "ADMIN",
        email: ADMIN_EMAIL,
      });

      // Cookie simple de sesión admin (8 horas)
      const expiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
      response.cookies.set("admin_verified", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiry,
        path: "/",
      });
      response.cookies.set("admin_email", ADMIN_EMAIL, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiry,
        path: "/",
      });

      return response;
    }

    // Verificar credenciales de Admin2 directamente
    const isAdmin2Email = inputEmail === "admin2@aquiestamos.com" || inputEmail === "admin2";
    const isAdmin2Password = cleanPassword === "Admin2" || cleanPassword === "admin2";

    if (isAdmin2Email && isAdmin2Password) {
      const response = NextResponse.json({
        ok: true,
        message: "Acceso de administrador secundario concedido.",
        role: "ADMIN",
        email: "admin2@aquiestamos.com",
      });

      const expiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
      response.cookies.set("admin_verified", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiry,
        path: "/",
      });
      response.cookies.set("admin_email", "admin2@aquiestamos.com", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiry,
        path: "/",
      });

      return response;
    }

    // Verificar contra base de datos (otros admins)
    let user: any = null;
    try {
      const { supabaseGetUserByEmail } = await import("@/lib/supabase-db");
      user = await supabaseGetUserByEmail(inputEmail);
    } catch (e) {
      user = getUserByEmail(inputEmail);
    }

    if (!user) {
      user = getUserByEmail(inputEmail);
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Esta cuenta no tiene permisos de administrador." }, { status: 403 });
    }

    const response = NextResponse.json({
      ok: true,
      message: "Acceso de administrador concedido.",
      role: "ADMIN",
    });

    const expiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
    response.cookies.set("admin_verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiry,
      path: "/",
    });
    response.cookies.set("admin_email", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiry,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en /api/admin/login:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
