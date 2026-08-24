import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReview, getReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = getReviews();
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { rating, comment, serviceType, userName } = body;

    if (!rating || !comment) {
      return NextResponse.json({ error: "Calificación y comentario son obligatorios." }, { status: 400 });
    }

    const name = session?.user?.name || userName || "Cliente Satisfecho";
    const image = session?.user?.image || null;
    const userId = (session?.user as any)?.id || "guest";

    const review = createReview({
      userId,
      userName: name,
      userImage: image,
      rating: Number(rating),
      comment,
      serviceType: serviceType || "Servicio Residencial",
    });

    return NextResponse.json({ message: "¡Gracias por tu reseña!", review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
