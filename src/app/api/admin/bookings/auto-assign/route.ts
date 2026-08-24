import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { autoAssignRandomEmployeesToPendingBookings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
    }

    const result = autoAssignRandomEmployeesToPendingBookings();
    return NextResponse.json({
      ok: true,
      assignedCount: result.assignedCount,
      assignments: result.assignments,
    });
  } catch (error: any) {
    console.error("Error al auto-asignar personal aleatorio:", error);
    return NextResponse.json({ error: "Error al realizar asignación automática." }, { status: 500 });
  }
}
