import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReview, getReviews, updateBooking, getBookingById, getAllEmployees, updateEmployee } from "@/lib/db";
import {
  supabaseCreateReview,
  supabaseGetAllReviews,
  supabaseUpdateBooking,
  supabaseGetBookingById,
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

    let assignedCleanerName = cleanerName && !cleanerName.includes("Profesional de Cuadrilla") && !cleanerName.includes("Cuadrilla Oficial") ? cleanerName : null;

    // Validar que el servicio no haya sido calificado previamente y obtener el empleado asignado
    if (bookingId) {
      let existingBooking: any = null;
      try {
        existingBooking = await supabaseGetBookingById(bookingId);
      } catch (e) {}
      if (!existingBooking) {
        try {
          existingBooking = getBookingById(bookingId);
        } catch (e) {}
      }

      if (existingBooking) {
        if (existingBooking.rating && Number(existingBooking.rating) > 0) {
          return NextResponse.json(
            { error: "Este servicio ya ha sido calificado previamente. Solo se permite una calificación por servicio.", alreadyReviewed: true },
            { status: 400 }
          );
        }
        if (!assignedCleanerName && existingBooking.assignedCleaner) {
          assignedCleanerName = existingBooking.assignedCleaner;
        }
      }
    }

    const name = session?.user?.name || userName || "Cliente Satisfecho";
    const image = session?.user?.image || null;
    const userId = (session?.user as any)?.id || "guest";

    const effectiveServiceType = assignedCleanerName
      ? (serviceType && !serviceType.includes("Profesional de Cuadrilla") && !serviceType.includes("Cuadrilla Oficial")
          ? serviceType
          : `Servicio de Limpieza - ${assignedCleanerName}`)
      : (serviceType || "Servicio Residencial");

    // 1. Guardar la reseña pública / testimonial
    let review: any = null;
    try {
      review = await supabaseCreateReview({
        userId,
        userName: name,
        userImage: image || undefined,
        rating: numRating,
        comment,
        serviceType: effectiveServiceType,
      });
      try {
        createReview({
          userId,
          userName: name,
          userImage: image,
          rating: numRating,
          comment,
          serviceType: effectiveServiceType,
        });
      } catch (e) {}
    } catch (e) {
      review = createReview({
        userId,
        userName: name,
        userImage: image,
        rating: numRating,
        comment,
        serviceType: effectiveServiceType,
      });
    }

    // 2. Conectar y persistir la calificación en la reserva específica y al empleado asignado en Supabase
    if (bookingId) {
      const now = new Date().toISOString();

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

      // 3. Si hay una empleada asignada, actualizar su historial y promedio en Supabase
      if (assignedCleanerName) {
        try {
          const employees = await supabaseGetAllEmployees();
          const emp = employees.find(
            (e) =>
              e.name.toLowerCase().includes(assignedCleanerName!.toLowerCase()) ||
              assignedCleanerName!.toLowerCase().includes(e.name.toLowerCase())
          );

          if (emp) {
            const prevHistory = emp.ratingsHistory || [];
            const newEntry = {
              rating: numRating,
              comment,
              customerName: name,
              createdAt: now,
            };
            const updatedHistory = [...prevHistory, newEntry];

            const [allBookings, allReviews] = await Promise.all([
              supabaseGetAllBookings(),
              supabaseGetAllReviews(),
            ]);

            const empRatedBookings = allBookings.filter(
              (b) =>
                b.assignedCleaner &&
                (b.assignedCleaner.toLowerCase().includes(emp.name.toLowerCase()) ||
                  emp.name.toLowerCase().includes(b.assignedCleaner.toLowerCase())) &&
                b.rating &&
                Number(b.rating) > 0
            );

            const empReviews = allReviews.filter(
              (r) =>
                (r.serviceType && r.serviceType.toLowerCase().includes(emp.name.toLowerCase())) ||
                (r.comment && r.comment.toLowerCase().includes(emp.name.toLowerCase()))
            );

            const allRatings: number[] = [
              ...updatedHistory.map((h) => Number(h.rating)),
              ...empReviews.map((r) => Number(r.rating)),
              ...empRatedBookings.map((b) => Number(b.rating)),
            ].filter((n) => !isNaN(n) && n > 0);

            const totalCount = allRatings.length;
            const sumRatings = allRatings.reduce((sum, val) => sum + val, 0);
            const avgRating = totalCount > 0 ? Number((sumRatings / totalCount).toFixed(1)) : numRating;

            await supabaseUpdateEmployee(emp.id, {
              rating: avgRating,
            });

            try {
              updateEmployee(emp.id, {
                rating: avgRating,
                reviewCount: totalCount,
                ratingsHistory: updatedHistory,
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
