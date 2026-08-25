import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";
import { supabaseCreateUser, supabaseGetUserByEmail } from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, address, latitude, longitude } = body;

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

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verificar si existe en Supabase o local
    let existingUser = null;
    try {
      existingUser = await supabaseGetUserByEmail(cleanEmail);
    } catch (e) {
      existingUser = getUserByEmail(cleanEmail);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con este correo electrónico." },
        { status: 409 }
      );
    }

    // 2. Guardar en Supabase y localmente
    let newUser: any = null;
    try {
      newUser = await supabaseCreateUser({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone ? phone.trim() : undefined,
        address: address ? address.trim() : undefined,
        role: "CUSTOMER",
      });
      // Sincronizar en local por respaldo
      try {
        createUser({
          name: name.trim(),
          email: cleanEmail,
          password,
          phone: phone ? phone.trim() : undefined,
          address: address ? address.trim() : undefined,
          role: "CUSTOMER",
        });
      } catch (e) {}
    } catch (e) {
      newUser = createUser({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone ? phone.trim() : undefined,
        address: address ? address.trim() : undefined,
        role: "CUSTOMER",
      });
    }

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
    console.error("Error en registro de cliente:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el registro." },
      { status: 500 }
    );
  }
}
