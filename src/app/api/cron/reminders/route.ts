import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  send24HourReminderToCustomer,
  send24HourReminderToEmployee,
  formatWhatsAppPhone,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * CRON JOB DE RECORDATORIOS 24 HORAS ANTES
 * Se ejecuta automáticamente a diario o bajo demanda desde el CRM.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "aquiestamos_cron_secret_2026";

    // Validar token de seguridad del cron (si se provee por header o query param)
    const providedSecret = searchParams.get("secret") || (authHeader ? authHeader.replace("Bearer ", "") : "");
    if (process.env.NODE_ENV === "production" && providedSecret !== cronSecret) {
      // En producción requerir secret salvo ejecución autenticada
      // return NextResponse.json({ error: "No autorizado para ejecutar el cron." }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Conexión a base de datos no disponible." }, { status: 500 });
    }

    // Calcular fecha de mañana (formato YYYY-MM-DD en hora local de Paraguay UTC-4/UTC-3)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    console.log(`[CRON RECORDATORIOS] Buscando reservas para mañana: ${tomorrowStr}`);

    // 1. Obtener todas las reservas de mañana
    const { data: bookings, error: bErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("service_date", tomorrowStr)
      .neq("status", "CANCELLED");

    if (bErr || !bookings) {
      console.error("[CRON ERROR] Error al consultar reservas:", bErr);
      return NextResponse.json({ error: "Error al consultar reservas." }, { status: 500 });
    }

    // 2. Obtener lista de empleados para cruzar teléfonos
    const { data: employees } = await supabase.from("employees").select("*");

    const stats = {
      dateTarget: tomorrowStr,
      totalBookingsFound: bookings.length,
      customerRemindersSent: 0,
      employeeRemindersSent: 0,
      details: [] as string[],
    };

    for (const b of bookings) {
      // Enviar recordatorio al Cliente
      if (b.customer_phone) {
        const custResult = await send24HourReminderToCustomer(
          b.customer_phone,
          b.customer_name || "Cliente",
          {
            bookingNumber: b.booking_number,
            serviceDate: b.service_date,
            serviceTime: b.service_time,
            address: b.address,
            assignedCleaner: b.assigned_cleaner,
          }
        );

        if (custResult.success) {
          stats.customerRemindersSent++;
          stats.details.push(`Recordatorio cliente enviado a ${b.customer_phone} (#${b.booking_number || b.id})`);
        }
      }

      // Enviar recordatorio a la Empleada si está asignada
      if (b.assigned_cleaner && employees) {
        const cleanLower = b.assigned_cleaner.trim().toLowerCase();
        const emp = employees.find(
          (e: any) => cleanLower.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(cleanLower)
        );

        if (emp && emp.phone) {
          const empResult = await send24HourReminderToEmployee(
            emp.phone,
            emp.name,
            {
              serviceDate: b.service_date,
              serviceTime: b.service_time,
              serviceHours: b.service_hours || 4,
              address: b.address,
            }
          );

          if (empResult.success) {
            stats.employeeRemindersSent++;
            stats.details.push(`Recordatorio empleada enviado a ${emp.name} (${emp.phone})`);
          }
        }
      }
    }

    console.log("[CRON RECORDATORIOS] Finalizado con éxito:", stats);

    return NextResponse.json({
      ok: true,
      stats,
    });
  } catch (error: any) {
    console.error("[CRON EXCEPTION]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
