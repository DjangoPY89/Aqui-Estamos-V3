import nodemailer from "nodemailer";
import { Booking } from "@/types";
import { formatGs } from "./pricing";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "juanas89@gmail.com";
const SITE_URL = process.env.NEXTAUTH_URL || "https://aqui-estamos-v3.vercel.app";
const WHATSAPP_SUPPORT_URL = "https://wa.me/595984320528";

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

function generateGoogleCalUrl(b: Booking) {
  const dateFormatted = b.serviceDate.replace(/-/g, "");
  const timeParts = (b.serviceTime || "09:00").split(":");
  const startHour = parseInt(timeParts[0] || "9", 10);
  const startMin = timeParts[1] || "00";
  const endHour = startHour + (b.serviceHours || 4);
  
  const startIso = `${dateFormatted}T${startHour.toString().padStart(2, "0")}${startMin}00`;
  const endIso = `${dateFormatted}T${endHour.toString().padStart(2, "0")}${startMin}00`;
  
  const title = `Limpieza Aquí Estamos - #${b.bookingNumber}`;
  const details = `Servicio de Limpieza Profesional (${b.serviceHours} Hs)\nCliente: ${b.customerName}\nTeléfono: ${b.customerPhone}\nDirección: ${b.address}\nTotal: ${formatGs(b.totalPrice)}`;
  const location = b.address;
  const calId = "6995kk35n4bc196tnd07q3onahg0t2lh@import.calendar.google.com";
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&src=${encodeURIComponent(calId)}&add=${encodeURIComponent(calId)}&ctz=America/Asuncion`;
}

function formatFrequencyLabel(freq?: string) {
  switch (freq) {
    case "weekly_2_4":
    case "weekly":
    case "semanal":
      return "Semanal (Plan Recurrente)";
    case "biweekly":
    case "quincenal":
      return "Quincenal (Plan Recurrente)";
    case "monthly":
    case "mensual":
      return "Mensual";
    default:
      return "Servicio Único Puntual";
  }
}

/**
 * 1. Envía un Correo Electrónico Profesional de Bienvenida cuando el cliente se registra por primera vez.
 */
export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string;
  name: string;
}): Promise<boolean> {
  if (!email) return false;

  const recipient = email.trim().toLowerCase();
  const displayName = name ? name.trim() : "Cliente";
  const subject = `✨ ¡Bienvenido a Aquí Estamos! Tu cuenta ha sido creada exitosamente`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Aquí Estamos</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 12px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; }
    
    /* Header con Estilo del Index / Hero */
    .hero-header { background: linear-gradient(135deg, #0f172a 0%, #0369a1 60%, #0284c7 100%); padding: 40px 28px; text-align: center; color: #ffffff; position: relative; }
    .brand-tag { display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.25); padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #e0f2fe; margin-bottom: 12px; }
    .hero-title { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.2; }
    .hero-subtitle { margin: 10px 0 0 0; font-size: 14px; color: #bae6fd; font-weight: 500; }
    
    /* Contenido */
    .content { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .paragraph { font-size: 14px; line-height: 1.65; color: #475569; margin: 0 0 18px 0; }
    
    /* Grid de Beneficios Premium */
    .features-grid { margin: 24px 0; }
    .feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; margin-bottom: 12px; display: flex; align-items: flex-start; }
    .feature-icon { font-size: 22px; margin-right: 14px; line-height: 1; flex-shrink: 0; padding-top: 2px; }
    .feature-title { font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 3px 0; }
    .feature-desc { font-size: 12px; color: #64748b; margin: 0; line-height: 1.45; }
    
    /* Botones de Acción */
    .cta-container { text-align: center; margin: 30px 0 16px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); text-align: center; }
    .btn-secondary { display: inline-block; background: #f1f5f9; color: #334155 !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 22px; border-radius: 9999px; margin-top: 10px; border: 1px solid #cbd5e1; }
    
    /* Garantía */
    .guarantee-badge { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 14px 18px; margin-top: 24px; text-align: left; }
    .guarantee-text { font-size: 12px; color: #166534; line-height: 1.5; margin: 0; }
    
    /* Footer */
    .footer { background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6; }
    .footer strong { color: #ffffff; }
    .footer-links { margin-top: 8px; }
    .footer-links a { color: #38bdf8; text-decoration: none; font-weight: 600; margin: 0 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- HERO HEADER INSPIRADO EN EL INDEX -->
      <div class="hero-header">
        <div class="brand-tag">✨ AQUÍ ESTAMOS • LIMPIEZA PROFESIONAL</div>
        <h1 class="hero-title">¡Bienvenido a una Nueva Experiencia de Limpieza!</h1>
        <p class="hero-subtitle">Tu hogar y oficina impecables, en manos del equipo más confiable de Paraguay.</p>
      </div>

      <!-- CUERPO DEL MENSAJE -->
      <div class="content">
        <h2 class="greeting">Hola ${displayName},</h2>
        <p class="paragraph">
          ¡Nos alegra darte la bienvenida a <strong>Aquí Estamos</strong>! Tu cuenta ha sido activada con éxito. A partir de ahora podrás reservar servicios de limpieza por hora, gestionar tus direcciones favoritas y solicitar personal capacitado en menos de 60 segundos.
        </p>

        <!-- BENEFICIOS CLAVE -->
        <div class="features-grid">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 12px;">
                <div class="feature-card">
                  <div class="feature-icon">🛡️</div>
                  <div>
                    <h3 class="feature-title">Personal 100% Verificado en IPS</h3>
                    <p class="feature-desc">Profesionales de confianza con seguro social obligatorio, antecedentes policiales comprobados y seguro de responsabilidad civil.</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 12px;">
                <div class="feature-card">
                  <div class="feature-icon">💎</div>
                  <div>
                    <h3 class="feature-title">Garantía de Satisfacción 200%</h3>
                    <p class="feature-desc">Si algún detalle no queda a la perfección, volvemos a retocarlo en 24 horas sin ningún costo adicional.</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="feature-card">
                  <div class="feature-icon">📱</div>
                  <div>
                    <h3 class="feature-title">Portal de Cliente Autogestionable</h3>
                    <p class="feature-desc">Revisa el historial de tus citas, descarga comprobantes y administra tus direcciones guardadas desde cualquier dispositivo.</p>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- BOTONES DE LLAMADA A LA ACCIÓN -->
        <div class="cta-container">
          <a href="${SITE_URL}/reservar" class="btn-primary" target="_blank">
            ✨ Agendar Mi Primera Limpieza
          </a>
          <br>
          <a href="${SITE_URL}/portal" class="btn-secondary" target="_blank">
            👤 Ir a Mi Portal de Cliente
          </a>
        </div>

        <!-- GARANTIA -->
        <div class="guarantee-badge">
          <p class="guarantee-text">
            <strong>💡 ¿Tienes preguntas o un pedido especial?</strong> Nuestro equipo de soporte está disponible vía WhatsApp en el <strong>+595 984 320 528</strong> para asistirte en todo momento.
          </p>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <strong>Aquí Estamos Limpieza Profesional</strong><br>
        Asunción y Gran Asunción, Paraguay.<br>
        <div class="footer-links">
          <a href="${SITE_URL}">Sitio Web</a> • 
          <a href="${SITE_URL}/portal">Mi Cuenta</a> • 
          <a href="${WHATSAPP_SUPPORT_URL}">WhatsApp</a>
        </div>
      </div>

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
      console.log(`[Welcome Email] Correo de bienvenida enviado con éxito a: ${recipient}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Welcome Email Error] Error al enviar correo de bienvenida:", error);
    return false;
  }
}

