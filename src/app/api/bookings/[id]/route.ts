import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteBooking, getBookingById, updateBooking } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    return NextResponse.json({ booking });
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
    const booking = getBookingById(params.id);

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    const body = await req.json();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    // Si es cliente, solo puede cancelar o solicitar reprogramación si es su reserva
    if (userRole !== "ADMIN") {
      const isOwner = booking.userId === userId || booking.customerEmail === session?.user?.email;
      if (!isOwner) {
        return NextResponse.json({ error: "No autorizado para modificar esta reserva." }, { status: 403 });
      }

      // El cliente solo puede cancelar o reprogramar fecha/hora
      const allowedUpdates: any = {};
      if (body.status === "CANCELLED") {
        allowedUpdates.status = "CANCELLED";
      }
      if (body.serviceDate) allowedUpdates.serviceDate = body.serviceDate;
      if (body.serviceTime) allowedUpdates.serviceTime = body.serviceTime;
      if (body.notes) allowedUpdates.notes = body.notes;

      const updated = updateBooking(params.id, allowedUpdates);
      return NextResponse.json({ message: "Reserva actualizada.", booking: updated });
    }

    // Si es administrador, puede actualizar cualquier campo
    const updated = updateBooking(params.id, {
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
    });

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

    const booking = getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    const success = deleteBooking(params.id);
    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar la reserva." }, { status: 500 });
    }

    return NextResponse.json({ message: "Reserva eliminada exitosamente." });
  } catch (error: any) {
    console.error("Error al eliminar reserva:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
