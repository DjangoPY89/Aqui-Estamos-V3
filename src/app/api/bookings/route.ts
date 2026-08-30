import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBooking, getBookings, getUserByEmail, createUser, updateUserProfile, getAllEmployees } from "@/lib/db";
import {
  supabaseCreateBooking,
  supabaseCreateUser,
  supabaseGetAllBookings,
  supabaseGetBookingsByUserId,
  supabaseGetUserByEmail,
  supabaseUpdateUser,
  supabaseGetAllEmployees,
} from "@/lib/supabase-db";
import { calculatePricing } from "@/lib/pricing";
import { generateBookingNumber } from "@/lib/utils";
import { sendNewBookingAdminNotification, sendBookingConfirmationToCustomer, sendWelcomeEmail } from "@/lib/email";
import { checkDateAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

async function enrichBookingsWithEmployees(bookings: any[]) {
  if (!bookings || bookings.length === 0) return [];
  let employees: any[] = [];
  try {
    employees = await supabaseGetAllEmployees();
  } catch (e) {
    try {
      employees = getAllEmployees();
    } catch (e2) {}
  }

  return bookings.map((b) => {
    let cleaner: any = null;
    if (b.assignedCleaner) {
      const target = b.assignedCleaner.trim().toLowerCase();
      cleaner = employees.find((e) => 
        (e.id && e.id.toLowerCase() === target) ||
        (e.name && e.name.toLowerCase() === target) ||
        (e.name && target.includes(e.name.toLowerCase())) ||
        (e.name && e.name.toLowerCase().includes(target))
      );
    }

    return {
      ...b,
      employeeName: cleaner?.name || b.assignedCleaner || null,
      employeePhone: cleaner?.phone || null,
      employeeImage: cleaner?.image || null,
      employeeRating: cleaner?.rating !== undefined && cleaner?.rating !== null ? cleaner.rating : 5.0,
      employeeZone: cleaner?.zone || null,
      employeeIps: cleaner?.ipsVerified ?? true,
    };
  });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const email = searchParams.get("email") || undefined;
    const isSelfOnly = searchParams.get("self") === "true";

    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const userEmail = session?.user?.email?.toLowerCase();

    // Si se consulta para el portal propio (self=true)
    if (isSelfOnly && userEmail) {
      let clientBookings: any[] = [];
      try {
        const all = await supabaseGetAllBookings();
        clientBookings = all.filter((b) => 
          (b.customerEmail && b.customerEmail.toLowerCase() === userEmail) ||
          (userId && b.userId && b.userId === userId)
        );
        if (status && status !== "ALL") {
          clientBookings = clientBookings.filter((b) => b.status === status);
        }
      } catch (e) {
        clientBookings = getBookings({
          userId: userId || undefined,
          email: userEmail,
          status,
        });
      }
      const enriched = await enrichBookingsWithEmployees(clientBookings);
      return NextResponse.json({ bookings: enriched });
    }

    // Si el usuario es administrador (y no es consulta de portal propio), puede ver todas las reservas
    if (userRole === "ADMIN") {
      let allBookings: any[] = [];
      try {
        allBookings = await supabaseGetAllBookings();
        if (status && status !== "ALL") {
          allBookings = allBookings.filter((b) => b.status === status);
        }
        if (email) {
          allBookings = allBookings.filter((b) => b.customerEmail && b.customerEmail.toLowerCase() === email.toLowerCase());
        }
      } catch (e) {
        allBookings = getBookings({ status, email });
      }
      const enriched = await enrichBookingsWithEmployees(allBookings);
      return NextResponse.json({ bookings: enriched });
    }

    // Si es cliente autenticado, filtrar por su ID o email
    if (session?.user?.email) {
      let clientBookings: any[] = [];
      try {
        if (userId) {
          clientBookings = await supabaseGetBookingsByUserId(userId);
        }
        if (clientBookings.length === 0) {
          const all = await supabaseGetAllBookings();
          clientBookings = all.filter((b) => b.customerEmail && b.customerEmail.toLowerCase() === session?.user?.email?.toLowerCase());
        }
        if (status && status !== "ALL") {
          clientBookings = clientBookings.filter((b) => b.status === status);
        }
      } catch (e) {
        clientBookings = getBookings({
          userId: userId || undefined,
          email: session.user.email,
          status,
        });
      }
      const enriched = await enrichBookingsWithEmployees(clientBookings);
      return NextResponse.json({ bookings: enriched });
    }

    // Si no está autenticado pero consulta con su email específico
    if (email) {
      let clientBookings: any[] = [];
      try {
        const all = await supabaseGetAllBookings();
        clientBookings = all.filter((b) => b.customerEmail && b.customerEmail.toLowerCase() === email.toLowerCase());
        if (status && status !== "ALL") {
          clientBookings = clientBookings.filter((b) => b.status === status);
        }
      } catch (e) {
        clientBookings = getBookings({ email, status });
      }
      const enriched = await enrichBookingsWithEmployees(clientBookings);
      return NextResponse.json({ bookings: enriched });
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

    // Validar restricción de horario para servicios de 6 y 8 horas
    const numHours = Number(serviceHours);
    if ((numHours === 6 || numHours === 8) && serviceTime > "08:00") {
      return NextResponse.json(
        { error: "Los servicios de 6 y 8 horas deben iniciar a las 08:00 AM o antes para garantizar la jornada completa." },
        { status: 400 }
      );
    }

    // Validar rigurosamente que la fecha esté abierta en el servidor (bloqueos, feriados, capacidad)
    try {
      const availCheck = await checkDateAvailability(serviceDate);
      if (!availCheck.isOpen) {
        return NextResponse.json(
          { error: availCheck.closedReason || "La fecha seleccionada no se encuentra disponible para reservas." },
          { status: 400 }
        );
      }
    } catch (errAvail) {
      console.error("Error validating date availability on server:", errAvail);
    }

    // Recalcular precio en backend para total seguridad
    const pricing = calculatePricing(Number(serviceHours) as any, frequency || "once", extras);
    const bookingNumber = generateBookingNumber();

    // Asociar a usuario autenticado o crear cuenta de cliente automática
    let userId = (session?.user as any)?.id;
    const targetEmail = (session?.user?.email || customerEmail).trim().toLowerCase();

    // Detectar si el usuario es nuevo para enviarle también el email de bienvenida
    let isNewCustomer = false;
    if (targetEmail) {
      let existingUser: any = null;
      try {
        existingUser = await supabaseGetUserByEmail(targetEmail);
      } catch (e) {
        existingUser = getUserByEmail(targetEmail);
      }

      if (!existingUser) {
        isNewCustomer = true;
        try {
          existingUser = await supabaseCreateUser({
            name: customerName,
            email: targetEmail,
            phone: customerPhone,
            role: "CUSTOMER",
            password: "cliente" + Math.random().toString(36).substring(2, 8),
          });
          try {
            createUser({
              name: customerName,
              email: targetEmail,
              phone: customerPhone,
              role: "CUSTOMER",
              password: "cliente" + Math.random().toString(36).substring(2, 8),
            });
          } catch (e) {}
        } catch (e) {
          try {
            existingUser = createUser({
              name: customerName,
              email: targetEmail,
              phone: customerPhone,
              role: "CUSTOMER",
              password: "cliente" + Math.random().toString(36).substring(2, 8),
            });
          } catch (e2) {}
        }
      } else if (existingUser) {
        // Si el usuario ya existe pero aún no tiene teléfono (o dirección) guardado, guardarlo para futuras reservas
        const hasNoPhone = !existingUser.phone || existingUser.phone.trim() === "";
        const hasNoAddress = (!existingUser.address || existingUser.address.trim() === "") && address;

        if (hasNoPhone || hasNoAddress) {
          const profileUpdate: any = {};
          if (hasNoPhone && customerPhone) profileUpdate.phone = customerPhone;
          if (hasNoAddress && address) profileUpdate.address = address;

          try {
            await supabaseUpdateUser(existingUser.id, profileUpdate);
          } catch (e) {}
          try {
            updateUserProfile(existingUser.id, profileUpdate);
          } catch (e) {}
        }
      }

      if (existingUser) {
        userId = existingUser.id;
      }
    }

    let booking: any = null;
    try {
      booking = await supabaseCreateBooking({
        userId: userId || undefined,
        customerName,
        customerPhone,
        customerEmail: targetEmail,
        address,
        latitude: latitude ? parseFloat(latitude.toString()) : undefined,
        longitude: longitude ? parseFloat(longitude.toString()) : undefined,
        serviceHours: Number(serviceHours),
        frequency: frequency || "once",
        extras,
        serviceDate,
        serviceTime,
        totalPrice: pricing.finalPrice,
        discount: pricing.discountAmount,
        paymentMethod,
        notes: notes || undefined,
      });

      // Sincronizar en local por respaldo
      try {
        createBooking({
          bookingNumber: booking.bookingNumber || bookingNumber,
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
      } catch (e) {}
    } catch (e) {
      booking = createBooking({
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
    }

    // Enviar notificación por correo al Administrador y al Cliente (+ Bienvenida si es nuevo cliente)
    try {
      const emailPromises: Promise<any>[] = [
        sendNewBookingAdminNotification(booking),
        sendBookingConfirmationToCustomer(booking),
      ];
      if (isNewCustomer && targetEmail) {
        emailPromises.push(sendWelcomeEmail({ email: targetEmail, name: customerName }));
      }
      await Promise.allSettled(emailPromises);
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
