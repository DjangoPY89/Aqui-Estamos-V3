import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteBooking, getBookingById, updateBooking, getAllEmployees } from "@/lib/db";
import {
  supabaseDeleteBooking,
  supabaseGetBookingById,
  supabaseUpdateBooking,
  supabaseGetAllEmployees,
} from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

async function enrichSingleBooking(booking: any) {
  if (!booking) return null;
  let cleaner: any = null;
  if (booking.assignedCleaner) {
    let employees: any[] = [];
    try {
      employees = await supabaseGetAllEmployees();
    } catch (e) {
      try {
        employees = getAllEmployees();
      } catch (e2) {}
    }

    const target = booking.assignedCleaner.trim().toLowerCase();
    cleaner = employees.find((e) => 
      (e.id && e.id.toLowerCase() === target) ||
      (e.name && e.name.toLowerCase() === target) ||
      (e.name && target.includes(e.name.toLowerCase())) ||
      (e.name && e.name.toLowerCase().includes(target))
    );
  }

  return {
    ...booking,
    employeeName: cleaner?.name || booking.assignedCleaner || null,
    employeePhone: cleaner?.phone || null,
    employeeImage: cleaner?.image || null,
    employeeRating: cleaner?.rating !== undefined && cleaner?.rating !== null ? cleaner.rating : 5.0,
    employeeZone: cleaner?.zone || null,
    employeeIps: cleaner?.ipsVerified ?? true,
  };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    let booking: any = null;
    try {
      booking = await supabaseGetBookingById(params.id);
    } catch (e) {
      booking = getBookingById(params.id);
    }

    if (!booking) {
      booking = getBookingById(params.id);
    }

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    const enriched = await enrichSingleBooking(booking);
    return NextResponse.json({ booking: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    let booking: any = null;
    try {
      booking = await supabaseGetBookingById(params.id);
    } catch (e) {
      booking = getBookingById(params.id);
    }

    if (!booking) {
      booking = getBookingById(params.id);
    }

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    const body = await req.json();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    // Si es cliente, solo puede cancelar o solicitar reprogramación si es su reserva
    if (userRole !== "ADMIN") {
      const isOwner = booking.userId === userId || (booking.customerEmail && session?.user?.email && booking.customerEmail.toLowerCase() === session.user.email.toLowerCase());
      if (!isOwner) {
        return NextResponse.json({ error: "No autorizado para modificar esta reserva." }, { status: 403 });
      }

      // El cliente solo puede cancelar o reprogramar fecha/hora
      const allowedUpdates: any = {};
      if (body.status === "CANCELLED") {
        // Validar reglas de cancelación por tipo de reserva
        const now = Date.now();
        const createdTime = new Date(booking.createdAt).getTime();
        const isBatch = Boolean(booking.batchId || booking.frequency === "multi_weekly" || booking.frequency === "custom" || booking.frequency === "weekly_2_4");
        const isRecurring = Boolean(booking.subscriptionId || ["weekly", "biweekly", "monthly", "semanal", "quincenal", "mensual"].includes(booking.frequency));

        if (isBatch) {
          const hoursSinceCreated = (now - createdTime) / (1000 * 60 * 60);
          if (hoursSinceCreated > 48) {
            return NextResponse.json(
              { error: "Han transcurrido más de 48 horas desde la reserva. Para cambios o cancelaciones por favor comunícate con Atención al Cliente." },
              { status: 400 }
            );
          }
        } else if (!isRecurring) {
          // Reserva única vez: debe cancelarse al menos 48hs antes del servicio
          const serviceDateTime = new Date(`${booking.serviceDate}T${booking.serviceTime || "08:00"}:00`).getTime();
          const hoursUntilService = (serviceDateTime - now) / (1000 * 60 * 60);
          if (hoursUntilService < 48) {
            return NextResponse.json(
              { error: "Las reservas de servicio único solo pueden cancelarse con al menos 48 horas de anticipación. Por favor comunícate con Atención al Cliente." },
              { status: 400 }
            );
          }
        }

        allowedUpdates.status = "CANCELLED";
      }
      if (body.serviceDate) allowedUpdates.serviceDate = body.serviceDate;
      if (body.serviceTime) allowedUpdates.serviceTime = body.serviceTime;
      if (body.notes) allowedUpdates.notes = body.notes;

      let updated: any = null;
      try {
        updated = await supabaseUpdateBooking(params.id, allowedUpdates);
        try {
          updateBooking(params.id, allowedUpdates);
        } catch (e) {}
      } catch (e) {
        updated = updateBooking(params.id, allowedUpdates);
      }

      return NextResponse.json({ message: "Reserva actualizada.", booking: updated });
    }

    // Si es administrador, puede actualizar cualquier campo
    const adminUpdates = {
      status: body.status,
      assignedCleaner: body.assignedCleaner,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      serviceHours: body.serviceHours,
      frequency: body.frequency,
      totalPrice: body.totalPrice,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus,
      notes: body.notes,
      serviceDate: body.serviceDate,
      serviceTime: body.serviceTime,
    };

    let updated: any = null;
    try {
      updated = await supabaseUpdateBooking(params.id, adminUpdates);
      try {
        updateBooking(params.id, adminUpdates);
      } catch (e) {}
    } catch (e) {
      updated = updateBooking(params.id, adminUpdates);
    }

    return NextResponse.json({ message: "Reserva actualizada por administración.", booking: updated });
  } catch (error: any) {
    console.error("Error al actualizar reserva:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado. Se requiere rol de administrador." }, { status: 403 });
    }

    let success = false;
    try {
      success = await supabaseDeleteBooking(params.id);
      try {
        deleteBooking(params.id);
      } catch (e) {}
    } catch (e) {
      success = deleteBooking(params.id);
    }

    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar la reserva." }, { status: 500 });
    }

    return NextResponse.json({ message: "Reserva eliminada exitosamente." });
  } catch (error: any) {
    console.error("Error al eliminar reserva:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
