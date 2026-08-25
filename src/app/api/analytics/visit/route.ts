import { NextResponse } from "next/server";
import { recordPageVisit, getSiteVisitsStats } from "@/lib/db";
import { supabaseRecordPageVisit, supabaseGetSiteVisitsStats } from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body?.path === "string" ? body.path : "/";

    let todayCount = 0;
    try {
      const supaCount = await supabaseRecordPageVisit(path);
      if (supaCount !== null) {
        todayCount = supaCount;
      } else {
        todayCount = recordPageVisit(path);
      }
    } catch (e) {
      todayCount = recordPageVisit(path);
    }

    return NextResponse.json({ ok: true, todayVisits: todayCount });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    let stats: any = null;
    try {
      stats = await supabaseGetSiteVisitsStats();
      if (!stats) {
        stats = getSiteVisitsStats();
      }
    } catch (e) {
      stats = getSiteVisitsStats();
    }

    return NextResponse.json({
      ok: true,
      totalVisits: stats?.totalVisits || 0,
      todayVisits: stats?.todayVisits || 0,
      dailyVisits: stats?.dailyVisits || {},
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
