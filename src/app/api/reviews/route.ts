import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReview, getReviews, updateBooking, getBookingById, getAllEmployees, updateEmployee } from "@/lib/db";
import { supabaseCreateReview, supabaseGetAllReviews, supabaseUpdateBooking } from "@/lib/supabase-db";

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

    // 2. Conectar y persistir la calificación en la reserva específica y al empleado asignado
    if (bookingId) {
      const now = new Date().toISOString();
      try {
        updateBooking(bookingId, {
          rating: numRating,
          reviewComment: comment,
          reviewedAt: now,
        });
      } catch (e) {}

      try {
        await supabaseUpdateBooking(bookingId, {
          rating: numRating,
          reviewComment: comment,
        } as any);
      } catch (e) {}
    }

    return NextResponse.json({ message: "¡Gracias por tu reseña!", review, ok: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
