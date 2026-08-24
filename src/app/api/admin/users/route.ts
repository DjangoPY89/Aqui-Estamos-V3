import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const users = getAllUsers();
    return NextResponse.json({ users });
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

