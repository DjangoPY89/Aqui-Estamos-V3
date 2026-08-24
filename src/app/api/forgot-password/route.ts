import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Por favor ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    const resetData = createPasswordResetToken(email.trim().toLowerCase());

    if (resetData) {
      const baseUrl = process.env.NEXTAUTH_URL || "https://aqui-estamos-v3.vercel.app";
      const resetUrl = `${baseUrl}/recuperar-password?token=${encodeURIComponent(resetData.token)}&email=${encodeURIComponent(resetData.email)}`;

      // Enviar correo con enlace y código de 6 dígitos
      await sendPasswordResetEmail({
        email: resetData.email,
        name: resetData.name,
        code: resetData.code,
        resetUrl,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Si el correo está registrado, recibirás un enlace y código de recuperación en tu bandeja de entrada.",
    });
  } catch (error: any) {
    console.error("Error en /api/forgot-password:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
