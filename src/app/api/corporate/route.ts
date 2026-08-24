import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCorporateLead, getCorporateLeads, updateCorporateLeadStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const leads = getCorporateLeads();
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, ruc, facilityType, contactName, phone, email, requirements } = body;

    if (!companyName || !facilityType || !contactName || !phone) {
      return NextResponse.json(
        { error: "Por favor completa la razón social, tipo de instalación, contacto y teléfono." },
        { status: 400 }
      );
    }

    const lead = createCorporateLead({
      companyName,
      ruc: ruc || null,
      facilityType,
      contactName,
      phone,
      email: email || null,
      requirements: requirements || null,
    });

    return NextResponse.json(
      {
        message: "¡Solicitud corporativa recibida! Un asesor de Aquí Estamos se comunicará a la brevedad.",
        lead,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al registrar lead corporativo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID y nuevo estado son obligatorios." }, { status: 400 });
    }

    const updated = updateCorporateLeadStatus(id, status);
    return NextResponse.json({ message: "Estado de lead actualizado.", lead: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
