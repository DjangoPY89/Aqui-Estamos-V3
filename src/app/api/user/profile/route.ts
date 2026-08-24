import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, getUserByEmail, updateUserProfile } from "@/lib/db";
import { supabaseGetUserByEmail, supabaseUpdateUser } from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    let user: any = null;
    try {
      user = await supabaseGetUserByEmail(session.user.email);
    } catch (e) {
      user = getUserByEmail(session.user.email);
    }

    if (!user) {
      user = getUserByEmail(session.user.email);
    }

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json({ error: "Error al obtener perfil." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    let currentUser: any = null;
    try {
      currentUser = await supabaseGetUserByEmail(session.user.email);
    } catch (e) {
      currentUser = getUserByEmail(session.user.email);
    }

    if (!currentUser) {
      currentUser = getUserByEmail(session.user.email);
    }

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, address, ruc, taxName } = body;

    let updated: any = null;
    try {
      updated = await supabaseUpdateUser(currentUser.id, {
        name,
        phone,
        address,
        ruc,
        taxName,
      });
      try {
        updateUserProfile(currentUser.id, { name, phone, address, ruc, taxName });
      } catch (e) {}
    } catch (e) {
      updated = updateUserProfile(currentUser.id, {
        name,
        phone,
        address,
        ruc,
        taxName,
      });
    }

    return NextResponse.json({ ok: true, user: updated });
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ error: "Error al actualizar perfil." }, { status: 500 });
  }
}
