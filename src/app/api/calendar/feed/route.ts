import { NextResponse } from "next/server";
import { supabaseGetAllBookings } from "@/lib/supabase-db";
import { getBookings } from "@/lib/db";
import { formatGs } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function formatIcsDate(dateStr: string, timeStr: string = "08:00", hoursDuration: number = 4) {
  try {
    const cleanDate = dateStr.replace(/-/g, "");
    const timeParts = timeStr.split(":");
    const startH = parseInt(timeParts[0] || "8", 10);
    const startM = timeParts[1] || "00";
    const endH = startH + hoursDuration;

    const dtStart = `${cleanDate}T${startH.toString().padStart(2, "0")}${startM}00`;
    const dtEnd = `${cleanDate}T${endH.toString().padStart(2, "0")}${startM}00`;

    return { dtStart, dtEnd };
  } catch (e) {
    const fallback = dateStr.replace(/-/g, "") + "T080000";
    return { dtStart: fallback, dtEnd: fallback };
  }
}

export async function GET(req: Request) {
  try {
    let allBookings: any[] = [];
    try {
      allBookings = await supabaseGetAllBookings();
    } catch (e) {
      allBookings = getBookings();
    }

    const nowIso = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Aqui Estamos Limpieza//Agenda Operativa v3.0//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Aqui Estamos - Citas de Limpieza",
      "X-WR-TIMEZONE:America/Asuncion",
      "X-WR-CALDESC:Calendario oficial de servicios y citas de limpieza de Aqui Estamos",
    ];

    for (const b of allBookings) {
      if (!b.serviceDate) continue;
      const { dtStart, dtEnd } = formatIcsDate(b.serviceDate, b.serviceTime, b.serviceHours || 4);
      const summary = `Limpieza: ${b.customerName || "Cliente"} (${b.serviceHours || 4}hs - ${b.bookingNumber || "Reserva"})`;
      const description = `Servicio de Limpieza Aquí Estamos\\nCliente: ${b.customerName || "N/A"}\\nTeléfono: ${b.customerPhone || "N/A"}\\nPersonal Asignado: ${b.assignedCleaner || "Por confirmar"}\\nTotal: ${formatGs(b.totalPrice || 0)}\\nEstado: ${b.status || "CONFIRMED"}`;
      const location = (b.address || "Asunción, Paraguay").replace(/,/g, "\\,");
      const uid = `booking-${b.id || b.bookingNumber}@aquiestamos.com.py`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${nowIso}`,
        `DTSTART;TZID=America/Asuncion:${dtStart}`,
        `DTEND;TZID=America/Asuncion:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `STATUS:${b.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED"}`,
        "END:VEVENT"
      );
    }

    icsContent.push("END:VCALENDAR");

    const responseText = icsContent.join("\r\n");

    return new Response(responseText, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="aquiestamos-calendario.ics"',
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al generar feed iCal" }, { status: 500 });
  }
}
