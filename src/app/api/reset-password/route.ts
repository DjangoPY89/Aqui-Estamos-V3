import { NextResponse } from "next/server";
import { verifyAndResetPassword } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tokenOrCode, newPassword } = body;

    if (!tokenOrCode || !newPassword) {
      return NextResponse.json(
        { error: "Código/Token y nueva contraseña son requeridos." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const success = verifyAndResetPassword(tokenOrCode.trim(), newPassword);

    if (!success) {
      return NextResponse.json(
        { error: "El código o enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión.",
    });
  } catch (error: any) {
    console.error("Error en /api/reset-password:", error);
    return NextResponse.json(
      { error: error.message || "Error al restablecer contraseña." },
      { status: 500 }
    );
  }
}
