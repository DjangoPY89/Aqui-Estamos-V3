import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import {
  sendAssignmentNotificationToEmployee,
  sendConfirmationNotificationToCustomer,
  sendWhatsAppTextMessage,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Endpoint de Control y Envío Manual de Notificaciones WhatsApp desde el CRM
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const body = await req.json();
    const { action, bookingId, phone, message } = body;

    const supabase = getSupabaseClient();

    // 1. Acción: Enviar Notificación de Asignación a la Empleada con Botones
    if (action === "NOTIFY_ASSIGNMENT" && bookingId) {
      if (!supabase) return NextResponse.json({ error: "Sin conexión a DB" }, { status: 500 });

      const { data: booking } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
      if (!booking || !booking.assigned_cleaner) {
        return NextResponse.json({ error: "La reserva no tiene personal asignado." }, { status: 400 });
      }

      const { data: employees } = await supabase.from("employees").select("*");
      const cleanLower = booking.assigned_cleaner.trim().toLowerCase();
      const emp = employees?.find(
        (e: any) => cleanLower.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(cleanLower)
      );

      if (!emp || !emp.phone) {
        return NextResponse.json({ error: `No se encontró el teléfono del colaborador "${booking.assigned_cleaner}".` }, { status: 400 });
      }

      const result = await sendAssignmentNotificationToEmployee(emp.phone, emp.name, {
        id: booking.id,
        bookingNumber: booking.booking_number,
        serviceDate: booking.service_date,
        serviceTime: booking.service_time,
        serviceHours: booking.service_hours || 4,
        address: booking.address,
        extras: Array.isArray(booking.extras) ? booking.extras : [],
      });

      return NextResponse.json({ ok: true, result });
    }

    // 2. Acción: Enviar Mensaje de Prueba
    if (action === "TEST_MESSAGE" && phone && message) {
      const result = await sendWhatsAppTextMessage(phone, message);
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    console.error("[ADMIN WHATSAPP ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
