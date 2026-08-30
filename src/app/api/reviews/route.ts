import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  createReview, 
  getReviews, 
  updateBooking, 
  getBookingById, 
  getBookings, 
  getAllEmployees, 
  updateEmployee 
} from "@/lib/db";
import { 
  supabaseCreateReview, 
  supabaseGetAllReviews, 
  supabaseUpdateBooking, 
  supabaseGetAllEmployees, 
  supabaseUpdateEmployee 
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
    const { rating, comment, serviceType, userName, bookingId } = body;

    if (!rating || !comment) {
      return NextResponse.json({ error: "Calificación y comentario son obligatorios." }, { status: 400 });
    }

    const name = session?.user?.name || userName || "Cliente Satisfecho";
    const image = session?.user?.image || null;
    const userId = (session?.user as any)?.id || "guest";
    const numRating = Number(rating);

    // 1. Guardar reseña pública en el repositorio de reviews
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

    // 2. Conectar directamente con la reserva en el Historial de Limpieza
    if (bookingId) {
      try {
        updateBooking(bookingId, {
          rating: numRating,
          reviewComment: comment,
        } as any);
        try {
          await supabaseUpdateBooking(bookingId, {
            rating: numRating,
            reviewComment: comment,
          } as any);
        } catch (e) {}

        // 3. Conectar y actualizar la calificación del empleado asignado en Personal & IPS
        const booking = getBookingById(bookingId);
        if (booking && booking.assignedCleaner) {
          const cleanerName = booking.assignedCleaner.trim().toLowerCase();
          const allBookings = getBookings();
          
          // Filtrar todas las reservas calificadas del empleado
          const empBookings = allBookings.filter(
            (b) =>
              b.assignedCleaner &&
              b.assignedCleaner.toLowerCase().includes(cleanerName) &&
              (b as any).rating &&
              (b as any).rating > 0
          );

          if (empBookings.length > 0) {
            const sum = empBookings.reduce((acc, b) => acc + Number((b as any).rating), 0);
            const newAvg = Number((sum / empBookings.length).toFixed(1));
            
            const employees = getAllEmployees();
            const targetEmp = employees.find((emp) =>
              emp.name.toLowerCase().includes(cleanerName) || cleanerName.includes(emp.name.toLowerCase())
            );

            if (targetEmp) {
              updateEmployee(targetEmp.id, { rating: newAvg });
              try {
                await supabaseUpdateEmployee(targetEmp.id, { rating: newAvg });
              } catch (e) {}
            }
          }
        }
      } catch (errBooking) {
        console.error("Error al vincular calificación con reserva y empleado:", errBooking);
      }
    }

    return NextResponse.json({ message: "¡Gracias por tu reseña!", review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
