import { NextResponse } from "next/server";
import { supabaseGetAllEmployees } from "@/lib/supabase-db";
import { getAllEmployees } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // Filtrar estrictamente solo colaboradores con status === "ACTIVE" (excluir INACTIVE y ON_LEAVE)
    const activeEmployees = allEmployees.filter((e) => e.status === "ACTIVE");

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

    // Mapeo canónico de nombres e IDs a cada objeto de empleado activo
    const isEmployeeMatch = (cleanerStr: string, emp: { id: string; name: string }) => {
      if (!cleanerStr) return false;
      const target = cleanerStr.trim().toLowerCase();
      const empId = emp.id.trim().toLowerCase();
      const empName = emp.name.trim().toLowerCase();
      return target === empId || target === empName || target.includes(empName) || empName.includes(target);
    };

    // Consultar reservas activas en las fechas solicitadas
    let dateBookingsList: any[] = [];
    if (targetDates.length > 0) {
      try {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("id, assigned_cleaner, service_date, service_time, service_hours, status")
          .in("service_date", targetDates)
          .in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"]);

        if (bookingsData && Array.isArray(bookingsData)) {
          dateBookingsList = bookingsData;
        }
      } catch (err) {
        console.error("Error al consultar reservas por fecha:", err);
      }
    }

    const reqTime = time || "08:00";
    const reqHours = hoursStr ? parseInt(hoursStr, 10) : 4;
    const reqStartHour = parseInt(reqTime.split(":")[0], 10) || 8;
    const reqEndHour = reqStartHour + reqHours;

    // Evaluar disponibilidad para cada empleado activo
    const formatted = activeEmployees.map((emp) => {
      let isAvailable = true;

      if (targetDates.length > 0) {
        for (const dKey of targetDates) {
          // Determinar si la fecha es sábado
          const [y, m, d] = dKey.split("-").map(Number);
          const dateObj = new Date(y, m - 1, d);
          const isSaturday = dateObj.getDay() === 6;

          // Obtener todas las reservas asignadas a este empleado en la fecha dKey
          const empBookingsOnDate = dateBookingsList.filter(
            (b) => b.service_date === dKey && isEmployeeMatch(b.assigned_cleaner, emp)
          );

          if (isSaturday) {
            // REGLAS PARA SÁBADOS:
            // 1. Servicios de 6 u 8 horas NO disponibles los sábados
            if (reqHours >= 6) {
              isAvailable = false;
              break;
            }
            // 2. Solo 1 servicio de 4 horas por empleado en sábado
            if (empBookingsOnDate.length >= 1) {
              isAvailable = false;
              break;
            }
          } else {
            // REGLAS PARA LUNES A VIERNES:
            // 1. Si ya tiene un servicio de 6 u 8 horas en esa fecha -> jornada completa tomada
            const hasLongService = empBookingsOnDate.some((b) => Number(b.service_hours) >= 6);
            if (hasLongService) {
              isAvailable = false;
              break;
            }

            // 2. Si ya tiene 2 o más servicios de 4 horas en esa fecha -> cupo máximo diario (2x4h) alcanzado
            const fourHourCount = empBookingsOnDate.filter((b) => Number(b.service_hours) === 4).length;
            if (fourHourCount >= 2) {
              isAvailable = false;
              break;
            }

            // 3. Si el cliente solicita 6 u 8 horas y el empleado ya tiene al menos 1 servicio agendado hoy -> no puede
            if (reqHours >= 6 && empBookingsOnDate.length > 0) {
              isAvailable = false;
              break;
            }

            // 4. Si el empleado tiene 1 servicio de 4h y se solicita otro de 4h -> verificar si hay solapamiento horario
            if (reqHours === 4 && fourHourCount === 1) {
              const existingBooking = empBookingsOnDate[0];
              const bTime = existingBooking.service_time || "08:00";
              const bHours = Number(existingBooking.service_hours) || 4;
              const bStartHour = parseInt(bTime.split(":")[0], 10) || 8;
              const bEndHour = bStartHour + bHours;

              const hasOverlap = Math.max(reqStartHour, bStartHour) < Math.min(reqEndHour, bEndHour);
              if (hasOverlap) {
                isAvailable = false;
                break;
              }
            }
          }
        }
      }

      // Conteo de servicios completados en base de datos
      const empIdLower = emp.id.trim().toLowerCase();
      const empNameLower = emp.name.trim().toLowerCase();
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
        isAvailable,
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

    return NextResponse.json(
      {
        ok: true,
        employees: formatted,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Error en /api/employees:", error);
    return NextResponse.json(
      { error: "Error al obtener colaboradores disponibles." },
      { status: 500 }
    );
  }
}
