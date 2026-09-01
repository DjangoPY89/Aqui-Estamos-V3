/**
 * WhatsApp Cloud API Client & Messaging Service
 * Aquí Estamos Limpieza
 */

export interface WhatsAppButton {
  type: "reply";
  reply: {
    id: string;
    title: string;
  };
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Normaliza y formatea números de teléfono paraguayos para WhatsApp Cloud API (E.164).
 * Ejemplo: "0984 320 528" -> "595984320528"
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "595" + cleaned.substring(1);
  } else if (!cleaned.startsWith("595")) {
    cleaned = "595" + cleaned;
  }
  return cleaned;
}

/**
 * Envía un mensaje de texto simple a través de WhatsApp Cloud API.
 */
export async function sendWhatsAppTextMessage(to: string, message: string): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const formattedTo = formatWhatsAppPhone(to);

  if (!formattedTo) {
    return { success: false, error: "Número de teléfono no válido" };
  }

  // Si no están configuradas las credenciales de Meta, registrar en consola (Modo Simulación)
  if (!token || !phoneId) {
    console.log(`[WHATSAPP MOCK SIMULATION] Enviando texto a ${formattedTo}:`);
    console.log(message);
    return {
      success: true,
      simulated: true,
      messageId: `mock_msg_${Date.now()}`,
    };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedTo,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[WHATSAPP API ERROR]", data);
      return { success: false, error: data.error?.message || "Error al enviar mensaje" };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("[WHATSAPP FETCH ERROR]", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía un mensaje interactivo con botones de respuesta rápida.
 */
export async function sendWhatsAppInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
  headerText?: string,
  footerText?: string
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const formattedTo = formatWhatsAppPhone(to);

  if (!formattedTo) {
    return { success: false, error: "Número de teléfono no válido" };
  }

  if (!token || !phoneId) {
    console.log(`[WHATSAPP MOCK SIMULATION - BOTONES] Enviando a ${formattedTo}:`);
    console.log(`Cuerpo: ${bodyText}`);
    console.log(`Botones:`, buttons);
    return {
      success: true,
      simulated: true,
      messageId: `mock_btn_${Date.now()}`,
    };
  }

  try {
    const interactivePayload: any = {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: {
            id: b.id,
            title: b.title.slice(0, 20), // Límite de Meta: 20 caracteres por botón
          },
        })),
      },
    };

    if (headerText) {
      interactivePayload.header = { type: "text", text: headerText };
    }
    if (footerText) {
      interactivePayload.footer = { text: footerText };
    }

    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedTo,
        type: "interactive",
        interactive: interactivePayload,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[WHATSAPP API ERROR - INTERACTIVE]", data);
      return { success: false, error: data.error?.message || "Error al enviar botones" };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("[WHATSAPP FETCH ERROR - INTERACTIVE]", error);
    return { success: false, error: error.message };
  }
}

// =========================================================================
// PLANTILLAS DE NEGOCIO (RRHH, CLIENTES, RECORDATORIOS)
// =========================================================================

/**
 * 1. Notificación a la Empleada cuando es asignada a un nuevo servicio.
 * (Incluye botones de Confirmación rápida).
 */
export async function sendAssignmentNotificationToEmployee(
  employeePhone: string,
  employeeName: string,
  booking: {
    id: string;
    bookingNumber?: string;
    serviceDate: string;
    serviceTime: string;
    serviceHours: number;
    address: string;
    extras?: string[];
  }
): Promise<WhatsAppSendResult> {
  const num = booking.bookingNumber || booking.id.slice(-5);
  const dateFormatted = booking.serviceDate;
  const timeFormatted = booking.serviceTime || "08:00 AM";
  const hours = booking.serviceHours || 4;

  const extrasText = booking.extras && booking.extras.length > 0
    ? `\n✨ Tareas adicionales: ${booking.extras.join(", ")}`
    : "";

  const body = `¡Hola ${employeeName}! 👋\n` +
    `Tienes una nueva asignación de servicio en *Aquí Estamos*:\n\n` +
    `📋 *Reserva:* #${num}\n` +
    `📅 *Fecha:* ${dateFormatted}\n` +
    `⏰ *Horario:* ${timeFormatted} (${hours} Horas)\n` +
    `📍 *Ubicación aproximada:* ${booking.address}${extrasText}\n\n` +
    `Por favor confirma si puedes asistir para reservar tu cupo en el sistema.`;

  const buttons = [
    { id: `confirm_assign_${booking.id}`, title: "✅ Confirmar Asistencia" },
    { id: `reject_assign_${booking.id}`, title: "❌ No Puedo Asistir" },
  ];

  return sendWhatsAppInteractiveButtons(
    employeePhone,
    body,
    buttons,
    "Asignación de Servicio IPS",
    "Aquí Estamos Limpieza Profesional"
  );
}

