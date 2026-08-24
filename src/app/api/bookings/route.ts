import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBooking, getBookings, getUserByEmail, createUser } from "@/lib/db";
import { calculatePricing } from "@/lib/pricing";
import { generateBookingNumber } from "@/lib/utils";
import { sendNewBookingAdminNotification, sendBookingConfirmationToCustomer } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const email = searchParams.get("email") || undefined;

    // Si el usuario es administrador, puede ver todas las reservas
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (userRole === "ADMIN") {
      const bookings = getBookings({ status, email });
      return NextResponse.json({ bookings });
    }

    // Si es cliente autenticado, filtrar por su ID o email
    if (session?.user?.email) {
      const bookings = getBookings({
        userId: userId || undefined,
        email: session.user.email,
        status,
      });
      return NextResponse.json({ bookings });
    }

    // Si no está autenticado pero consulta con su email específico
    if (email) {
      const bookings = getBookings({ email, status });
      return NextResponse.json({ bookings });
    }

    return NextResponse.json({ bookings: [] });
  } catch (error: any) {
    console.error("Error al obtener reservas:", error);
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      latitude,
      longitude,
      serviceHours,
      frequency,
      extras = [],
      serviceDate,
      serviceTime,
      paymentMethod = "cash",
      notes,
    } = body;

    if (!customerName || !customerPhone || !customerEmail || !address || !serviceHours || !serviceDate || !serviceTime) {
      return NextResponse.json(
        { error: "Por favor completa tu nombre, teléfono, correo, dirección y horario para agendar tu servicio." },
        { status: 400 }
      );
    }

    // Recalcular precio en backend para total seguridad
    const pricing = calculatePricing(Number(serviceHours) as any, frequency || "once", extras);
    const bookingNumber = generateBookingNumber();

    // Asociar a usuario autenticado o crear cuenta de cliente automática
    let userId = (session?.user as any)?.id;
    const targetEmail = session?.user?.email || customerEmail;

    if (targetEmail) {
      let existingUser = getUserByEmail(targetEmail);
      if (!existingUser) {
        try {
          existingUser = createUser({
            name: customerName,
            email: targetEmail,
            phone: customerPhone,
            role: "CUSTOMER",
            password: "cliente" + Math.random().toString(36).substring(2, 8),
          });
        } catch (e) {
          // Si ya existe por condición de carrera, recuperarlo
          existingUser = getUserByEmail(targetEmail);
        }
      }
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    const booking = createBooking({
      bookingNumber,
      userId: userId || null,
      customerName,
      customerPhone,
      customerEmail: targetEmail,
      address,
      latitude: latitude ? parseFloat(latitude.toString()) : null,
      longitude: longitude ? parseFloat(longitude.toString()) : null,
      serviceHours: Number(serviceHours) as any,
      frequency: frequency || "once",
      extras,
      serviceDate,
      serviceTime,
      totalPrice: pricing.finalPrice,
      discount: pricing.discountAmount,
      paymentMethod,
      paymentStatus: "PENDING",
      status: "PENDING",
      assignedCleaner: null,
      notes: notes || null,
    });

    // Enviar notificación por correo al Administrador (juanas89@gmail.com) y al Cliente
    try {
      await Promise.allSettled([
        sendNewBookingAdminNotification(booking),
        sendBookingConfirmationToCustomer(booking),
      ]);
    } catch (mailErr) {
      console.error("Error al despachar emails de notificación:", mailErr);
    }

    return NextResponse.json(
      {
        message: "¡Reserva creada exitosamente!",
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear reserva:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la reserva." },
      { status: 500 }
    );
  }
}
