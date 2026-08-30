import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReview, getReviews, updateBooking, getBookingById, getAllEmployees, updateEmployee } from "@/lib/db";
import {
  supabaseCreateReview,
  supabaseGetAllReviews,
  supabaseUpdateBooking,
  supabaseGetAllEmployees,
  supabaseGetAllBookings,
  supabaseUpdateEmployee,
} from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let reviews: any[] = [];
    try {
      reviews = await supabaseGetAllReviews();
    } catch (e) {
      reviews = getReviews();
    }
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { bookingId, rating, comment, serviceType, userName, cleanerName } = body;

    const numRating = Number(rating);
    if (!numRating || !comment) {
      return NextResponse.json({ error: "Calificación y comentario son obligatorios." }, { status: 400 });
    }

    const name = session?.user?.name || userName || "Cliente Satisfecho";
    const image = session?.user?.image || null;
    const userId = (session?.user as any)?.id || "guest";

    // 1. Guardar la reseña pública / testimonial
    let review: any = null;
    try {
      review = await supabaseCreateReview({
        userId,
        userName: name,
        userImage: image || undefined,
        rating: numRating,
        comment,
        serviceType: serviceType || "Servicio Residencial",
      });
      try {
        createReview({
          userId,
          userName: name,
          userImage: image,
          rating: numRating,
          comment,
          serviceType: serviceType || "Servicio Residencial",
        });
      } catch (e) {}
    } catch (e) {
      review = createReview({
        userId,
        userName: name,
        userImage: image,
        rating: numRating,
        comment,
        serviceType: serviceType || "Servicio Residencial",
      });
    }

    // 2. Conectar y persistir la calificación en la reserva específica y al empleado asignado en Supabase
    if (bookingId) {
      const now = new Date().toISOString();
      let assignedCleanerName = cleanerName || null;

      try {
        const localBk = updateBooking(bookingId, {
          rating: numRating,
          reviewComment: comment,
          reviewedAt: now,
        });
        if (!assignedCleanerName && localBk?.assignedCleaner) {
          assignedCleanerName = localBk.assignedCleaner;
        }
      } catch (e) {}

      try {
        const supaBk = await supabaseUpdateBooking(bookingId, {
          rating: numRating,
          reviewComment: comment,
          reviewedAt: now,
        });
        if (!assignedCleanerName && supaBk?.assignedCleaner) {
          assignedCleanerName = supaBk.assignedCleaner;
        }
      } catch (e) {}

      // 3. Si hay una empleada asignada, actualizar su calificación en Supabase
      if (assignedCleanerName) {
        try {
          const employees = await supabaseGetAllEmployees();
          const emp = employees.find(
            (e) =>
              e.name.toLowerCase().includes(assignedCleanerName!.toLowerCase()) ||
              assignedCleanerName!.toLowerCase().includes(e.name.toLowerCase())
          );

          if (emp) {
            const bookings = await supabaseGetAllBookings();
            const empRatedBookings = bookings.filter(
              (b) =>
                b.assignedCleaner &&
                (b.assignedCleaner.toLowerCase().includes(emp.name.toLowerCase()) ||
                  emp.name.toLowerCase().includes(b.assignedCleaner.toLowerCase())) &&
                b.rating &&
                Number(b.rating) > 0
            );

            const sumRating = empRatedBookings.reduce((sum, b) => sum + Number(b.rating), 0);
            const avgRating =
              empRatedBookings.length > 0
                ? Number((sumRating / empRatedBookings.length).toFixed(1))
                : numRating;

            await supabaseUpdateEmployee(emp.id, {
              rating: avgRating,
            });

            try {
              updateEmployee(emp.id, {
                rating: avgRating,
                reviewCount: empRatedBookings.length,
              });
            } catch (e) {}
          }
        } catch (err) {
          console.error("Error al actualizar rating del empleado en Supabase:", err);
        }
      }
    }

    return NextResponse.json({ message: "¡Gracias por tu reseña!", review, ok: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
