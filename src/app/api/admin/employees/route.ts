import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createEmployee, deleteEmployee, getAllEmployees, updateEmployee } from "@/lib/db";
import {
  supabaseCreateEmployee,
  supabaseDeleteEmployee,
  supabaseGetAllEmployees,
  supabaseUpdateEmployee,
} from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    let employees: any[] = [];
    try {
      employees = await supabaseGetAllEmployees();
    } catch (e) {
      employees = getAllEmployees();
    }

    return NextResponse.json({ employees });
  } catch (error: any) {
    console.error("Error al obtener empleados:", error);
    return NextResponse.json({ error: "Error al obtener lista de empleados." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const body = await req.json();
    const { name, ci, phone, email, zone, ipsVerified, image, rating } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nombre y teléfono son campos obligatorios." }, { status: 400 });
    }

    let employee: any = null;
    try {
      employee = await supabaseCreateEmployee({
        name,
        ci,
        phone,
        email,
        image: image || undefined,
        zone,
        ipsVerified: ipsVerified !== false,
      });
      // Sincronizar local
      try {
        createEmployee({ name, ci, phone, email, image, zone, ipsVerified: ipsVerified !== false });
      } catch (e) {}
    } catch (e) {
      employee = createEmployee({
        name,
        ci,
        phone,
        email,
        image,
        zone,
        ipsVerified: ipsVerified !== false,
      });
    }

    return NextResponse.json({ ok: true, employee });
  } catch (error: any) {
    console.error("Error al crear empleado:", error);
    return NextResponse.json({ error: "Error al registrar empleado." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de empleado requerido." }, { status: 400 });
    }

    let updated: any = null;
    try {
      updated = await supabaseUpdateEmployee(id, data);
      try {
        updateEmployee(id, data);
      } catch (e) {}
    } catch (e) {
      updated = updateEmployee(id, data);
    }

    return NextResponse.json({ ok: true, employee: updated });
  } catch (error: any) {
    console.error("Error al actualizar empleado:", error);
    return NextResponse.json({ error: "Error al actualizar empleado." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de empleado requerido." }, { status: 400 });
    }

    let success = false;
    try {
      success = await supabaseDeleteEmployee(id);
      try {
        deleteEmployee(id);
      } catch (e) {}
    } catch (e) {
      success = deleteEmployee(id);
    }

    if (!success) {
      return NextResponse.json({ error: "Empleado no encontrado o no se pudo eliminar." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Empleado eliminado con éxito." });
  } catch (error: any) {
    console.error("Error al eliminar empleado:", error);
    return NextResponse.json({ error: "Error al eliminar empleado." }, { status: 500 });
  }
}
