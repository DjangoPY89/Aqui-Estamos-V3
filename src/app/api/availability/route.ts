import { NextResponse } from 'next/server';
import { checkDateAvailability, getAvailabilitySettings } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    // Si se pasa una fecha puntual, devolver el análisis detallado de esa fecha
    if (date) {
      const check = await checkDateAvailability(date);
      return NextResponse.json({ success: true, check });
    }

    // Si no se especifica fecha, devolver las reglas generales de disponibilidad
    const settings = getAvailabilitySettings();
    return NextResponse.json({
      success: true,
      settings: {
        workingDays: settings.workingDays,
        timeSlots: settings.timeSlots.filter(s => s.enabled),
        blockedDates: settings.blockedDates.filter(b => b.enabled),
        allowSundayBookings: settings.allowSundayBookings,
        allowHolidayBookings: settings.allowHolidayBookings,
        minAdvanceHours: settings.minAdvanceHours,
        maxAdvanceDays: settings.maxAdvanceDays,
      }
    });
  } catch (error: any) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: error.message || 'Error al consultar disponibilidad' },
      { status: 500 }
    );
  }
}
