import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, getUserByEmail, updateUserProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const user = getUserByEmail(session.user.email);
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

    const currentUser = getUserByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, address, ruc, taxName } = body;

    const updated = updateUserProfile(currentUser.id, {
      name,
      phone,
      address,
      ruc,
      taxName,
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ error: "Error al actualizar perfil." }, { status: 500 });
  }
}
