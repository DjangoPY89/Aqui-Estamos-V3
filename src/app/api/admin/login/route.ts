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

    // Verificar credenciales del administrador maestro directamente
    if (inputEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try { seedInitialData(); } catch (e) {}

      const response = NextResponse.json({
        ok: true,
        message: "Acceso de administrador concedido.",
        role: "ADMIN",
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
