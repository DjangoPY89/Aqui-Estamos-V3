import { NextResponse } from "next/server";
import { supabaseGetAllEmployees } from "@/lib/supabase-db";
import { getAllEmployees } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const time = searchParams.get("time"); // e.g. "08:00"
    const hoursStr = searchParams.get("hours"); // e.g. "4", "6", "8"
    const zoneQuery = searchParams.get("zone"); // e.g. "Asunción"

    let allEmployees = [];
    try {
      allEmployees = await supabaseGetAllEmployees();
    } catch (e) {
      allEmployees = getAllEmployees();
    }

    // Filtrar solo colaboradores con status "ACTIVE"
    const activeEmployees = allEmployees.filter(
      (e) => !e.status || e.status === "ACTIVE"
    );

    // Si se pasa fecha y hora, verificar disponibilidad real contra bookings existentes
    let busyEmployeeIds = new Set<string>();
    let busyEmployeeNames = new Set<string>();

    if (date) {
      try {
        const supabase = getSupabase();
        const { data: dateBookings } = await supabase
          .from("bookings")
          .select("assigned_cleaner, service_date, service_time, service_hours, status")
          .eq("service_date", date)
          .in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"]);

        if (dateBookings && dateBookings.length > 0) {
          const reqTime = time || "08:00";
          const reqHours = hoursStr ? parseInt(hoursStr, 10) : 4;
          const reqStartHour = parseInt(reqTime.split(":")[0], 10) || 8;
          const reqEndHour = reqStartHour + reqHours;

          dateBookings.forEach((b: any) => {
            if (!b.assigned_cleaner) return;

            const bTime = b.service_time || "08:00";
            const bHours = b.service_hours || 4;
            const bStartHour = parseInt(bTime.split(":")[0], 10) || 8;
            const bEndHour = bStartHour + bHours;

            // Verificar si hay solapamiento de horario
            const hasOverlap = Math.max(reqStartHour, bStartHour) < Math.min(reqEndHour, bEndHour);

            if (hasOverlap) {
              const cleanerStr = String(b.assigned_cleaner).trim().toLowerCase();
              busyEmployeeIds.add(cleanerStr);
              busyEmployeeNames.add(cleanerStr);
            }
          });
        }
      } catch (err) {
        console.error("Error al verificar reservas de empleados:", err);
      }
    }

    // Mapear colaboradores con su estado de disponibilidad
    const formatted = activeEmployees.map((emp) => {
      const empIdLower = emp.id.trim().toLowerCase();
      const empNameLower = emp.name.trim().toLowerCase();

      const isBusy = 
        busyEmployeeIds.has(empIdLower) ||
        busyEmployeeNames.has(empNameLower) ||
        Array.from(busyEmployeeNames).some((b) => b.includes(empNameLower) || empNameLower.includes(b));

      return {
        id: emp.id,
        name: emp.name,
        image: emp.image || null,
        rating: emp.rating !== undefined && emp.rating !== null ? emp.rating : 5.0,
        reviewCount: emp.reviewCount || 0,
        completedBookingsCount: emp.completedBookingsCount || 0,
        zone: emp.zone || "Asunción y Gran Asunción",
        ipsVerified: Boolean(emp.ipsVerified),
        isAvailable: !isBusy,
      };
    });

    // Criterio de ordenamiento:
    // 1. Mejor puntuados (Rating desc)
    // 2. Mayor número de servicios concluidos (desc)
    // 3. Si coincide con la zona buscada
    formatted.sort((a, b) => {
      // Primero disponibles sobre no disponibles
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      // Rating mayor a menor
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      // Servicios concluidos mayor a menor
      const servA = a.completedBookingsCount || 0;
      const servB = b.completedBookingsCount || 0;
      if (servB !== servA) {
        return servB - servA;
      }
      // Coincidencia de zona si se proporciona
      if (zoneQuery) {
        const zoneA = a.zone.toLowerCase().includes(zoneQuery.toLowerCase());
        const zoneB = b.zone.toLowerCase().includes(zoneQuery.toLowerCase());
        if (zoneA !== zoneB) return zoneA ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      ok: true,
      employees: formatted,
    });
  } catch (error: any) {
    console.error("Error en /api/employees:", error);
    return NextResponse.json(
      { error: "Error al obtener colaboradores disponibles." },
      { status: 500 }
    );
  }
}
