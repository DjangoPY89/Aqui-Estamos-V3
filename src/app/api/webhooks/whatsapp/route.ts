import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  sendWhatsAppTextMessage,
  sendConfirmationNotificationToCustomer,
  formatWhatsAppPhone,
} from "@/lib/whatsapp";
import { processWhatsAppAIMessage } from "@/lib/whatsapp-ai";

export const dynamic = "force-dynamic";

/**
 * 1. VERIFICACIÓN DE WEBHOOK (HANDSHAKE CON META / WHATSAPP)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "aquiestamos_webhook_secret_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WHATSAPP WEBHOOK] Verificación exitosa de Meta Webhook.");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Token de verificación inválido", { status: 403 });
}

/**
 * 2. PROCESAMIENTO DE MENSAJES Y EVENTOS DE WHATSAPP EN TIEMPO REAL
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar estructura de Meta Webhooks
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      // Notificaciones de entrega o estados (sent, delivered, read)
      return NextResponse.json({ ok: true, note: "Status update ignored" });
    }

    const supabase = getSupabase();
    const msg = messages[0];
    const senderPhone = msg.from; // Ej: "595984320528"
    const messageType = msg.type;

    console.log(`[WHATSAPP WEBHOOK] Mensaje recibido de ${senderPhone} (Tipo: ${messageType})`);

    // =========================================================================
    // A. RESPUESTA A BOTONES INTERACTIVOS (CONFIRMAR / RECHAZAR ASIGNACIÓN)
    // =========================================================================
    if (messageType === "interactive" && msg.interactive?.type === "button_reply") {
      const buttonId = msg.interactive.button_reply.id;
      console.log(`[WHATSAPP BUTTON CLICK] ID: ${buttonId}`);

      // 1. CASO: Confirmar Asistencia por parte de la Empleada
      if (buttonId.startsWith("confirm_assign_")) {
        const bookingId = buttonId.replace("confirm_assign_", "");

        if (supabase) {
          // Obtener datos de la reserva
          const { data: booking, error: fetchErr } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .maybeSingle();

          if (booking) {
            // Actualizar estado a CONFIRMED
            await supabase
              .from("bookings")
              .update({
                status: "CONFIRMED",
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);

            console.log(`[WHATSAPP] Reserva ${bookingId} actualizada a CONFIRMED.`);

            // Responder a la Empleada
            await sendWhatsAppTextMessage(
              senderPhone,
              `¡Excelente ${booking.assigned_cleaner || ""}! 🎉 Has confirmado tu asistencia para el servicio del *${booking.service_date} a las ${booking.service_time || "08:00"}*.\n\nEl estatus ha cambiado a *CONFIRMADO* en el sistema. ¡Muchos éxitos!`
            );

            // Disparar mensaje de confirmación automático al CLIENTE
            if (booking.customer_phone) {
              await sendConfirmationNotificationToCustomer(
                booking.customer_phone,
                booking.customer_name || "Estimado/a Cliente",
                {
                  bookingNumber: booking.booking_number,
                  serviceDate: booking.service_date,
                  serviceTime: booking.service_time,
                  serviceHours: booking.service_hours,
                  address: booking.address,
                  assignedCleaner: booking.assigned_cleaner,
                }
              );
              console.log(`[WHATSAPP] Notificación de confirmación enviada al cliente: ${booking.customer_phone}`);
            }

            return NextResponse.json({ ok: true, action: "ASSIGNMENT_CONFIRMED" });
          }
        }
      }

      // 2. CASO: Rechazar Asistencia por parte de la Empleada
      if (buttonId.startsWith("reject_assign_")) {
        const bookingId = buttonId.replace("reject_assign_", "");

        if (supabase) {
          await supabase
            .from("bookings")
            .update({
              assigned_cleaner: null,
              status: "PENDING",
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId);

          await sendWhatsAppTextMessage(
            senderPhone,
            "Entendido. La asignación ha sido retirada de tu agenda y reasignaremos el servicio a otra compañera de cuadrilla. ¡Gracias por avisar a tiempo!"
          );

          return NextResponse.json({ ok: true, action: "ASSIGNMENT_REJECTED" });
        }
      }
    }

    // =========================================================================
    // B. MENSAJES DE TEXTO LIBRES (CONSULTAS DE LIMPIEZA, RRHH Y CANCELACIONES)
    // =========================================================================
    if (messageType === "text") {
      const textBody = msg.text?.body?.trim() || "";

      // 1. Identificar si el emisor es una colaboradora o un cliente en Supabase
      let isEmployee = false;
      let employeeName = "";
      let customerName = "";
      let activeBooking: any = null;

      if (supabase) {
        // Buscar en tabla de empleados por coincidencia de teléfono
        const { data: emps } = await supabase.from("employees").select("*");
        const matchingEmp = emps?.find((e: any) => {
          const empP = formatWhatsAppPhone(e.phone || "");
          const senderP = formatWhatsAppPhone(senderPhone);
          return empP === senderP || empP.includes(senderP.slice(-8)) || senderP.includes(empP.slice(-8));
        });

        if (matchingEmp) {
          isEmployee = true;
          employeeName = matchingEmp.name;
        } else {
          // Buscar si es un cliente con reservas activas
          const { data: clientBookings } = await supabase
            .from("bookings")
            .select("*")
            .order("service_date", { ascending: true });

          const matchB = clientBookings?.find((b: any) => {
            const custP = formatWhatsAppPhone(b.customer_phone || "");
            const senderP = formatWhatsAppPhone(senderPhone);
            return custP === senderP || custP.includes(senderP.slice(-8));
          });

          if (matchB) {
            customerName = matchB.customer_name;
            activeBooking = matchB;
          }
        }
      }

      const lowerText = textBody.toLowerCase();

      // 2. Solicitud de Cancelación por parte del Cliente
      if (
        (lowerText.includes("cancelar") || lowerText.includes("anular reserva") || lowerText.includes("cancelación")) &&
        activeBooking &&
        !isEmployee
      ) {
        if (supabase) {
          await supabase
            .from("bookings")
            .update({
              status: "CANCELLED",
              updated_at: new Date().toISOString(),
            })
            .eq("id", activeBooking.id);

          await sendWhatsAppTextMessage(
            senderPhone,
            `Hola ${customerName || ""}.\n\nTu reserva *#${activeBooking.booking_number || activeBooking.id.slice(-5)}* para el *${activeBooking.service_date}* ha sido *CANCELADA* en nuestro sistema y los cupos han sido liberados.\n\nSi deseas reprogramar en otra fecha, puedes hacerlo en https://aqui-estamos-v3.vercel.app/reservar`
          );

          // Notificar a la empleada si estaba asignada
          if (activeBooking.assigned_cleaner) {
            console.log(`[WHATSAPP] Notificando a ${activeBooking.assigned_cleaner} sobre la cancelación.`);
          }

          return NextResponse.json({ ok: true, action: "CUSTOMER_CANCELLED" });
        }
      }

      // 3. Procesamiento con Motor de Inteligencia Artificial (Jefe de RRHH & Guía Operativa)
      const aiResult = await processWhatsAppAIMessage(senderPhone, textBody, {
        isEmployee,
        employeeName,
        customerName,
        bookingContext: activeBooking,
      });

      // Enviar respuesta generada por la IA
      await sendWhatsAppTextMessage(senderPhone, aiResult.reply);

      return NextResponse.json({
        ok: true,
        action: "AI_REPLY_SENT",
        source: aiResult.source,
      });
    }

    return NextResponse.json({ ok: true, note: "Unsupported message type handled" });
  } catch (error: any) {
    console.error("[WHATSAPP WEBHOOK EXCEPTION]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
