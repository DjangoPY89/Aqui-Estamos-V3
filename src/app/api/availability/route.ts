import { NextResponse } from 'next/server';
import { checkDateAvailability, fetchGlobalAvailabilitySettings } from '@/lib/availability';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    // Si se pasa una fecha puntual, devolver el análisis detallado de esa fecha
    if (date) {
      const check = await checkDateAvailability(date);
      return NextResponse.json(
        { success: true, check },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    // Si no se especifica fecha, devolver las reglas generales de disponibilidad
    const settings = await fetchGlobalAvailabilitySettings();
    return NextResponse.json(
      {
        success: true,
        settings: {
          workingDays: settings.workingDays,
          timeSlots: settings.timeSlots.filter((s) => s.enabled),
          blockedDates: settings.blockedDates.filter((b) => b.enabled),
          allowSundayBookings: settings.allowSundayBookings,
          allowHolidayBookings: settings.allowHolidayBookings,
          minAdvanceHours: settings.minAdvanceHours,
          maxAdvanceDays: settings.maxAdvanceDays,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: error.message || 'Error al consultar disponibilidad' },
      { status: 500 }
    );
  }
}
