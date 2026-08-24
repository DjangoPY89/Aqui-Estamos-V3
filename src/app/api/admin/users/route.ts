import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const users = getAllUsers();
    return NextResponse.json(
      { users },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error al obtener usuarios para admin:", error);
    return NextResponse.json({ error: "Error al obtener usuarios." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, address, phone, name, ruc, taxName } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario es obligatorio." }, { status: 400 });
    }

    const { updateUserProfile } = await import("@/lib/db");
    const updatedUser = updateUserProfile(userId, {
      address,
      phone,
      name,
      ruc,
      taxName,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Dirección y datos del cliente actualizados exitosamente.",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json({ error: "Error al actualizar cliente." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, address, password, ruc, taxName } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "El nombre y correo electrónico son obligatorios." }, { status: 400 });
    }

    const { getUserByEmail, createUser, updateUserProfile } = await import("@/lib/db");
    const existing = getUserByEmail(email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Ya existe un cliente registrado con este correo electrónico." }, { status: 409 });
    }

    const newUser = createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      address: address ? address.trim() : undefined,
      password: password && password.length >= 6 ? password : "cliente" + Math.random().toString(36).substring(2, 8),
      role: "CUSTOMER",
    });

    if (ruc || taxName) {
      updateUserProfile(newUser.id, { ruc, taxName });
    }

    return NextResponse.json({
      success: true,
      message: "Cliente creado exitosamente.",
      user: newUser,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear cliente desde admin:", error);
    return NextResponse.json({ error: error.message || "Error al crear cliente." }, { status: 500 });
  }
}

