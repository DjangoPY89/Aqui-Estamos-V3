import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers, updateUserProfile } from "@/lib/db";
import { supabaseGetAllUsers, supabaseUpdateUser } from "@/lib/supabase-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    let users: any[] = [];
    try {
      users = await supabaseGetAllUsers();
    } catch (e) {
      users = getAllUsers();
    }

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
    const { userId, address, phone, name, ruc, taxName, latitude, longitude } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario es obligatorio." }, { status: 400 });
    }

    const latNum = latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) ? Number(latitude) : (latitude === null ? null : undefined);
    const lngNum = longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : (longitude === null ? null : undefined);

    let updatedUser: any = null;
    try {
      updatedUser = await supabaseUpdateUser(userId, {
        address,
        phone,
        name,
        ruc,
        taxName,
        latitude: latNum,
        longitude: lngNum,
      });
      // Sincronizar en local
      try {
        updateUserProfile(userId, { address, phone, name, ruc, taxName });
      } catch (e) {}
    } catch (e) {
      updatedUser = updateUserProfile(userId, {
        address,
        phone,
        name,
        ruc,
        taxName,
      });
    }

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