/**
 * 2. Envía un Correo Electrónico Profesional de Confirmación de Reserva con todos los datos detallados.
 */
export async function sendBookingConfirmationToCustomer(booking: Booking): Promise<boolean> {
  if (!booking.customerEmail) return false;

  const recipient = booking.customerEmail.trim().toLowerCase();
  const subject = `✨ ¡Reserva Confirmada! #${booking.bookingNumber} — Aquí Estamos Limpieza`;
  const googleCalUrl = generateGoogleCalUrl(booking);
  const mapsUrl = booking.latitude && booking.longitude 
    ? `https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva #${booking.bookingNumber}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 12px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; }
    
    /* Header Luxury */
    .hero-header { background: linear-gradient(135deg, #0f172a 0%, #0369a1 60%, #0284c7 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
    .brand-tag { display: inline-block; background: rgba(255, 255, 255, 0.18); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.25); padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #e0f2fe; margin-bottom: 10px; }
    .hero-title { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .order-badge { display: inline-block; background: #38bdf8; color: #082f49; padding: 4px 12px; border-radius: 8px; font-family: monospace; font-size: 13px; font-weight: 800; margin-top: 10px; }

    /* Contenido */
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px; }
    .intro-p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
    
    /* Tarjeta de Precio */
    .price-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #86efac; border-radius: 20px; padding: 20px; text-align: center; margin: 20px 0 26px 0; }
    .price-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #15803d; }
    .price-amount { font-size: 32px; font-weight: 900; color: #14532d; margin: 4px 0; letter-spacing: -0.5px; }
    .price-sub { font-size: 12px; color: #166534; font-weight: 600; }

    /* Tabla de Detalles */
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0284c7; margin-bottom: 12px; display: flex; align-items: center; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .details-table tr { border-bottom: 1px solid #edf2f7; }
    .details-table tr:last-child { border-bottom: none; }
    .details-table td { padding: 12px 16px; font-size: 13px; vertical-align: top; }
    .td-label { color: #64748b; font-weight: 600; width: 38%; }
    .td-val { color: #0f172a; font-weight: 700; }

    /* Extras Badges */
    .extra-tag { display: inline-block; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; margin: 2px 4px 2px 0; }

    /* Botones */
    .action-grid { text-align: center; margin: 28px 0; }
    .btn-main { display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 24px; border-radius: 9999px; margin: 5px 4px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); }
    .btn-whatsapp { display: inline-block; background-color: #25D366; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 24px; border-radius: 9999px; margin: 5px 4px; }
    .btn-cal { display: inline-block; background-color: #4285F4; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 24px; border-radius: 9999px; margin: 5px 4px; }

    /* Garantía */
    .guarantee-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 16px; font-size: 12px; color: #92400e; line-height: 1.5; margin-top: 20px; }

    /* Footer */
    .footer { background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6; }
    .footer strong { color: #ffffff; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- HEADER -->
      <div class="hero-header">
        <div class="brand-tag">✨ AQUÍ ESTAMOS • LIMPIEZA PROFESIONAL</div>
        <h1 class="hero-title">¡Tu Reserva ha sido Confirmada!</h1>
        <div class="order-badge">Orden N° ${booking.bookingNumber}</div>
      </div>

      <!-- CONTENIDO -->
      <div class="content">
        <h2 class="greeting">Hola ${booking.customerName},</h2>
        <p class="intro-p">
          Hemos recibido y confirmado tu solicitud de servicio. Nuestro equipo operativo ya ha registrado tu horario y preparará la asignación de tu personal con cobertura de IPS.
        </p>

        <!-- CAJA DE MONTO -->
        <div class="price-box">
          <div class="price-label">Monto Total del Servicio</div>
          <div class="price-amount">${formatGs(booking.totalPrice)}</div>
          <div class="price-sub">Método: <strong>${(booking.paymentMethod || "Efectivo").toUpperCase()}</strong> • Tarifa Plana Garantizada</div>
        </div>

        <!-- DETALLES DEL SERVICIO -->
        <div class="section-title">📋 Especificaciones de tu Cita</div>
        <table class="details-table">
          <tr>
            <td class="td-label">📅 Fecha de Visita:</td>
            <td class="td-val">${booking.serviceDate}</td>
          </tr>
          <tr>
            <td class="td-label">⏰ Horario de Llegada:</td>
            <td class="td-val">${booking.serviceTime} hs</td>
          </tr>
          <tr>
            <td class="td-label">⏳ Duración Contratada:</td>
            <td class="td-val">${booking.serviceHours} Horas de Servicio</td>
          </tr>
          <tr>
            <td class="td-label">🔄 Frecuencia:</td>
            <td class="td-val">${formatFrequencyLabel(booking.frequency)}</td>
          </tr>
          ${booking.extras && booking.extras.length > 0 ? `
          <tr>
            <td class="td-label">✨ Extras Seleccionados:</td>
            <td class="td-val">
              ${booking.extras.map((ex) => `<span class="extra-tag">${ex}</span>`).join("")}
            </td>
          </tr>
          ` : `
          <tr>
            <td class="td-label">✨ Tipo de Servicio:</td>
            <td class="td-val">Limpieza Integral Estándar</td>
          </tr>
          `}
          <tr>
            <td class="td-label">📍 Dirección:</td>
            <td class="td-val">${booking.address}</td>
          </tr>
          ${booking.notes ? `
          <tr>
            <td class="td-label">📝 Indicaciones Especiales:</td>
            <td class="td-val">${booking.notes}</td>
          </tr>
          ` : ""}
          <tr>
            <td class="td-label">📞 Teléfono de Contacto:</td>
            <td class="td-val">${booking.customerPhone}</td>
          </tr>
        </table>

        <!-- BOTONES DE ACCIÓN RÁPIDA -->
        <div class="action-grid">
          <a href="${googleCalUrl}" class="btn-cal" target="_blank">
            📅 Añadir a Google Calendar
          </a>
          <a href="${SITE_URL}/portal" class="btn-main" target="_blank">
            👤 Ver en Mi Portal
          </a>
          <a href="${WHATSAPP_SUPPORT_URL}" class="btn-whatsapp" target="_blank">
            💬 Soporte WhatsApp
          </a>
        </div>

        <!-- GARANTIA 200% -->
        <div class="guarantee-card">
          🛡️ <strong>Garantía de Satisfacción 200%:</strong> Todo el personal de Aquí Estamos cuenta con registro verificado en IPS, verificación de antecedentes y protocolos de seguridad. Si algún rincón no queda perfecto, volvemos a retocarlo dentro de las 24 horas sin costo alguno.
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <strong>Aquí Estamos Limpieza Profesional</strong><br>
        Asunción y Gran Asunción, Paraguay.<br>
        Tel / WhatsApp: +595 984 320 528 • info@aquiestamos.com.py
      </div>

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
      console.log(`[Booking Email Confirmation] Correo de confirmación enviado con éxito a: ${recipient} (Reserva #${booking.bookingNumber})`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Booking Email Confirmation Error] Error al enviar confirmación de reserva al cliente:", error);
    return false;
  }
}

/**
 * 3. Envía una notificación por correo electrónico al Administrador con el detalle de la nueva reserva.
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
    .header { background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff; }
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
        <span style="font-size: 11px; color: #166534;">Pago: <strong>${(booking.paymentMethod || "Efectivo").toUpperCase()}</strong></span>
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
          <td class="info-value">${formatFrequencyLabel(booking.frequency)}</td>
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
        <a href="${SITE_URL}/admin" class="btn" target="_blank">
          ⚙️ Abrir en Panel Admin
        </a>
      </div>
    </div>

    <div class="footer">
      Este es un correo automático enviado a <strong>${recipient}</strong> por la plataforma Aquí Estamos.<br>
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
      console.log(`[Admin Notification] Notificación enviada a ${recipient} para reserva ${booking.bookingNumber}`);
      return true;
    }
    return true;
  } catch (error) {
    console.error("[Admin Notification Error] Error al enviar correo al admin:", error);
    return false;
  }
}

/**
 * 4. Envía un correo con el código y enlace para restablecer la contraseña del cliente.
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
    .header { background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
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

