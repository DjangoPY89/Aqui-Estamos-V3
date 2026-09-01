import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { getBookingById, getAllEmployees } from "@/lib/db";
import {
  sendAssignmentNotificationToEmployee,
  sendConfirmationNotificationToCustomer,
  sendWhatsAppTextMessage,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

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

    const supabase = getSupabase();

    // 1. Acción: Enviar Notificación de Asignación a la Empleada con Botones
    if (action === "NOTIFY_ASSIGNMENT" && bookingId) {
      let booking: any = null;
      let employees: any[] = [];

      try {
        const { data: bData } = await supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle();
        booking = bData;
        const { data: eData } = await supabase.from("employees").select("*");
        employees = eData || [];
      } catch (dbErr) {
        console.warn("[ADMIN WHATSAPP] Fallback to memory store:", dbErr);
      }

      if (!booking) {
        booking = getBookingById(bookingId);
      }
      if (employees.length === 0) {
        try { employees = getAllEmployees(); } catch (e) {}
      }

      if (!booking) {
        return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
      }

      const cleanerName = booking.assigned_cleaner || booking.assignedCleaner;
      if (!cleanerName || cleanerName === "Sin Asignar") {
        return NextResponse.json({ error: "La reserva aún no tiene personal asignado." }, { status: 400 });
      }

      const cleanLower = cleanerName.trim().toLowerCase();
      const emp = employees.find(
        (e: any) => cleanLower.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(cleanLower)
      );

      const empPhone = emp?.phone || process.env.WHATSAPP_BOT_PHONE || "595983463553";
      const empName = emp?.name || cleanerName;

      const result = await sendAssignmentNotificationToEmployee(empPhone, empName, {
        id: booking.id,
        bookingNumber: booking.booking_number || booking.bookingNumber || booking.id.slice(-5),
        serviceDate: booking.service_date || booking.serviceDate,
        serviceTime: booking.service_time || booking.serviceTime || "08:00",
        serviceHours: booking.service_hours || booking.serviceHours || 4,
        address: booking.address || "",
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
