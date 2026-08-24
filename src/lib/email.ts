import nodemailer from "nodemailer";
import { Booking } from "@/types";
import { formatGs } from "./pricing";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "juanas89@gmail.com";

// Configuración del Transporter de Nodemailer
function getMailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    // Normalizar contraseña de aplicación (funciona tanto con espacios como sin espacios)
    const cleanPass = gmailPass.replace(/\s+/g, "");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser.trim(),
        pass: cleanPass,
      },
    });
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

/**
 * Envía una notificación por correo electrónico al Administrador (juanas89@gmail.com) con el detalle de la nueva reserva.
 */
export async function sendNewBookingAdminNotification(booking: Booking): Promise<boolean> {
  const recipient = ADMIN_EMAIL;
  const subject = `🔔 Nueva Reserva: #${booking.bookingNumber} - ${booking.customerName} (${formatGs(booking.totalPrice)})`;
  const whatsappUrl = `https://wa.me/595${booking.customerPhone.replace(/\D/g, "").replace(/^0+/, "")}`;
  const mapsUrl = booking.latitude && booking.longitude 
    ? `https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .badge { display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-top: 8px; }
    .content { padding: 24px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
    .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .info-grid td { padding: 8px 4px; font-size: 13px; vertical-align: top; }
    .info-label { color: #64748b; font-weight: 600; width: 35%; }
    .info-value { color: #0f172a; font-weight: 700; }
    .price-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .price-amount { font-size: 24px; font-weight: 900; color: #166534; margin: 4px 0; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 13px; margin: 8px 4px; }
    .btn-whatsapp { background-color: #25D366; }
    .footer { background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ ¡Nueva Reserva Recibida!</h1>
      <div class="badge">Orden N° ${booking.bookingNumber}</div>
    </div>
    
    <div class="content">
      <p style="font-size: 14px; margin-top: 0;">Hola <strong>Juan</strong>, se ha registrado una nueva solicitud de servicio en <strong>Aquí Estamos</strong>:</p>

      <div class="price-box">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #15803d;">Monto Total Liquidado</span>
        <div class="price-amount">${formatGs(booking.totalPrice)}</div>
        <span style="font-size: 11px; color: #166534;">Pago: <strong>${booking.paymentMethod.toUpperCase()}</strong></span>
      </div>

      <div class="section-title">👤 Datos del Cliente</div>
      <table class="info-grid">
        <tr>
          <td class="info-label">Nombre:</td>
          <td class="info-value">${booking.customerName}</td>
        </tr>
        <tr>
          <td class="info-label">Teléfono:</td>
          <td class="info-value">${booking.customerPhone}</td>
        </tr>
        <tr>
          <td class="info-label">Correo:</td>
          <td class="info-value">${booking.customerEmail}</td>
        </tr>
      </table>

      <div class="section-title">📅 Detalles del Servicio</div>
      <table class="info-grid">
        <tr>
          <td class="info-label">Fecha:</td>
          <td class="info-value">${booking.serviceDate}</td>
        </tr>
        <tr>
          <td class="info-label">Horario:</td>
          <td class="info-value">${booking.serviceTime} hs</td>
        </tr>
        <tr>
          <td class="info-label">Duración:</td>
          <td class="info-value">${booking.serviceHours} Horas</td>
        </tr>
        <tr>
          <td class="info-label">Frecuencia:</td>
          <td class="info-value">${booking.frequency}</td>
        </tr>
        ${booking.extras && booking.extras.length > 0 ? `
        <tr>
          <td class="info-label">Extras:</td>
          <td class="info-value">${booking.extras.join(", ")}</td>
        </tr>
        ` : ""}
        <tr>
          <td class="info-label">Dirección:</td>
          <td class="info-value">${booking.address}</td>
        </tr>
        ${booking.notes ? `
        <tr>
          <td class="info-label">Notas:</td>
          <td class="info-value">${booking.notes}</td>
        </tr>
        ` : ""}
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${whatsappUrl}" class="btn btn-whatsapp" target="_blank">
          💬 Contactar por WhatsApp
        </a>
        <a href="${mapsUrl}" class="btn" target="_blank" style="background-color: #334155;">
          📍 Ver Ubicación en Maps
        </a>
      </div>
    </div>

    <div class="footer">
      Este es un correo automático enviado a <strong>${recipient}</strong> por la plataforma Aquí Estamos 3.0.<br>
      Asunción, Paraguay.
    </div>
  </div>
</body>
</html>
  `;

  try {
    const transporter = getMailTransporter();
    if (transporter) {
      const fromSender = process.env.EMAIL_FROM || `Aquí Estamos Limpieza <${process.env.GMAIL_USER || "juanas89@gmail.com"}>`;
      await transporter.sendMail({
        from: fromSender,
        to: recipient,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Notification] Correo enviado exitosamente a ${recipient} para la reserva ${booking.bookingNumber}`);
      return true;
    } else {
      console.log(`[Email Notification (Transporter Ready)] Nueva reserva recibida para ${recipient}: ${booking.bookingNumber}`);
      return true;
    }
  } catch (error) {
    console.error("[Email Notification Error] Error al enviar correo al admin:", error);
    return false;
  }
}

/**
 * Envía un correo electrónico de confirmación al Cliente con el detalle de su reserva y comprobante.
 */
export async function sendBookingConfirmationToCustomer(booking: Booking): Promise<boolean> {
  if (!booking.customerEmail) return false;

  const recipient = booking.customerEmail;
  const subject = `✨ Confirmación de Reserva: #${booking.bookingNumber} — Aquí Estamos Limpieza`;
  const supportWhatsapp = "https://wa.me/595984320528";

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .badge { display: inline-block; background-color: rgba(255, 255, 255, 0.25); padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-top: 8px; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; }
    .section-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
    .info-grid { width: 100%; border-collapse: collapse; }
    .info-grid td { padding: 6px 0; font-size: 13px; }
    .info-label { color: #64748b; font-weight: 600; width: 40%; }
    .info-value { color: #0f172a; font-weight: 700; }
    .price-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .price-amount { font-size: 26px; font-weight: 900; color: #166534; margin: 4px 0; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 13px; margin-top: 12px; }
    .guarantee-box { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px; margin-top: 20px; font-size: 12px; color: #92400e; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Tu Servicio está Confirmado! 🎉</h1>
      <div class="badge">Orden N° ${booking.bookingNumber}</div>
    </div>
    
    <div class="content">
      <p>Hola <strong>${booking.customerName}</strong>,</p>
      <p>¡Gracias por elegir <strong>Aquí Estamos</strong>! Hemos recibido tu solicitud y nuestro equipo operativo está coordinando tu visita con personal formalmente contratado y verificado en <strong>IPS</strong>.</p>

      <div class="price-box">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #15803d;">Monto Total a Abonar</span>
        <div class="price-amount">${formatGs(booking.totalPrice)}</div>
        <span style="font-size: 11px; color: #166534;">Método: <strong>${booking.paymentMethod.toUpperCase()} (Tarifa Plana)</strong></span>
      </div>

      <div class="section-box">
        <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; color: #0284c7; margin-bottom: 8px;">
          📋 Resumen de tu Turno
        </div>
        <table class="info-grid">
          <tr>
            <td class="info-label">Fecha:</td>
            <td class="info-value">${booking.serviceDate}</td>
          </tr>
          <tr>
            <td class="info-label">Horario de Llegada:</td>
            <td class="info-value">${booking.serviceTime} hs</td>
          </tr>
          <tr>
            <td class="info-label">Duración:</td>
            <td class="info-value">${booking.serviceHours} Horas</td>
          </tr>
          <tr>
            <td class="info-label">Dirección:</td>
            <td class="info-value">${booking.address}</td>
          </tr>
          ${booking.extras && booking.extras.length > 0 ? `
          <tr>
            <td class="info-label">Extras:</td>
            <td class="info-value">${booking.extras.join(", ")}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div class="guarantee-box">
        🛡️ <strong>Garantía de Satisfacción 200%:</strong> Todo nuestro personal cuenta con seguro de IPS, revisión de antecedentes y seguro contra daños. Si algún rincón no queda impecable, lo retocamos en 24 horas sin costo alguno.
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${supportWhatsapp}" class="btn" style="background-color: #25D366;" target="_blank">
          💬 Contactar por WhatsApp ante cualquier duda
        </a>
      </div>
    </div>

    <div class="footer">
      <strong>Aquí Estamos Limpieza Profesional</strong><br>
      Asunción y Gran Asunción, Paraguay.<br>
      Tel: +595 984 320 528
    </div>
  </div>
</body>
</html>
  `;

  try {
    const transporter = getMailTransporter();
    if (transporter) {
      const fromSender = process.env.EMAIL_FROM || `Aquí Estamos Limpieza <${process.env.GMAIL_USER || "juanas89@gmail.com"}>`;
      await transporter.sendMail({
        from: fromSender,
        to: recipient,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Confirmation] Correo de confirmación enviado exitosamente al cliente: ${recipient}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Email Confirmation Error] Error al enviar confirmación al cliente:", error);
    return false;
  }
}

/**
 * Envía un correo con el código y enlace para restablecer la contraseña del cliente.
 */
export async function sendPasswordResetEmail({
  email,
  name,
  code,
  resetUrl,
}: {
  email: string;
  name: string;
  code: string;
  resetUrl: string;
}): Promise<boolean> {
  const subject = `🔒 Recuperación de Contraseña — Aquí Estamos Limpieza`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .content { padding: 28px 24px; }
    .code-box { background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .code-number { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0369a1; font-family: monospace; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 16px 0; }
    .footer { background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Recuperación de Contraseña</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">Hola <strong>${name || "Cliente"}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6;">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Aquí Estamos</strong>.
      </p>

      <div class="code-box">
        <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Tu Código de Verificación</p>
        <div class="code-number">${code}</div>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">Válido durante los próximos 60 minutos</p>
      </div>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn" target="_blank">
          Restablecer Contraseña Directamente
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; pt: 16px;">
        Si no solicitaste este cambio, puedes ignorar este correo con total tranquilidad. Tu contraseña actual seguirá siendo segura.
      </p>
    </div>

    <div class="footer">
      <strong>Aquí Estamos Limpieza Profesional</strong><br>
      Asunción y Gran Asunción, Paraguay.<br>
      Tel / WhatsApp: +595 984 320 528
    </div>
  </div>
</body>
</html>
  `;

  try {
    const transporter = getMailTransporter();
    if (transporter) {
      const fromSender = process.env.EMAIL_FROM || `Aquí Estamos <${process.env.GMAIL_USER || "juanas89@gmail.com"}>`;
      await transporter.sendMail({
        from: fromSender,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Reset] Correo de recuperación enviado con éxito a: ${email}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Email Reset Error] Error al enviar correo de recuperación:", error);
    return false;
  }
}
