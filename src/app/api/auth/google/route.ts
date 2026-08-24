import { NextResponse } from "next/server";
import { createOrUpdateOAuthUser } from "@/lib/db";
import { verifyGoogleIdToken } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token de Google es requerido." }, { status: 400 });
    }

    const verifiedUser = verifyGoogleIdToken(token);
    if (!verifiedUser || !verifiedUser.email) {
      return NextResponse.json({ error: "Token de Google inválido o no verificado." }, { status: 401 });
    }

    // Crear o actualizar usuario en la base de datos SQLite
    const user = createOrUpdateOAuthUser({
      email: verifiedUser.email.toLowerCase(),
      name: verifiedUser.name,
      image: verifiedUser.picture,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Error en endpoint /api/auth/google:", error);
    return NextResponse.json({ error: error.message || "Error al procesar autenticación de Google." }, { status: 500 });
  }
}