/**
 * 2. Notificación al Cliente cuando la reserva pasa a estado CONFIRMED.
 */
export async function sendConfirmationNotificationToCustomer(
  customerPhone: string,
  customerName: string,
  booking: {
    bookingNumber?: string;
    serviceDate: string;
    serviceTime: string;
    serviceHours: number;
    address: string;
    assignedCleaner?: string;
  }
): Promise<WhatsAppSendResult> {
  const num = booking.bookingNumber || "AE-CONFIRM";
  const cleanerName = booking.assignedCleaner || "Personal de Cuadrilla Asignado";

  const message = `¡Hola ${customerName}! ✨\n\n` +
    `¡Tu servicio de limpieza ha sido *CONFIRMADO* con éxito! 🎉\n\n` +
    `📋 *N° Reserva:* #${num}\n` +
    `📅 *Fecha:* ${booking.serviceDate}\n` +
    `⏰ *Hora:* ${booking.serviceTime || "08:00 AM"} (${booking.serviceHours || 4} Horas)\n` +
    `📍 *Dirección:* ${booking.address}\n` +
    `👩‍💼 *Profesional asignada:* ${cleanerName} (IPS Verificado)\n\n` +
    `Nuestro equipo llegará puntualmente con todos los insumos necesarios. Si deseas realizar alguna modificación o consulta, responde a este mensaje.`;

  return sendWhatsAppTextMessage(customerPhone, message);
}

/**
 * 3. Notificación de Cancelación al Cliente y liberación de cupo.
 */
export async function sendCancellationNotificationToCustomer(
  customerPhone: string,
  customerName: string,
  bookingNumber?: string
): Promise<WhatsAppSendResult> {
  const message = `Hola ${customerName}.\n\n` +
    `Te confirmamos que tu reserva ${bookingNumber ? `#${bookingNumber}` : ""} ha sido *CANCELADA* exitosamente en nuestro sistema.\n\n` +
    `Esperamos atenderte muy pronto. Puedes agendar una nueva fecha en cualquier momento ingresando a: https://aqui-estamos-v3.vercel.app/reservar`;

  return sendWhatsAppTextMessage(customerPhone, message);
}

/**
 * 4. Recordatorio Automático 24 Horas Antes para el Cliente.
 */
export async function send24HourReminderToCustomer(
  customerPhone: string,
  customerName: string,
  booking: {
    bookingNumber?: string;
    serviceDate: string;
    serviceTime: string;
    address: string;
    assignedCleaner?: string;
  }
): Promise<WhatsAppSendResult> {
  const cleaner = booking.assignedCleaner || "Tu profesional asignada";
  const message = `¡Hola ${customerName}! 🔔\n\n` +
    `Te recordamos que *mañana ${booking.serviceDate} a las ${booking.serviceTime || "08:00 AM"}* tienes programado tu servicio de limpieza con *${cleaner}*.\n\n` +
    `📍 *Dirección:* ${booking.address}\n\n` +
    `¡Todo listo para dejar tu espacio reluciente! ✨`;

  return sendWhatsAppTextMessage(customerPhone, message);
}

/**
 * 5. Recordatorio Automático 24 Horas Antes para la Empleada.
 */
export async function send24HourReminderToEmployee(
  employeePhone: string,
  employeeName: string,
  booking: {
    serviceDate: string;
    serviceTime: string;
    serviceHours: number;
    address: string;
  }
): Promise<WhatsAppSendResult> {
  const message = `¡Hola ${employeeName}! 🔔\n\n` +
    `Recordatorio de trabajo para *mañana ${booking.serviceDate}*:\n` +
    `⏰ *Hora:* ${booking.serviceTime || "08:00 AM"} (${booking.serviceHours || 4} Horas)\n` +
    `📍 *Dirección:* ${booking.address}\n\n` +
    `Recuerda asistir con el uniforme oficial y registrar tu inicio de servicio. ¡Buen trabajo! 💪`;

  return sendWhatsAppTextMessage(employeePhone, message);
}
