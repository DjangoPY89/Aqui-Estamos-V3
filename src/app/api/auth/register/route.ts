import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, address } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con este correo electrónico." },
        { status: 409 }
      );
    }

    const newUser = createUser({
      name,
      email,
      password,
      phone,
      address,
      role: "CUSTOMER",
    });

    return NextResponse.json(
      {
        message: "Usuario registrado con éxito.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el registro." },
      { status: 500 }
    );
  }
}
