import { NextResponse } from "next/server";
import { seedInitialData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    seedInitialData();
    return NextResponse.json({ message: "Base de datos inicializada y sembrada con éxito." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
