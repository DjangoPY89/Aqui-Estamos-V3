import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  supabaseGetBookings,
  supabaseCancelSubscriptionBookings,
  supabaseDeleteBatchBookings,
} from "@/lib/supabase-db";
import { getBookings, deleteBooking } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const { action, subscriptionId, batchId } = body;
    const userRole = (session.user as any)?.role;
    const userEmail = session.user.email?.toLowerCase();
    const userId = (session.user as any)?.id;
    const isAdmin = userRole === "ADMIN";

    // 1. CANCELAR SUSCRIPCIÓN RECURRENTE (Semanal, Quincenal, Mensual)
    if (action === "cancel_subscription" || subscriptionId) {
      const subId = subscriptionId || body.id;
      if (!subId) {
        return NextResponse.json({ error: "ID de suscripción no especificado." }, { status: 400 });
      }

      // Obtener reservas vinculadas
      let allBookings: any[] = [];
      try {
        allBookings = await supabaseGetBookings();
      } catch (e) {
        allBookings = getBookings();
      }

      const subBookings = allBookings.filter((b) => b.subscriptionId === subId);
      if (subBookings.length === 0) {
        return NextResponse.json({ error: "No se encontraron reservas para esta suscripción." }, { status: 404 });
      }

      // Verificar pertenencia si no es admin
      if (!isAdmin) {
        const isOwner = subBookings.some(
          (b) => b.userId === userId || (b.customerEmail && b.customerEmail.toLowerCase() === userEmail)
        );
        if (!isOwner) {
          return NextResponse.json({ error: "No tienes permiso para cancelar esta suscripción." }, { status: 403 });
        }
      }

      // Cancelar/eliminar reservas futuras que no estén COMPLETED ni IN_PROGRESS
      let cancelledCount = 0;
      try {
        const res = await supabaseCancelSubscriptionBookings(subId);
        cancelledCount = res.cancelledCount;
      } catch (e) {
        const today = new Date().toISOString().slice(0, 10);
        const toRemove = subBookings.filter(
          (b) => b.serviceDate >= today && b.status !== "COMPLETED" && b.status !== "IN_PROGRESS"
        );
        for (const b of toRemove) {
          deleteBooking(b.id);
          cancelledCount++;
        }
      }

      return NextResponse.json({
        message: `Suscripción cancelada exitosamente. Se han cancelado ${cancelledCount} citas futuras.`,
        cancelledCount,
      });
    }

    // 2. ELIMINAR / CANCELAR LOTE DE RESERVAS (+1 vez por semana, Personalizado)
    if (action === "delete_batch" || batchId) {
      const bId = batchId || body.id;
      if (!bId) {
        return NextResponse.json({ error: "ID de lote no especificado." }, { status: 400 });
      }

      let allBookings: any[] = [];
      try {
        allBookings = await supabaseGetBookings();
      } catch (e) {
        allBookings = getBookings();
      }

      const batchBookings = allBookings.filter((b) => b.batchId === bId);
      if (batchBookings.length === 0) {
        return NextResponse.json({ error: "No se encontraron reservas para este lote." }, { status: 404 });
      }

      if (!isAdmin) {
        const isOwner = batchBookings.some(
          (b) => b.userId === userId || (b.customerEmail && b.customerEmail.toLowerCase() === userEmail)
        );
        if (!isOwner) {
          return NextResponse.json({ error: "No tienes permiso para modificar este lote." }, { status: 403 });
        }

        // Validar límite de 48 horas desde la contratación
        const first = batchBookings[0];
        const createdTime = new Date(first.createdAt).getTime();
        const hoursSinceCreation = (Date.now() - createdTime) / (1000 * 60 * 60);
        if (hoursSinceCreation > 48) {
          return NextResponse.json(
            {
              error: "Han transcurrido más de 48 horas desde que se realizó la reserva. Para cambios o cancelaciones por favor contacta a Atención al Cliente.",
            },
            { status: 400 }
          );
        }
      }

      let deletedCount = 0;
      try {
        const res = await supabaseDeleteBatchBookings(bId, isAdmin);
        deletedCount = res.deletedCount;
      } catch (e) {
        const eligible = batchBookings.filter((b) => {
          if (isAdmin) {
            return b.status !== "COMPLETED" && b.status !== "CONFIRMED" && b.status !== "IN_PROGRESS";
          }
          return b.status !== "COMPLETED" && b.status !== "IN_PROGRESS";
        });
        for (const b of eligible) {
          deleteBooking(b.id);
          deletedCount++;
        }
      }

      return NextResponse.json({
        message: `Se han eliminado ${deletedCount} reservas asociadas al lote.`,
        deletedCount,
      });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    console.error("Error en operación de lote de reservas:", error);
    return NextResponse.json({ error: error.message || "Error al procesar la solicitud." }, { status: 500 });
  }
}
