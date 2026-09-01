import { NextResponse } from "next/server";
import { supabaseGetAllEmployees } from "@/lib/supabase-db";
import { getAllEmployees } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const singleDate = searchParams.get("date"); // YYYY-MM-DD
    const datesParam = searchParams.get("dates"); // comma-separated YYYY-MM-DD
    const time = searchParams.get("time"); // e.g. "08:00"
    const hoursStr = searchParams.get("hours"); // e.g. "4", "6", "8"
    const zoneQuery = searchParams.get("zone"); // e.g. "Asunción"

    const targetDates: string[] = [];
    if (datesParam) {
      targetDates.push(...datesParam.split(",").map((d) => d.trim()).filter(Boolean));
    } else if (singleDate) {
      targetDates.push(singleDate.trim());
    }

    let allEmployees = [];
    try {
      allEmployees = await supabaseGetAllEmployees();
    } catch (e) {
      allEmployees = getAllEmployees();
    }

    // Filtrar estrictamente solo colaboradores con status "ACTIVE" (excluir Inactivos y Con Licencia)
    const activeEmployees = allEmployees.filter(
      (e) => !e.status || e.status === "ACTIVE"
    );

    const supabase = getSupabase();

    // Obtener conteo real de servicios concluidos por cada empleado desde la base de datos
    const completedCountMap: Record<string, number> = {};
    try {
      const { data: completedBookings } = await supabase
        .from("bookings")
        .select("assigned_cleaner")
        .eq("status", "COMPLETED");

      if (completedBookings && Array.isArray(completedBookings)) {
        completedBookings.forEach((b: any) => {
          if (!b.assigned_cleaner) return;
          const k = String(b.assigned_cleaner).trim().toLowerCase();
          completedCountMap[k] = (completedCountMap[k] || 0) + 1;
        });
      }
    } catch (err) {
      console.error("Error al obtener conteo de reservas completadas:", err);
    }

    // Verificar disponibilidad real contra bookings existentes
    let busyEmployeeIds = new Set<string>();
    let busyEmployeeNames = new Set<string>();

    if (targetDates.length > 0) {
      try {
        const reqTime = time || "08:00";
        const reqHours = hoursStr ? parseInt(hoursStr, 10) : 4;
        const reqStartHour = parseInt(reqTime.split(":")[0], 10) || 8;
        const reqEndHour = reqStartHour + reqHours;

        const { data: dateBookings } = await supabase
          .from("bookings")
          .select("assigned_cleaner, service_date, service_time, service_hours, status")
          .in("service_date", targetDates)
          .in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"]);

        if (dateBookings && dateBookings.length > 0) {
          // Agrupar reservas por fecha y por empleado
          // date -> cleaner -> array de reservas
          const dateCleanerMap: Record<string, Record<string, any[]>> = {};

          dateBookings.forEach((b: any) => {
            if (!b.assigned_cleaner) return;
            const cKey = String(b.assigned_cleaner).trim().toLowerCase();
            const dKey = b.service_date;

            if (!dateCleanerMap[dKey]) dateCleanerMap[dKey] = {};
            if (!dateCleanerMap[dKey][cKey]) dateCleanerMap[dKey][cKey] = [];
            dateCleanerMap[dKey][cKey].push(b);
          });

          // Evaluar para cada fecha si el empleado excede la carga diaria permitida
          for (const dKey of targetDates) {
            const cleanersOnDate = dateCleanerMap[dKey] || {};

            for (const [cleanerKey, bookings] of Object.entries(cleanersOnDate)) {
              // 1. Si ya tiene una reserva de 6 u 8 horas en esa fecha -> no puede tomar ningún otro servicio
              const hasLongService = bookings.some((b) => Number(b.service_hours) >= 6);
              if (hasLongService) {
                busyEmployeeIds.add(cleanerKey);
                busyEmployeeNames.add(cleanerKey);
                continue;
              }

              // 2. Si ya tiene 2 o más reservas de 4 horas en esa fecha -> jornada completa alcanzada
              const fourHourCount = bookings.filter((b) => Number(b.service_hours) === 4).length;
              if (fourHourCount >= 2) {
                busyEmployeeIds.add(cleanerKey);
                busyEmployeeNames.add(cleanerKey);
                continue;
              }

              // 3. Si el cliente solicita 6 u 8 horas y el empleado ya tiene al menos 1 servicio ese día -> no puede
              if (reqHours >= 6 && bookings.length > 0) {
                busyEmployeeIds.add(cleanerKey);
                busyEmployeeNames.add(cleanerKey);
                continue;
              }

              // 4. Si el empleado tiene 1 servicio de 4h y se solicita otro de 4h, verificar solapamiento de horario
              for (const b of bookings) {
                const bTime = b.service_time || "08:00";
                const bHours = Number(b.service_hours) || 4;
                const bStartHour = parseInt(bTime.split(":")[0], 10) || 8;
                const bEndHour = bStartHour + bHours;

                const hasOverlap = Math.max(reqStartHour, bStartHour) < Math.min(reqEndHour, bEndHour);
                if (hasOverlap) {
                  busyEmployeeIds.add(cleanerKey);
                  busyEmployeeNames.add(cleanerKey);
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error al verificar reservas de empleados:", err);
      }
    }

    // Mapear colaboradores con su estado de disponibilidad y conteo real de servicios
    const formatted = activeEmployees.map((emp) => {
      const empIdLower = emp.id.trim().toLowerCase();
      const empNameLower = emp.name.trim().toLowerCase();

      const isBusy = 
        busyEmployeeIds.has(empIdLower) ||
        busyEmployeeNames.has(empNameLower) ||
        Array.from(busyEmployeeNames).some((b) => b.includes(empNameLower) || empNameLower.includes(b));

      // Conteo de servicios: base del perfil + conteo real de Supabase
      const dbCompleted = (completedCountMap[empIdLower] || 0) + (completedCountMap[empNameLower] || 0);
      const totalCompleted = Math.max(emp.completedBookingsCount || 0, dbCompleted);

      return {
        id: emp.id,
        name: emp.name,
        image: emp.image || null,
        rating: emp.rating !== undefined && emp.rating !== null ? emp.rating : 5.0,
        reviewCount: emp.reviewCount || 0,
        completedBookingsCount: totalCompleted,
        zone: emp.zone || "Asunción y Gran Asunción",
        ipsVerified: Boolean(emp.ipsVerified),
        isAvailable: !isBusy,
      };
    });

    // Criterio de ordenamiento:
    // 1. Primero disponibles
    // 2. Mejor puntuados (Rating desc)
    // 3. Mayor número de servicios concluidos (desc)
    // 4. Coincidencia de zona
    formatted.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      const servA = a.completedBookingsCount || 0;
      const servB = b.completedBookingsCount || 0;
      if (servB !== servA) {
        return servB - servA;
      }
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
